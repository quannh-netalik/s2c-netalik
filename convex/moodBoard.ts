import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { Id } from './_generated/dataModel';
import { getUserId } from './utils/user.util';
import { getProjectsByUserId } from './utils/project.util';

export const getMoodBoardImages = query({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const project = await ctx.db.get(projectId);
    if (!project || project.userId.toString() !== userId.toString()) {
      return [];
    }

    const storageIds = project.moodBoardImages || [];
    const images = await Promise.all(
      storageIds.map(async (storageId, index) => {
        try {
          const url = await ctx.storage.getUrl(storageId as Id<'_storage'>);
          return {
            id: `convex-${storageId}`, // Unique ID for client-side tracking
            storageId,
            url,
            uploaded: true,
            uploading: false,
            index, // Preserve order
          };
        } catch (error) {
          console.error(
            `[Convex] Error while querying mood board images - storageId: ${storageId}, index: ${index}`,
            error,
          );
          return null;
        }
      }),
    );

    // Filter out any failed URLs and sort by index
    return images.filter((image) => image !== null).sort((a, b) => a.index - b.index);
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    // Validate user logins
    await getUserId(ctx);

    // Generate upload URL that expires in 1 hour
    return await ctx.storage.generateUploadUrl();
  },
});

export const removeMoodBoardImage = mutation({
  args: {
    projectId: v.id('projects'),
    storageId: v.id('_storage'),
  },
  handler: async (ctx, { projectId, storageId }) => {
    const userId = await getUserId(ctx);
    const project = await getProjectsByUserId(ctx, projectId, userId);

    const currentImages = project.moodBoardImages || [];
    const updatedImages = currentImages.filter((id) => id !== storageId);

    await ctx.db.patch(projectId, {
      moodBoardImages: updatedImages,
      lastModified: Date.now(),
    });

    try {
      await ctx.storage.delete(storageId);
    } catch (error) {
      console.error(`[Convex] Failed to delete mood board image from storage ${storageId}: `, error);
    }

    return {
      success: true,
      imageCount: updatedImages.length,
    };
  },
});

export const addMoodBoardImage = mutation({
  args: {
    projectId: v.id('projects'),
    storageId: v.id('_storage'),
  },
  handler: async (ctx, { projectId, storageId }) => {
    const userId = await getUserId(ctx);
    const project = await getProjectsByUserId(ctx, projectId, userId);

    const currentImages = project.moodBoardImages || [];
    if (currentImages.length > 5) {
      throw new ConvexError('Maximum 5 mood board images allowed');
    }

    const updatedImages = [...currentImages, storageId];
    await ctx.db.patch(projectId, {
      moodBoardImages: updatedImages,
      lastModified: Date.now(),
    });

    return {
      success: true,
      imageCount: updatedImages.length,
    };
  },
});
