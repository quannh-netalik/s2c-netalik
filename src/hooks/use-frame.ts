import { useCallback, useMemo, useState } from 'react';
import { FrameShape, Shape } from '@/redux/slice/shapes';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { downloadBlob, generateFrameSnapshot } from '@/lib/frame-snapshot';

export const useFrame = (shape: FrameShape) => {
  const dispatch = useAppDispatch();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const entityState = useAppSelector((s) => s.shapes.shapes.entities);
  const allShapes: Shape[] = useMemo(
    () => Object.values(entityState).filter((s: Shape): s is Shape => s !== undefined),
    [entityState],
  );

  const handleGenerateDesign = useCallback(async () => {
    try {
      setIsGenerating(true);
      const snapshot = await generateFrameSnapshot(shape, allShapes);

      downloadBlob(snapshot, `frame-${shape.frameNumber}-snapshot.png`);

      const formData = new FormData();
      formData.append('image', snapshot, `frame-${shape.frameNumber}.png`);
      formData.append('frameNumber', shape.frameNumber.toString());

      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('projectId');

      if (projectId) {
        formData.append('projectId', projectId);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  }, [allShapes, shape]);

  return {
    isGenerating,
    handleGenerateDesign,
  };
};
