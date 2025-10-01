'use client';

import { FC, ReactNode, useEffect } from 'react';
import { Preloaded } from 'convex/react';
import { FunctionReference } from 'convex/server';

import { Id } from '../../../../convex/_generated/dataModel';
import { useAppDispatch } from '@/redux/store';
import { Project } from '@/types/project.type';
import { loadProject } from '@/redux/slice/shapes';
import { resetView, restoreViewport } from '@/redux/slice/viewport';

type ProjectProviderProps = {
  children: ReactNode;
  initialProject: Preloaded<
    FunctionReference<
      'query',
      'public',
      {
        isGetStyleGuide?: boolean | undefined;
        projectId: Id<'projects'>;
      },
      Project,
      string | undefined
    >
  > | null;
};

const ProjectProvider: FC<ProjectProviderProps> = ({ initialProject, children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const projectData = initialProject?._valueJSON as unknown as Project;
    if (projectData?.sketchesData) {
      // Load the sketches data into the shapes Redux state
      dispatch(loadProject(projectData.sketchesData));

      // Restore viewport position if available
      if (projectData.viewportData) {
        dispatch(restoreViewport(projectData.viewportData));
      } else {
        /**
         * If a user opens a project that lacks viewportData after viewing one that had zoom/pan saved,
         * the previous viewport remains in Redux, so the new project renders with the old camera offset/scale.
         * We need to explicitly reset the viewport slice when there is no persisted viewport data.
         */
        dispatch(resetView());
      }
    }
  }, [dispatch, initialProject]);

  return <>{children}</>;
};

export default ProjectProvider;
