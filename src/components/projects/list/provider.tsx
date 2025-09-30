'use client';

import { FC, Fragment, ReactNode, useEffect } from 'react';
import { useAppDispatch } from '@/redux/store';
import { fetchProjectsSuccess, ProjectsSummary } from '@/redux/slice/projects';
import { Preloaded } from 'convex/react';
import { FunctionReference } from 'convex/server';
import { Id } from '../../../../convex/_generated/dataModel';

type ProjectListProviderProps = {
  children: ReactNode;
  initialProjects: Preloaded<
    FunctionReference<
      'query',
      'public',
      {
        limit?: number | undefined;
        userId: Id<'users'>;
      },
      ProjectsSummary[],
      string | undefined
    >
  >;
};

const ProjectListProvider: FC<ProjectListProviderProps> = ({ children, initialProjects }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize Redux state with SSR data
    if (initialProjects?._valueJSON) {
      const projectData = initialProjects._valueJSON as unknown as ProjectsSummary[];
      dispatch(
        fetchProjectsSuccess({
          projects: projectData,
          total: projectData.length,
        }),
      );
    }
  }, [dispatch, initialProjects._valueJSON]);

  return <Fragment>{children}</Fragment>;
};

export default ProjectListProvider;
