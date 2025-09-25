import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import { mutation, MutationCtx, query } from './_generated/server';
import { Id } from './_generated/dataModel';

export const getProject = query({
  args: {
    projectId: v.id('projects'),
    isGetStyleGuide: v.optional(v.boolean()),
  },
  handler: async (ctx, { projectId, isGetStyleGuide }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Not authenticated');
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (project.userId !== userId && !project.isPublic) {
      throw new Error('Access denied');
    }

    if (isGetStyleGuide) {
      return project.styleGuide ? JSON.parse(project.styleGuide) : null;
    }

    return project;
  },
});

export const createProject = mutation({
  args: {
    userId: v.id('users'),
    name: v.optional(v.string()),
    sketchesData: v.any(),
    thumbnail: v.optional(v.string()),
  },
  handler: async (ctx, { userId, name, sketchesData, thumbnail }) => {
    console.log('🚀 [Convex] Creating project for user:', userId);

    const projectNumber = await getNextProjectNumber(ctx, userId);
    const projectName = name || `Project ${projectNumber}`;

    const projectId = await ctx.db.insert('projects', {
      userId,
      name: projectName,
      sketchesData,
      thumbnail,
      projectNumber,
      lastModified: Date.now(),
      createdAt: Date.now(),
      isPublic: false,
    });

    const result = {
      projectId,
      name: projectName,
      projectNumber,
    };

    console.log('✅ [Convex] Create Project successfully!', result);
    return result;
  },
});

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

export const getUserProjects = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 20 }) => {
    const projects = await ctx.db
      .query('projects')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .order('desc')
      .take(limit);

    return projects.map((project) => ({
      _id: project._id,
      name: project.name,
      projectNumber: project.projectNumber,
      thumbnail: project.thumbnail,
      lastModified: project.lastModified,
      createdAt: project.createdAt,
      isPublic: project.isPublic,
    }));
  },
});
