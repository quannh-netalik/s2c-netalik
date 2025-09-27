import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const Loading = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className={cn('h-8 w-8 animate-spin text-primary', 'transition-colors')} />

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Loading Style Guide</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
