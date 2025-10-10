import { fetchMutation, preloadQuery } from 'convex/nextjs';
import { api } from '../../convex/_generated/api';
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server';
import { ConvexUserRaw, normalizeProfile } from '@/types/user';
import { Id } from '../../convex/_generated/dataModel';

export const ProfileQuery = async () => {
  const rawProfile = await preloadQuery(
    api.user.getCurrentUser,
    {},
    { token: await convexAuthNextjsToken() },
  );
  return normalizeProfile(rawProfile._valueJSON as unknown as ConvexUserRaw | null);
};

export const SubscriptionEntitlementQuery = async () => {
  const profile = await ProfileQuery();

  const entitlement = await preloadQuery(
    api.subscription.hasEntitlement,
    { userId: profile?.id as Id<'users'> },
    { token: await convexAuthNextjsToken() },
  );

  return { entitlement, profileName: profile?.name };
};

export const ProjectsQuery = async () => {
  const profile = await ProfileQuery();
  if (!profile?.id) {
    return {
      projects: null,
      profile: null,
    };
  }

  const projects = await preloadQuery(
    api.projects.getUserProjects,
    { userId: profile.id as Id<'users'> },
    { token: await convexAuthNextjsToken() },
  );

  return { projects, profile };
};

export const ProjectByIdQuery = async (projectId: string) => {
  const profile = await ProfileQuery();
  if (!profile?.id) {
    return {
      project: null,
      profile: null,
    };
  }

  const project = await preloadQuery(
    api.projects.getProject,
    { projectId: projectId as Id<'projects'> },
    { token: await convexAuthNextjsToken() },
  );

  return { project, profile };
};

export const StyleGuideQuery = async (projectId: string) => {
  const styleGuide = await preloadQuery(
    api.projects.getProject,
    {
      projectId: projectId as Id<'projects'>,
      isGetStyleGuide: true,
    },
    { token: await convexAuthNextjsToken() },
  );

  return { styleGuide };
};

export const MoodBoardImagesQuery = async (projectId: string) => {
  const images = await preloadQuery(
    api.moodBoard.getMoodBoardImages,
    {
      projectId: projectId as Id<'projects'>,
    },
    { token: await convexAuthNextjsToken() },
  );

  return { images };
};

export const CreditBalanceQuery = async () => {
  const profile = await ProfileQuery();
  if (!profile?.id) {
    return { ok: false, balance: 0, profile: null };
  }

  const balance = await preloadQuery(
    api.subscription.getCreditsBalance,
    { userId: profile.id as Id<'users'> },
    { token: await convexAuthNextjsToken() },
  );

  return { ok: true, balance: balance._valueJSON, profile };
};

export const ConsumeCreditsQuery = async ({ amount }: { amount?: number }) => {
  const profile = await ProfileQuery();
  if (!profile?.id) {
    return { ok: false, balance: 0, profile: null };
  }

  const credits = await fetchMutation(
    api.subscription.consumeCredits,
    {
      reason: 'ai:generation',
      userId: profile.id as Id<'users'>,
      amount: amount || 1,
    },
    { token: await convexAuthNextjsToken() },
  );

  return { ok: credits.ok, balance: credits.balance, profile };
};
