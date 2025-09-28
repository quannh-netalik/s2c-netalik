'use client';

import { FC } from 'react';
import { MoodBoardImage } from '@/hooks/use-style';
import ResponsiveImage from '.';

type DesktopImageBoardProps = {
  images: MoodBoardImage[];
  removeImage: (imageId: string) => Promise<void>;
};

const DesktopImageBoard: FC<DesktopImageBoardProps> = ({ images, removeImage }) => {
  return (
    <div className="hidden lg:flex absolute inset-0 items-center justify-center">
      <div className="relative w-full max-w-[700px] h-[300px] mx-auto">
        {images.map((image, index) => (
          <ResponsiveImage
            key={image.id}
            image={image}
            index={index}
            removeImageAction={removeImage}
            total={images.length}
            variant="desktop"
          />
        ))}
      </div>
    </div>
  );
};

export default DesktopImageBoard;
