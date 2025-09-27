import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';
import { MutationCtx, QueryCtx } from '../_generated/server';
import { Id } from '../_generated/dataModel';

export const getUserId = async (ctx: QueryCtx | MutationCtx): Promise<Id<'users'>> => {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError('Not authenticated');
  }

  return userId;
};
