'use client';

import { Button } from '@/components/ui/button';
import { useProjectCreation } from '@/hooks/use-project';
import { Loader2, PlusIcon } from 'lucide-react';
import { FC, Fragment, memo, useCallback } from 'react';

const CreateProject: FC = () => {
  const { createProject, isCreating, canCreate } = useProjectCreation();

  const handleClick = useCallback(() => {
    createProject();
  }, [createProject]);

  return (
    <Button
      variant="default"
      onClick={handleClick}
      disabled={!canCreate || isCreating}
      className="flex items-center gap-2 cursor-pointer rounded-full"
    >
      {isCreating ? <LoadingState /> : <IdleState />}
    </Button>
  );
};

const LoadingState = memo(function LoadingState() {
  return (
    <Fragment>
      <Loader2 className="h-4 w-4 animate-spin" />
      Creating...
    </Fragment>
  );
});

const IdleState = memo(function IdleState() {
  return (
    <Fragment>
      <PlusIcon className="h-4 w-4" />
      New Project
    </Fragment>
  );
});

export default CreateProject;
