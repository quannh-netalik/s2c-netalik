'use client';

import { useInfiniteCanvas } from '@/hooks/use-canvas';
import { FC } from 'react';
import { toolActions } from './utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ToolBarShapes: FC = () => {
  const { currentTool, selectTool } = useInfiniteCanvas();

  return (
    <div className="col-span-1 flex justify-center items-center">
      <div className="flex items-center backdrop-blur-xl backdrop-[url('#displacementFilter')] bg-white/[0.08] border border-white/[0.12] gap-2 rounded-full p-3 saturate-150">
        {toolActions.map((tool) => (
          <Button
            key={tool.id}
            variant="ghost"
            size="lg"
            onClick={() => selectTool(tool.id)}
            className={cn(
              'cursor-pointer rounded-full p-3',
              currentTool === tool.id
                ? 'text-primary/100 bg-white/[0.12] border border-white/[0.16]'
                : 'text-primary/50 hover:bg-white/[0.06] border border-transparent ',
            )}
            title={`${tool.label} - ${tool.description}`}
          >
            {tool.icon}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ToolBarShapes;
