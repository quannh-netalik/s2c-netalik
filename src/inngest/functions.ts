import { fetchMutation } from 'convex/nextjs';
import { api } from '../../convex/_generated/api';
import { inngest } from './client';
import { events } from './events';
import { AutosaveProjectRequest } from '@/redux/api/project';
import { Id } from '../../convex/_generated/dataModel';

export const autosaveProjectWorkflow = inngest.createFunction(
  { id: events.autosave.id },
  { event: events.autosave.name },
  async ({ event }) => {
    console.log('🚀 [Inngest] Project autosave requested: ', JSON.stringify(event));

    const { projectId, userId, shapesData, viewportData } = <AutosaveProjectRequest>event.data;
    try {
      await fetchMutation(api.projects.updateProjectSketches, {
        projectId: projectId as Id<'projects'>,
        userId: userId as Id<'users'>,
        sketchesData: shapesData,
        viewportData,
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  },
);
