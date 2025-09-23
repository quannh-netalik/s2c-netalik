import { preloadQuery } from 'convex/nextjs';
import { api } from '../../convex/_generated/api';
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server';
import { ConvexUserRaw, normalizeProfile } from '@/types/user';
import { Id } from '../../convex/_generated/dataModel';

export const ProfileQuery = async () => {
  return await preloadQuery(api.user.getCurrentUser, {}, { token: await convexAuthNextjsToken() });
};

export const getProfile = async () => {
  const rawProfile = await ProfileQuery();
  return normalizeProfile(rawProfile._valueJSON as unknown as ConvexUserRaw | null);
};

export const SubscriptionEntitlementQuery = async () => {
  const profile = await getProfile();

  const entitlement = await preloadQuery(
    api.subscription.hasEntitlement,
    { userId: profile?.id as Id<'users'> },
    { token: await convexAuthNextjsToken() },
  );

  return { entitlement, profileName: profile?.name };
};
