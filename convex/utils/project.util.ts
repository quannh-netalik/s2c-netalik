import { ConvexError } from 'convex/values';
import { Id } from '../_generated/dataModel';
import { MutationCtx, QueryCtx } from '../_generated/server';

const PROJECT_NUMBER_START = 1;

export const getNextProjectNumber = async (ctx: MutationCtx, userId: Id<'users'>): Promise<number> => {
  // Get or create project counter for this user
  const counter = await ctx.db
    .query('project_counters')
    .withIndex('by_userId', (q) => q.eq('userId', userId))
    .first();

  if (!counter) {
    // Create new Counter starting at 1
    await ctx.db.insert('project_counters', {
      userId,
      nextProjectNumber: PROJECT_NUMBER_START + 1,
    });

    return PROJECT_NUMBER_START;
  }

  const projectNumber = counter.nextProjectNumber;

  // Increment counter for next time
  await ctx.db.patch(counter._id, {
    nextProjectNumber: projectNumber + 1,
  });

  return projectNumber;
};

export const getProjectsByUserId = async (
  ctx: MutationCtx | QueryCtx,
  projectId: Id<'projects'>,
  userId: Id<'users'>,
) => {
  const project = await ctx.db.get(projectId);
  if (!project) {
    throw new ConvexError('Project not found');
  }

  if (project.userId !== userId && !project.isPublic) {
    throw new ConvexError('Access denied');
  }

  return project;
};
