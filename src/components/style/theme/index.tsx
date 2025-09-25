import { ColorSection } from '@/redux/api/style-guide';
import { FC } from 'react';

import ColorTheme from './color-theme';

type ThemeContentProps = {
  colorGuide: ColorSection[];
};

const ThemeContent: FC<ThemeContentProps> = ({ colorGuide }) => (
  <div className="flex flex-col gap-10">
    <div className="flex flex-col gap-10">
      {colorGuide.map((section, index) => (
        <ColorTheme key={index} title={section.title} swatches={section.swatches} />
      ))}
    </div>
  </div>
);

export default ThemeContent;
