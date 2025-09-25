import { cn } from '@/lib/utils';
import { ColorSwatch } from '@/redux/api/style-guide';
import { FC } from 'react';
import Swatch from '../swatch';

type ColorThemeProps = {
  title: string;
  swatches: ColorSwatch[];
  className?: string;
};

const ColorTheme: FC<ColorThemeProps> = ({ title, swatches, className }) => (
  <div className={cn('flex flex-col gap-5', className)}>
    <div>
      <h3 className="text-lg font-medium text-foreground/50">{title}</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {swatches.map((swatch) => (
        <div key={swatch.name}>
          <Swatch name={swatch.name} value={swatch.hexColor} />
          {swatch.description && <p className="text-xs text-muted-foreground mt-2">{swatch.description}</p>}
        </div>
      ))}
    </div>
  </div>
);

export default ColorTheme;
