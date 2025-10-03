import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface AutosaveProjectRequest {
  projectId: string;
  userId: string;
  shapesData: {
    shapes: Record<string, unknown>;
    tool: string;
    selected: Record<string, unknown>;
    frameCounter: number;
  };
  viewportData?: {
    scale: number;
    translate: { x: number; y: number };
  };
}

interface AutosaveProjectResponse {
  success: boolean;
  message: string;
  eventId: string;
}

export const ProjectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/projects' }),
  tagTypes: ['Project'],
  endpoints: (builder) => ({
    autosaveProject: builder.mutation<AutosaveProjectResponse, AutosaveProjectRequest>({
      query: (data: AutosaveProjectRequest) => ({
        url: '',
        method: 'PATCH',
        body: data,
      }),
    }),
  }),
});

export const { useAutosaveProjectMutation } = ProjectApi;
