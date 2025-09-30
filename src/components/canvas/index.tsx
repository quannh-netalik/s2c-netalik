'use client';

import { useInfiniteCanvas } from '@/hooks/use-canvas';
import { FC, Fragment } from 'react';
import { cn } from '@/lib/utils';

const InfiniteCanvas: FC = () => {
  const {
    viewport,
    shapes,
    currentTool,
    selectedShapes,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    attachCanvasRef,
    getDraftShape,
    getFreeDrawPoints,
    isSidebarOpen,
    hasSelectedText,
  } = useInfiniteCanvas();

  return (
    <Fragment>
      {/* Inspiration */}
      {/* ChatWindow */}

      <div
        ref={attachCanvasRef}
        role="application"
        aria-label="Infinite drawing canvas"
        className={cn('relative w-full h-full overflow-hidden select-none z-0', {
          'cursor-grabbing': viewport.mode === 'panning',
          'cursor-grab': viewport.mode === 'shiftPanning',
          'cursor-crosshair': currentTool !== 'select' && viewport.mode === 'idle',
          'cursor-default': currentTool === 'select' && viewport.mode === 'idle',
        })}
        style={{ touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
      >
        <div
          className="absolute origin-top-left pointer-events-none z-10"
          style={{
            transform: `translate3d(${viewport.translate.x}px, ${viewport.translate.y}px, 0) scale(${viewport.scale})`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        >
          {shapes.map((shape) => (
            <div key={shape.id} />
          ))}
        </div>
      </div>
    </Fragment>
  );
};

export default InfiniteCanvas;
