'use client';

import { FC } from 'react';
import { MoodBoardImage } from '@/hooks/use-style';

import ResponsiveImage from '.';

type MobileImageBoardProps = {
  images: MoodBoardImage[];
  removeImage: (imageId: string) => Promise<void>;
};

const MobileImageBoard: FC<MobileImageBoardProps> = ({ images, removeImage }) => {
  return (
    <div className="lg:hidden absolute inset-0 flex items-center justify-center">
      <div className="relative">
        {images.map((image, index) => (
          <ResponsiveImage
            key={image.id}
            image={image}
            index={index}
            removeImageAction={removeImage}
            total={images.length}
            variant="mobile"
          />
        ))}
      </div>
    </div>
  );
};

export default MobileImageBoard;
