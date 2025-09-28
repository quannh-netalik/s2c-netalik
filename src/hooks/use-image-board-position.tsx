'use client';

import { useMemo } from 'react';

export interface ImageBoardPositionStats {
  imageId: string;
  index: number;
  total: number;
  variant: 'mobile' | 'desktop';
}

interface ImagePositionResponse {
  rotation: number;
  xOffset: number;
  yOffset: number;
}

export const useImagePosition = ({
  imageId,
  index,
  total,
  variant,
}: ImageBoardPositionStats): ImagePositionResponse => {
  const config = useMemo(() => {
    const seed = imageId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
    const random2 = (((seed + 1) * 9301 + 49297) % 233280) / 233280;
    const random3 = (((seed + 2) * 9301 + 49297) % 233280) / 233280;

    if (variant === 'mobile') {
      return {
        rotation: (random1 - 0.5) * 20,
        xOffset: (random2 - 0.5) * 40,
        yOffset: (random3 - 0.5) * 30,
      };
    }

    // desktop sequential positioning
    const imageWidth = 192; // w-48
    const overlapAmount = 30;
    const spacing = imageWidth - overlapAmount;

    return {
      rotation: (random1 - 0.5) * 50,
      xOffset: index * spacing - ((total - 1) * spacing) / 2,
      yOffset: (random3 - 0.5) * 30,
    };
  }, [imageId, index, total, variant]);

  return config;
};
