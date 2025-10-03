'use client';

import { FC, Fragment } from 'react';
import { useInfiniteCanvas } from '@/hooks/use-canvas';
import { cn } from '@/lib/utils';
import TextSideBar from './text-sidebar';
import ShapeRenderer from './shapes';
import DraftShape from './shapes/draft';
import FreeDrawStrokePreview from './shapes/stroke/preview';
import SelectionOverlay from './selection';

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

  const draftShape = getDraftShape();
  const freeDrawPoints = getFreeDrawPoints();

  return (
    <Fragment>
      <TextSideBar isOpen={isSidebarOpen && hasSelectedText} />
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
            <ShapeRenderer key={`render-${shape.id}`} shape={shape} toggleInspiration={() => {}} />
          ))}

          {shapes.map((shape) => (
            <SelectionOverlay
              key={`selection-${shape.id}`}
              shape={shape}
              isSelected={!!selectedShapes[shape.id]}
            />
          ))}

          {draftShape && (
            <DraftShape
              type={draftShape.type}
              startWorld={draftShape.startWorld}
              currentWorld={draftShape.currentWorld}
            />
          )}

          {currentTool === 'free-draw' && freeDrawPoints.length > 1 && (
            <FreeDrawStrokePreview points={freeDrawPoints} />
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default InfiniteCanvas;
