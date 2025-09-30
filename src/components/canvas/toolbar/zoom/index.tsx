'use client';

import { Button } from '@/components/ui/button';
import { useInfiniteCanvas } from '@/hooks/use-canvas';
import { setScale } from '@/redux/slice/viewport';
import { AppDispatch } from '@/redux/store';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

const ZoomBar: FC = () => {
  const { viewport } = useInfiniteCanvas();
  const dispatch = useDispatch<AppDispatch>();

  // Refers to: https://github.com/quannh-netalik/s2c-netalik/pull/3#discussion_r2391707569
  // Track window dimensions
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Set up resize listener
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 150); // Wait 150ms after resize stops
    };

    window.addEventListener('resize', handleResize, { signal });

    // Cleanup listener on unmount
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []); // Empty deps: set up once on mount

  // Recalculate center point when window resizes
  const originScreen = useMemo(
    () => ({
      x: windowSize.width / 2,
      y: windowSize.height / 2,
    }),
    [windowSize.width, windowSize.height],
  );

  const handleZoomOut = useCallback(() => {
    const raw = viewport.scale / 1.2;
    const clamped = Math.max(raw, viewport.minScale);
    const newScale = parseFloat(clamped.toFixed(3));
    dispatch(setScale({ scale: newScale, originScreen }));
  }, [dispatch, viewport.minScale, viewport.scale, originScreen]);

  const handleZoomIn = useCallback(() => {
    const raw = viewport.scale * 1.2;
    const clamped = Math.min(raw, viewport.maxScale);
    const newScale = parseFloat(clamped.toFixed(3));
    dispatch(setScale({ scale: newScale, originScreen }));
  }, [dispatch, viewport.maxScale, viewport.scale, originScreen]);

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
