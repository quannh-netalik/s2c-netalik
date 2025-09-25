import { FC, ReactNode } from 'react';

import { Hash, LayoutIcon, LucideProps, Type } from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { TabsContent } from '@/components/ui/tabs';

export type StyleGuideTabValue = 'colors' | 'typography' | 'moodBoard';

export type Tab = {
  value: StyleGuideTabValue;
  label: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
};

export const tabs: Tab[] = [
  {
    value: 'colors',
    label: 'Colors',
    icon: Hash,
  },
  {
    value: 'typography',
    label: 'Typography',
    icon: Type,
  },
  {
    value: 'moodBoard',
    label: 'Mood Board',
    icon: LayoutIcon,
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
