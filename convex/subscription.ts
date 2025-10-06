import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Id } from './_generated/dataModel';

const DEFAULT_GRANT = 10;
const DEFAULT_ROLLOVER_LIMIT = 100;
const ENTITLED = new Set(['active', 'trialing']);

export const hasEntitlement = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const now = Date.now();

    const subs = await ctx.db
      .query('subscriptions')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect();

    return subs.some((sub) => {
      const status = String(sub.status || '').toLowerCase();
      const validPeriod = !sub.currentPeriodEnd || sub.currentPeriodEnd > now;

      if (status === 'active' && validPeriod) {
        return true;
      }

      return false;
    });
  },
});

export const getByPolarId = query({
  args: {
    polarSubscriptionId: v.string(),
  },
  handler: async (ctx, { polarSubscriptionId }) => {
    return await ctx.db
      .query('subscriptions')
      .withIndex('by_polarSubscriptionId', (q) => q.eq('polarSubscriptionId', polarSubscriptionId))
      .first();
  },
});

export const getSubscriptionForUser = query({
  args: {
    userId: v.id('users'),
    getAll: v.optional(v.boolean()),
  },
  handler: async (ctx, { userId, getAll }) => {
    const subs = ctx.db
      .query('subscriptions')
      .withIndex('by_userId', (q) => q.eq('userId', userId));

    const result = getAll ? subs.collect() : subs.first();
    return await result;
  },
});

export const getAllForUser = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query('subscriptions')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .collect();
  },
});

export const upsertFromPolar = mutation({
  args: {
    userId: v.id('users'),
    polarCustomerId: v.string(),
    polarSubscriptionId: v.string(),
    productId: v.optional(v.string()),
    priceId: v.optional(v.string()),
    planCode: v.optional(v.string()),
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
    trialEndsAt: v.optional(v.number()),
    cancelAt: v.optional(v.number()),
    seats: v.optional(v.number()),
    metadata: v.optional(v.any()),
    creditsGrantPerPeriod: v.optional(v.number()),
    creditsRolloverLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    console.log('🔍 [Convex] Starting upsertFromPolar for:', {
      userId: args.userId,
      polarSubscriptionId: args.polarSubscriptionId,
      status: args.status,
    });

    const existingByPolar = await ctx.db
      .query('subscriptions')
      .withIndex('by_polarSubscriptionId', (q) =>
        q.eq('polarSubscriptionId', args.polarSubscriptionId),
      )
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .first();

    const base = {
      userId: args.userId as Id<'users'>,
      polarCustomerId: args.polarCustomerId,
      polarSubscriptionId: args.polarSubscriptionId,
      productId: args.productId,
      priceId: args.priceId,
      planCode: args.planCode,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      trialEndsAt: args.trialEndsAt,
      cancelAt: args.cancelAt,
      seats: args.seats,
      metadata: args.metadata,
      creditsGrantPerPeriod:
        args.creditsGrantPerPeriod ?? existingByPolar?.creditsGrantPerPeriod ?? DEFAULT_GRANT,
      creditsRolloverLimit:
        args.creditsRolloverLimit ??
        existingByPolar?.creditsRolloverLimit ??
        DEFAULT_ROLLOVER_LIMIT,
    };

    if (existingByPolar) {
      await ctx.db.patch(existingByPolar._id, base);
      return existingByPolar._id;
    }

    const newId = await ctx.db.insert('subscriptions', {
      ...base,
      creditBalance: 0,
      lastGrantCursor: undefined,
    });

    console.log('✅ [Convex] Created subscription:', newId);
    return newId;
  },
});

export const granCreditsIfNeeded = mutation({
  args: {
    subscriptionId: v.id('subscriptions'),
    idempotencyKey: v.string(), // `${subId}:${periodEndMs || "first"}
    amount: v.optional(v.number()), // Default to sub.creditsGrantPerPeriod
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { subscriptionId, idempotencyKey, amount, reason }) => {
    const dupe = await ctx.db
      .query('credits_ledger')
      .withIndex('by_idempotencyKey', (q) => q.eq('idempotencyKey', idempotencyKey))
      .first();

    if (dupe) {
      return {
        ok: true,
        skipped: true,
        reason: 'duplicate-ledger',
      };
    }

    const sub = await ctx.db.get(subscriptionId);
    if (!sub) {
      return {
        ok: false,
        error: 'subscription-not-found',
      };
    }

    if (sub.lastGrantCursor === idempotencyKey) {
      return {
        ok: true,
        skipped: true,
        reason: 'cursor-match',
      };
    }

    if (!ENTITLED.has(sub.status)) {
      return {
        ok: true,
        skipped: true,
        reason: 'not-entitled',
      };
    }

    const grant = amount ?? sub.creditsGrantPerPeriod ?? DEFAULT_GRANT;
    if (grant <= 0) {
      return {
        ok: true,
        skipped: true,
        reason: 'zero-grant',
      };
    }

    const next = Math.min(
      sub.creditBalance + grant,
      sub.creditsRolloverLimit ?? DEFAULT_ROLLOVER_LIMIT,
    );

    await Promise.all([
      ctx.db.patch(subscriptionId, {
        creditBalance: next,
        lastGrantCursor: idempotencyKey,
      }),

      ctx.db.insert('credits_ledger', {
        userId: sub.userId,
        subscriptionId,
        amount: grant,
        type: 'grant',
        reason: reason ?? 'periodic-grant',
        idempotencyKey,
        meta: { prev: sub.creditBalance, next },
      }),
    ]);

    return {
      ok: true,
      granted: grant,
      balance: next,
    };
  },
});
