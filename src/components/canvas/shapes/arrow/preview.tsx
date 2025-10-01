import { FC } from 'react';
import { Point } from '@/redux/slice/viewport';
import { calculateArrowHead, calculateBoundingBox } from './utils';

type ArrowPreviewProps = {
  startWorld: Point;
  currentWorld: Point;
};

const ArrowPreview: FC<ArrowPreviewProps> = ({ startWorld, currentWorld }) => {
  const { x: startX, y: startY } = startWorld;
  const { x: endX, y: endY } = currentWorld;

  const arrowHead = calculateArrowHead(startX, startY, endX, endY, 12);

  // Calculate bounding box for the SVG
  const { minX, minY, width, height } = calculateBoundingBox(startX, startY, endX, endY, arrowHead);

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: minX,
        top: minY,
        width,
        height,
      }}
      aria-hidden
    >
      <line
        x1={startX - minX}
        y1={startY - minY}
        x2={endX - minX}
        y2={endY - minY}
        stroke="#666"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="3,3"
      />
      <polygon
        points={`${endX - minX},${endY - minY} ${arrowHead.x1 - minX},${arrowHead.y1 - minY} ${arrowHead.x2 - minX},${arrowHead.y2 - minY}`}
        fill="#666"
        stroke="#666"
        strokeWidth={1}
        strokeLinejoin="round"
        strokeDasharray="2,2"
      />
    </svg>
  );
};

export default ArrowPreview;
