import { v } from 'convex/values';
import { query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { Id } from './_generated/dataModel';

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
    if (!project || projectId.toString() !== userId.toString()) {
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
