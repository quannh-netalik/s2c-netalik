import { fetchMutation } from 'convex/nextjs';
import { api } from '../../convex/_generated/api';
import { inngest } from './client';
import { events } from './events';

export const autosaveProjectWorkflow = inngest.createFunction(
  { id: events.autosave.id },
  { event: events.autosave.name },
  async ({ event }) => {
    console.log('🚀 [Inngest] Project autosave requested: ', JSON.stringify(event));

    const { projectId, shapesData, viewportData } = event.data;
    try {
      await fetchMutation(api.projects.updateProjectSketches, {
        projectId,
        sketchesData: shapesData,
        viewportData,
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  },
);
