import { FC } from 'react';
import { ArrowShape } from '@/redux/slice/shapes';
import { calculateArrowHead, calculateBoundingBox } from './utils';

type ArrowComponentProps = {
  shape: ArrowShape;
};

const Arrow: FC<ArrowComponentProps> = ({ shape }) => {
  const { startX, startY, endX, endY } = shape;

  // Calculate arrow direction and create arrow head points
  const arrowHead = calculateArrowHead(startX, startY, endX, endY, 12);

  // Calculate bounding box for the SVG
  const { minX, minY, width, height } = calculateBoundingBox(startX, startY, endX, endY, arrowHead);

  return (
    <svg
      className="absolute pointer-events-none"
      style={{ left: minX, top: minY, width, height }}
      aria-hidden
    >
      <line
        x1={startX - minX}
        y1={startY - minY}
        x2={endX - minX}
        y2={endY - minY}
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        strokeLinecap="round"
      />
      <polygon
        points={`${endX - minX},${endY - minY} ${arrowHead.x1 - minX},${arrowHead.y1 - minY} ${arrowHead.x2 - minX},${arrowHead.y2 - minY}`}
        fill={shape.stroke}
        stroke={shape.stroke}
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Arrow;
