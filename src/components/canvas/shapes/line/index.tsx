import { LineShape } from '@/redux/slice/shapes';
import { FC } from 'react';

type LineComponentProps = {
  shape: LineShape;
};

const LineComponent: FC<LineComponentProps> = ({ shape }) => {
  const { startX, startY, endX, endY } = shape;

  // Calculate bounding box with padding for strokeWidth and line caps (dynamic padding)
  // https://github.com/quannh-netalik/s2c-netalik/pull/4#discussion_r2394313627
  const padding = Math.max(shape.strokeWidth / 2, 1);

  // Calculate bounding box for the SVG
  const minX = Math.min(startX, endX) - padding;
  const minY = Math.min(startY, endY) - padding;
  const maxX = Math.max(startX, endX) + padding;
  const maxY = Math.max(startY, endY) + padding;
  const width = maxX - minX;
  const height = maxY - minY;

  return (
    <svg
    className="absolute pointer-events-none z-10"
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
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default LineComponent;
