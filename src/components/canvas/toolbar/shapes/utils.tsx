import { Tool } from '@/redux/slice/shapes';
import {
  ArrowRight,
  Circle,
  Eraser,
  Hash,
  Minus,
  MousePointer2,
  Pencil,
  Square,
  Type,
} from 'lucide-react';
import { ReactNode } from 'react';

interface ToolAction {
  id: Tool;
  icon: ReactNode;
  label: string;
  description: string;
}

export const toolActions: ToolAction[] = [
  {
    id: 'select',
    icon: <MousePointer2 className="w-4 h-4" />,
    label: 'Select',
    description: 'Select and move shapes',
  },
  {
    id: 'frame',
    icon: <Hash className="w-4 h-4" />,
    label: 'Frame',
    description: 'Draw frame containers',
  },
  {
    id: 'rect',
    icon: <Square className="w-4 h-4" />,
    label: 'Rectangle',
    description: 'Draw rectangles',
  },
  {
    id: 'ellipse',
    icon: <Circle className="w-4 h-4" />,
    label: 'Ellipse',
    description: 'Draw ellipses and circles',
  },
  {
    id: 'free-draw',
    icon: <Pencil className="w-4 h-4" />,
    label: 'Free Draw',
    description: 'Draw freehand lines',
  },
  {
    id: 'arrow',
    icon: <ArrowRight className="w-4 h-4" />,
    label: 'Arrow',
    description: 'Draw arrows with direction',
  },
  {
    id: 'line',
    icon: <Minus className="w-4 h-4" />,
    label: 'Line',
    description: 'Draw straight lines',
  },
  {
    id: 'text',
    icon: <Type className="w-4 h-4" />,
    label: 'Text',
    description: 'Add text blocks',
  },
  {
    id: 'eraser',
    icon: <Eraser className="w-4 h-4" />,
    label: 'Eraser',
    description: 'Remove shapes',
  },
];
