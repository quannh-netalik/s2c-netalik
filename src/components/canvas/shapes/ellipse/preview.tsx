import { Point } from '@/redux/slice/viewport';
import { FC } from 'react';

type EllipsePreviewProps = {
  startWorld: Point;
  currentWorld: Point;
};

const EllipsePreview: FC<EllipsePreviewProps> = ({ startWorld, currentWorld }) => {
  const x = Math.min(startWorld.x, currentWorld.x);
  const y = Math.min(startWorld.y, currentWorld.y);
  const w = Math.abs(currentWorld.x - startWorld.x);
  const h = Math.abs(currentWorld.y - startWorld.y);

  return (
    <div
      className="absolute pointer-events-none border-2 border-gray-400 rounded-full"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
      }}
    />
  );
};

export default EllipsePreview;
