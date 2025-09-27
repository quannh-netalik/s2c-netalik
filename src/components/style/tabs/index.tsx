import { FC, ReactNode } from 'react';

import { Hash, LayoutIcon, LucideProps, Type } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { TabsContent } from '@/components/ui/tabs';

export type StyleGuideTabValue = 'colors' | 'typography' | 'moodBoard';

export type StyleGuideTab = {
  value: StyleGuideTabValue;
  label: string;
  Icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
};

export const tabs: StyleGuideTab[] = [
  {
    value: 'colors',
    label: 'Colors',
    Icon: Hash,
  },
  {
    value: 'typography',
    label: 'Typography',
    Icon: Type,
  },
  {
    value: 'moodBoard',
    label: 'Mood Board',
    Icon: LayoutIcon,
  },
] as const;

type StyleGuideTabContentProps = {
  value: StyleGuideTabValue;
  className?: string;
  children: ReactNode;
};

const StyleGuideTabContent: FC<StyleGuideTabContentProps> = ({ value, className, children }) => (
  <TabsContent value={value} className={className}>
    {children}
  </TabsContent>
);

export default StyleGuideTabContent;
