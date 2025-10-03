import { Point } from '@/redux/slice/viewport';
import { FC } from 'react';

type FramePreviewProps = {
  startWorld: Point;
  currentWorld: Point;
};

const FramePreview: FC<FramePreviewProps> = ({ startWorld, currentWorld }) => {
  const x = Math.min(startWorld.x, currentWorld.x);
  const y = Math.min(startWorld.y, currentWorld.y);
  const w = Math.abs(currentWorld.x - startWorld.x);
  const h = Math.abs(currentWorld.y - startWorld.y);

  return (
    <div
      className="absolute pointer-events-none border-2 border-dashed border-gray-400"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        backgroundColor: 'rgba(255, 255, 255, 0.08)', // Semi-transparent preview matching toolbar
        borderRadius: '8px', // Rounded borders to match final frame
      }}
    />
  );
};

export default FramePreview;
