'use client';

import { useImagePosition } from '@/hooks/use-image-board-position';
import { MoodBoardImage } from '@/hooks/use-style';

import ImageBoard from '../image-board';

type ResponsiveImageProps = {
  image: MoodBoardImage;
  index: number;
  total: number;
  variant: 'mobile' | 'desktop';
  removeImageAction: (imageId: string) => Promise<void>;
};

function ResponsiveImage({ image, index, total, variant, removeImageAction }: ResponsiveImageProps) {
  const { rotation, xOffset, yOffset } = useImagePosition({ imageId: image.id, index, total, variant });

  return (
    <ImageBoard
      key={`${variant}-${image.id}`}
      image={image}
      removeImage={removeImageAction}
      rotation={rotation}
      xOffset={xOffset}
      yOffset={yOffset}
      zIndex={index + 1}
      marginLeft="-80px"
      marginTop="-96px"
    />
  );
}

export default ResponsiveImage;
