import { cn } from '@/lib/utils';
import { FC } from 'react';

type SwatchProps = {
  name: string;
  value: string;
  className?: string;
};

const Swatch: FC<SwatchProps> = ({ name, value, className }) => (
  <div className={cn('flex items-center gap-3', className)}>
    <div className="w-12 h-12 rounded-lg border border-border/20 flex-shrink-0" style={{ backgroundColor: value }} />
    <div className="space-y-1 min-w-0 flex-1">
      <h4 className="text-sm font-medium text-foreground">{name}</h4>
      <div className="text-xs text-muted-foreground font-mono uppercase">{value}</div>
    </div>
  </div>
);

export default Swatch;
