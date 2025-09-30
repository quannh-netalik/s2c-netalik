'use client';

import { FC, ReactNode, useEffect } from 'react';
import { Preloaded } from 'convex/react';
import { FunctionReference } from 'convex/server';

import { Id } from '../../../../convex/_generated/dataModel';
import { useAppDispatch } from '@/redux/store';
import { Project } from '@/types/project.type';
import { loadProject } from '@/redux/slice/shapes';
import { restoreViewport } from '@/redux/slice/viewport';

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
      }
    }
  }, [dispatch, initialProject]);

  return <>{children}</>;
};

export default ProjectProvider;
