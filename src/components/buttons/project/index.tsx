'use client';

import { Button } from '@/components/ui/button';
import { useProjectCreation } from '@/hooks/use-project';
import { Loader2, PlusIcon } from 'lucide-react';
import { FC, Fragment } from 'react';

const CreateProject: FC = () => {
  const { createProject, isCreating, canCreate } = useProjectCreation();

  return (
    <Button
      variant="default"
      onClick={() => createProject()}
      disabled={!canCreate || isCreating}
      className="flex items-center gap-2 cursor-pointer rounded-full"
    >
      {isCreating ? (
        <Fragment>
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating...
        </Fragment>
      ) : (
        <Fragment>
          <PlusIcon className="h-4 w-4" />
          New Project
        </Fragment>
      )}
    </Button>
  );
};

export default CreateProject;
