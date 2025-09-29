'use client';

import { Button } from '@/components/ui/button';
import { useInfiniteCanvas } from '@/hooks/use-canvas';
import { setScale } from '@/redux/slice/viewport';
import { AppDispatch } from '@/redux/store';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

const ZoomBar: FC = () => {
  const { viewport } = useInfiniteCanvas();
  const dispatch = useDispatch<AppDispatch>();

  const handleZoomOut = useCallback(() => {
    const newScale = Math.max(viewport.scale / 1.2, viewport.minScale);
    dispatch(setScale({ scale: newScale }));
  }, [dispatch, viewport.minScale, viewport.scale]);

  const handleZoomIn = useCallback(() => {
    const newScale = Math.min(viewport.scale * 1.2, viewport.maxScale);
    dispatch(setScale({ scale: newScale }));
  }, [dispatch, viewport.maxScale, viewport.scale]);

  return (
    <div className="col-span-1 flex justify-end items-center">
      <div className="flex items-center gap-1 backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-full p-3 saturate-150">
        <Button
          variant="ghost"
          size="lg"
          onClick={handleZoomOut}
          className="w-9 h-9 p-0 rounded-full cursor-pointer hover:bg-white/[0.12] border border-transparent hover:border-white/[0.16] transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-primary/50" />
        </Button>

        <div className="text-center">
          <span className="text-sm font-mono leading-none text-primary/50">
            {Math.round(viewport.scale * 100)}
          </span>
        </div>

        <Button
          variant="ghost"
          size="lg"
          onClick={handleZoomIn}
          className="w-9 h-9 p-0 rounded-full cursor-pointer hover:bg-white/[0.12] border border-transparent hover:border-white/[0.16] transition-all"
          title="Zoom Out"
        >
          <ZoomIn className="w-4 h-4 text-primary/50" />
        </Button>
      </div>
    </div>
  );
};

export default ZoomBar;
