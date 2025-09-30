import ProjectList from '@/components/projects/list';
import ProjectListProvider from '@/components/projects/list/provider';
import { ProjectsQuery } from '@/convex/query.config';

const Page = async () => {
  const { projects, profile } = await ProjectsQuery();

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Authentication Required</h1>
          <p className="text-muted-foreground">Please sign in to view your projects</p>
        </div>
      </div>
    );
  }

  return (
    <ProjectListProvider initialProjects={projects}>
      <div className="container mx-auto py-36 px-4">
        <ProjectList />
      </div>
    </ProjectListProvider>
  );
};

export default Page;
