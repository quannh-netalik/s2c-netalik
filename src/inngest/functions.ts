import { fetchMutation, fetchQuery } from 'convex/nextjs';

import { api } from '../../convex/_generated/api';
import { inngest } from './client';
import { events } from './events';
import { AutosaveProjectRequest } from '@/redux/api/project';
import { Id } from '../../convex/_generated/dataModel';
import {
  extractOrderLike,
  extractSubscriptionLike,
  grantKey,
  isEntitledStatus,
  isPolarWebhookEvent,
  PolarOrder,
  PolarSubscription,
  ReceivedEvent,
  toMs,
} from '@/lib/polar';

export const autosaveProjectWorkflow = inngest.createFunction(
  { id: events.autosave.id },
  { event: events.autosave.name },
  async ({ event }) => {
    console.log('🚀 [Inngest] Project autosave requested: ', JSON.stringify(event));

    const { projectId, userId, shapesData, viewportData } = <AutosaveProjectRequest>event.data;
    try {
      await fetchMutation(api.projects.updateProjectSketches, {
        projectId: projectId as Id<'projects'>,
        userId: userId as Id<'users'>,
        sketchesData: shapesData,
        viewportData,
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  },
);

export const handlePolarEvent = inngest.createFunction(
  { id: events.polar.id },
  { event: events.polar.name },
  async ({ event, step }) => {
    console.log('🚀 [Inngest] Starting Polar webhook handler:');
    console.log('📦 [Inngest] Raw event data:', JSON.stringify(event.data, null, 2));

    if (!isPolarWebhookEvent(event.data)) {
      return;
    }

    const incoming = event.data as ReceivedEvent;
    const type = incoming.type;
    const dataUnknown = incoming.data;

    const sub: PolarSubscription | null = extractSubscriptionLike(dataUnknown);
    const order: PolarOrder | null = extractOrderLike(dataUnknown);

    if (!sub && !order) {
      return;
    }

    const userId: Id<'users'> | null = await step.run('resolve-user', async () => {
      const metaUserId = (sub?.metadata?.userId ?? order?.metadata?.userId) as string | undefined;

      if (metaUserId) {
        console.log('✅ [Inngest] Using metadata userId:', metaUserId);
        return metaUserId as Id<'users'>;
      }

      const email = (sub?.customer?.email ?? order?.customer?.email) as string | undefined;

      if (!email) {
        console.error('❌ [Inngest] No email found to lookup user');
        return null;
      }

      try {
        console.log('📧 [Inngest] Customer email:', email);

        const foundUserId = await fetchQuery(api.user.getUserIdByEmail, { email });
        console.log('✅ [Inngest] Found userId by email:', foundUserId);

        return foundUserId;
      } catch (error) {
        console.error('❌ [Inngest] Failed to resolve user by email:', error);
        console.error('📧 [Inngest] Email lookup failed for:', email);
        return null;
      }
    });

    if (!userId) {
      console.log('⏭️ [Inngest] No userId resolved, skipping network processing');
      return;
    }

    const polarSubscriptionId = sub?.id ?? order?.subscription_id ?? '';
    console.log('🆔 [Inngest] Polar subscription ID:', polarSubscriptionId);

    if (!polarSubscriptionId) {
      console.log('⏭️ [Inngest] No polarSubscriptionId resolved, skipping network processing');
      return;
    }

    const payload = {
      userId,
      polarCustomerId: sub?.customer?.id ?? sub?.customer_id ?? order?.customer_id ?? '',
      polarSubscriptionId,
      productId: sub?.product_id ?? sub?.product?.id ?? undefined,
      priceId: sub?.prices?.[0]?.id ?? undefined,
      planCode: sub?.plan_code ?? sub?.product?.name ?? undefined,
      status: sub?.status ?? 'updated',
      currentPeriodEnd: toMs(sub?.current_period_end),
      trialEndsAt: toMs(sub?.trial_ends_at),
      canceledAt: toMs(sub?.canceled_at),
      seats: sub?.seats ?? undefined,
      metadata: dataUnknown, // Keep as any to match Convex schema
      creditsGrantPerPeriod: 10,
      creditsRolloverLimit: 100,
    };

    console.log('📋 [Inngest] Subscription payload: ', JSON.stringify(payload, null, 2));

    const subscriptionId = await step.run('upsert-subscription', async () => {
      try {
        console.log('💾 [Inngest] Upserting subscription to Convex...');
        console.log('🔍 [Inngest] Checking for existing subscriptions first...');

        const existingByPolar = await fetchQuery(api.subscription.getByPolarId, {
          polarSubscriptionId,
        });

        console.log(
          '📊 [Inngest] Existing subscription by PolarId:',
          existingByPolar ? 'Found' : 'None',
        );

        const upsertResult = await fetchMutation(api.subscription.upsertFromPolar, payload);
        return upsertResult;
      } catch (error) {
        console.error('❌ [Inngest] Failed to upsert subscriptions:', error);
        console.error('📋 [Inngest] Failed payload:', JSON.stringify(payload, null, 2));
        throw error;
      }
    });

    const looksCreate = /subscription\.created/i.test(type);
    const looksRenew = /subscription\.renew|order\.created|invoice\.paid|order\.paid/i.test(type);

    const entitled = isEntitledStatus(payload.status);

    console.log('🎯 [Inngest] Credit granting analysis:');
    console.log('  - Event type:', type);
    console.log('  - Looks like create:', looksCreate);
    console.log('  - Looks like renew:', looksRenew);
    console.log('  - User entitled:', entitled);
    console.log('  - Status:', payload.status);

    const idempotencyKey = grantKey(polarSubscriptionId, payload.currentPeriodEnd, incoming.id);
    console.log('🔑 [Inngest] Idempotency key:', idempotencyKey);

    /* allow on first known period */
    if (entitled && (looksCreate || looksRenew || true)) {
      const grant = await step.run('grant-credits', async () => {
        try {
          console.log('💾 [Inngest] Granting credits to subscription:', subscriptionId);

          const result = await fetchMutation(api.subscription.granCreditsIfNeeded, {
            subscriptionId,
            idempotencyKey,
            amount: 10,
            reason: looksCreate ? 'initial-grant' : 'periodic-grant',
          });

          console.log('✅ [Inngest] Credits granted successfully', result);
          return result;
        } catch (error) {
          console.error('❌ [Inngest] Failed to grant credits:', error);
          throw error;
        }
      });

      console.log('📊 [Inngest] Grant result:', grant);

      if (grant.ok && !('skipped' in grant && grant.skipped)) {
        await step.sendEvent('credits-granted', {
          name: 'billing/credit.granted',
          id: `credits-granted:${polarSubscriptionId}:${payload.currentPeriodEnd ?? 'first'}`,
          data: {
            userId,
            amount: 'granted' in grant ? (grant.granted ?? 10) : 10,
            balance: 'balance' in grant ? grant.balance : undefined,
            periodEnd: payload.currentPeriodEnd,
          },
        });
        console.log('✅ [Inngest] Credits-granted event sent');
      } else {
        console.log('⏭️ [Inngest] Credit grant was skipped or failed');
      }
    } else {
      console.log('⏭️ [Inngest] Credit granting conditions not met');
    }

    await step.sendEvent('sub-synced', {
      name: 'billing/credit.synced',
      id: `sub-synced:${polarSubscriptionId}:${payload.currentPeriodEnd ?? 'first'}`,
      data: {
        userId,
        polarSubscriptionId,
        status: payload.status,
        periodEnd: payload.currentPeriodEnd,
      },
    });

    console.log('✅ [Inngest] Subscription synced event sent');

    if (payload.currentPeriodEnd && payload.currentPeriodEnd > Date.now()) {
      const runAt = new Date(
        Math.max(Date.now() + 5000, payload.currentPeriodEnd - 3 * 24 * 60 * 60 * 1000),
      );

      await step.sleepUntil('wait-until-expiry', runAt);

      const stillEntitled = await step.run('check-entitlement', async () => {
        try {
          const result = await fetchQuery(api.subscription.hasEntitlement, { userId });
          console.log('✅ [Inngest] Entitlement status:', result);
          return result;
        } catch (error) {
          console.error('❌ [Inngest] Failed to check entitlement:', error);
          throw error;
        }
      });

      if (stillEntitled) {
        await step.sendEvent('pre-expiry', {
          name: 'billing/subscription.pre_expiry',
          data: {
            userId,
            runAt: runAt.toISOString(),
            periodEnd: payload.currentPeriodEnd,
          },
        });
      }
    }
  },
);
