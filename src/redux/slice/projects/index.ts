import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProjectsSummary {
  _id: string;
  name: string;
  projectNumber: number;
  thumbnail?: string;
  lastModified: number;
  createdAt: number;
  isPublic?: boolean;
}

export interface ProjectsState {
  projects: ProjectsSummary[];
  total: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  // Track creation state
  isCreating: boolean;
  createError: string | null;
}

const initialState: ProjectsState = {
  projects: [],
  total: 0,
  isLoading: false,
  error: null,
  lastFetched: null,
  isCreating: false,
  createError: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    fetchProjectsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProjectsSuccess: (state, action: PayloadAction<{ projects: ProjectsSummary[]; total: number }>) => {
      state.isLoading = false;
      state.projects = action.payload.projects;
      state.total = action.payload.total;
      state.error = null;
      state.lastFetched = Date.now();
    },
    fetchProjectFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    // Create Project action
    createProjectStart: (state) => {
      state.isCreating = true;
      state.createError = null;
    },
    createProjectSuccess: (state) => {
      state.isCreating = false;
      state.createError = null;
    },
    createProjectFailure: (state, action: PayloadAction<string>) => {
      state.isCreating = false;
      state.createError = action.payload;
    },
    addProject: (state, action: PayloadAction<ProjectsSummary>) => {
      state.projects.unshift(action.payload);
      state.total += 1;
    },
    updateProject: (state, action: PayloadAction<ProjectsSummary>) => {
      const index = state.projects.findIndex((project) => project._id === action.payload._id);

      if (index !== -1) {
        state.projects[index] = action.payload;
      }
    },
    clearProjects: (state) => {
      state.projects = [];
      state.total = 0;
      state.lastFetched = null;
      state.error = null;
      state.createError = null;
    },
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
    },
  },
});

export const {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectFailure,
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
  addProject,
  updateProject,
  clearProjects,
  clearErrors,
} = projectsSlice.actions;
export default projectsSlice.reducer;
