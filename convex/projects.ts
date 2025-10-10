import { ConvexError, v } from 'convex/values';

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
      try {
        return project.styleGuide ? JSON.parse(project.styleGuide) : null;
      } catch (error) {
        console.error(error);
        return null;
      }
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

export const updateProjectSketches = mutation({
  args: {
    projectId: v.id('projects'),
    userId: v.id('users'),
    sketchesData: v.object({
      shapes: v.any(), // or define specific shape schema
      tool: v.string(),
      selected: v.any(),
      frameCounter: v.number(),
    }),
    viewportData: v.optional(
      v.object({
        scale: v.number(),
        translate: v.object({
          x: v.number(),
          y: v.number(),
        }),
      }),
    ),
  },
  handler: async (ctx, { projectId, userId, sketchesData, viewportData }) => {
    const project = await ctx.db.get(projectId);
    if (!project) throw new ConvexError('Project not found');

    if (project.userId !== userId) {
      throw new ConvexError('Unauthorized: You do not own this project');
    }
    const updateData = {
      sketchesData,
      lastModified: Date.now(),
      ...(viewportData && { viewportData }),
    };

    await ctx.db.patch(projectId, updateData);
    console.log('✅ [Convex] Project autosaved successfully!');
    return { success: true };
  },
});

export const updateProjectStyleGuide = mutation({
  args: {
    projectId: v.id('projects'),
    styleGuideData: v.any(),
  },
  handler: async (ctx, { projectId, styleGuideData }) => {
    console.log('🎨 [Convex] Updating style guide for project:', projectId);
    const userId = await getUserId(ctx);
    await getProjectsByUserId(ctx, projectId, userId);

    await ctx.db.patch(projectId, {
      styleGuide: JSON.stringify(styleGuideData),
      lastModified: Date.now(),
    });

    console.log('✅ [Convex] Style guide updated successfully!');

    return { success: true, styleGuide: styleGuideData };
  },
});
