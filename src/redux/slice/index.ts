import { Reducer } from '@reduxjs/toolkit';
import profile, { ProfileState } from './profile';
import projects, { ProjectsState } from './projects';
import shapes, { ShapesState } from './shapes';
import viewport, { ViewportState } from './viewport';

type ReduxSlice = {
  profile: Reducer<ProfileState>;
  projects: Reducer<ProjectsState>;
  shapes: Reducer<ShapesState>;
  viewport: Reducer<ViewportState>;
};

export const slices: ReduxSlice = {
  profile,
  projects,
  shapes,
  viewport,
};
