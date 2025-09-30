import { FC } from 'react';

import InfiniteCanvas from '@/components/canvas';
import ProjectProvider from '@/components/projects/provider';
import { ProjectByIdQuery } from '@/convex/query.config';

interface CanvasPageProps {
  searchParams: Promise<{ projectId?: string }>;
}

const Page: FC<CanvasPageProps> = async ({ searchParams }) => {
  const { projectId } = await searchParams;
  if (!projectId) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No project selected</p>
      </div>
    );
  }

  const { project, profile } = await ProjectByIdQuery(projectId);
  if (!profile) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Authentication required</p>
      </div>
    );
  }

  return (
    <ProjectProvider initialProject={project}>
      <InfiniteCanvas />
    </ProjectProvider>
  );
};

export default Page;
