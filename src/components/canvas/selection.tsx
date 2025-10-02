'use client';

import { FC } from 'react';
import { Shape } from '@/redux/slice/shapes';
import { useSectionOverlay } from '@/hooks/use-section-overlay';

interface SelectionOverlayProps {
  shape: Shape;
  isSelected: boolean;
}

const SelectionOverlay: FC<SelectionOverlayProps> = ({ shape, isSelected }) => {
  const { bounds, isResizable, handlePointerDown, handlePointerMove, handlePointerUp } =
    useSectionOverlay(shape);

  if (!isSelected) return null;

  return (
    <div
      className="absolute pointer-events-none border-2 border-blue-500 bg-blue-500/10"
      style={{
        left: bounds.x - 2,
        top: bounds.y - 2,
        width: bounds.w + 4,
        height: bounds.h + 4,
        borderRadius: shape.type === 'frame' ? '10px' : '4px',
      }}
    >
      {isResizable && (
        <>
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize pointer-events-auto"
            style={{ top: -6, left: -6 }}
            onPointerDown={(e) => handlePointerDown(e, 'nw')}
            onPointerMove={(e) => handlePointerMove(e, 'nw')}
            onPointerUp={handlePointerUp}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize pointer-events-auto"
            style={{ top: -6, right: -6 }}
            onPointerDown={(e) => handlePointerDown(e, 'ne')}
            onPointerMove={(e) => handlePointerMove(e, 'ne')}
            onPointerUp={handlePointerUp}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize pointer-events-auto"
            style={{ bottom: -6, left: -6 }}
            onPointerDown={(e) => handlePointerDown(e, 'sw')}
            onPointerMove={(e) => handlePointerMove(e, 'sw')}
            onPointerUp={handlePointerUp}
          />
          <div
            className="absolute w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize pointer-events-auto"
            style={{ bottom: -6, right: -6 }}
            onPointerDown={(e) => handlePointerDown(e, 'se')}
            onPointerMove={(e) => handlePointerMove(e, 'se')}
            onPointerUp={handlePointerUp}
          />
        </>
      )}
      {!isResizable && (
        <>
          <div className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full -top-1 -left-1" />
          <div className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full -top-1 -right-1" />
          <div className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full -bottom-1 -left-1" />
          <div className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full -bottom-1 -right-1" />
        </>
      )}
    </div>
  );
};

export default SelectionOverlay;
