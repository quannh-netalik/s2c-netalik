import { FC } from 'react';

import { Shape } from '@/redux/slice/shapes';

import ArrowComponent from './arrow';
import EllipseComponent from './ellipse';
import RectangleComponent from './rectangle';
import StrokeComponent from './stroke';
import LineComponent from './line';
import TextComponent from './text';

type ShapeRendererProps = {
  shape: Shape;
  // toggleInspiration: () => void;
  // toggleChat: (generatedUIId: string) => void;
  // generateWorkflow: (generatedUIId: string) => void;
  // exportDesign: (generatedUIId: string, element: HTMLElement | null) => void;
};

const ShapeRenderer: FC<ShapeRendererProps> = ({
  shape,
  // toggleInspiration,
  // toggleChat,
  // generateWorkflow,
  // exportDesign,
}) => {
  switch (shape.type) {
    case 'rect':
      return <RectangleComponent shape={shape} />;
    case 'ellipse':
      return <EllipseComponent shape={shape} />;
    case 'free-draw':
      return <StrokeComponent shape={shape} />;
    case 'arrow':
      return <ArrowComponent shape={shape} />;
    case 'line':
      return <LineComponent shape={shape} />;
    case 'text':
      return <TextComponent shape={shape} />;
  }
};

export default ShapeRenderer;
