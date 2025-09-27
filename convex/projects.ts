import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { getNextProjectNumber, getProjectsByUserId } from './utils/project.util';
import { getUserId } from './utils/user.util';

export const getProject = query({
  args: {
    projectId: v.id('projects'),
    isGetStyleGuide: v.optional(v.boolean()),
  },
  handler: async (ctx, { projectId, isGetStyleGuide }) => {
    const userId = await getUserId(ctx);

    const project = await getProjectsByUserId(ctx, projectId, userId);

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
