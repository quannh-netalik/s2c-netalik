'use client';

import { MoodBoardImage, useMoodBoard } from '@/hooks/use-style';
import { cn } from '@/lib/utils';
import { FC, Fragment } from 'react';
import ImageBoard from './image-board';

type StyleGuideMoodBoardProps = {
  guideImages: MoodBoardImage[];
};

const StyleGuideMoodBoard: FC<StyleGuideMoodBoardProps> = ({ guideImages }) => {
  const { images, dragActive, removeImage, handleDrag, handleDrop, handleFileInput, canAddMore } =
    useMoodBoard(guideImages);

  return (
    <div className="flex flex-col gap-10">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-200 min-h-[400px] flex items-center justify-center',
          dragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border/50 hover:border-border',
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-3xl" />
        </div>

        {images.length > 0 && (
          <Fragment>
            {/** Mobile view */}
            <div className="lg:hidden absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {images.map((image, index) => {
                  const seed = image.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                  const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
                  const random2 = (((seed + 1) * 9301 + 49297) % 233280) / 233280;
                  const random3 = (((seed + 2) * 9301 + 49297) % 233280) / 233280;

                  const rotation = (random1 - 0.5) * 20; // -10 to +10 degrees for subtle title
                  const xOffset = (random2 - 0.5) * 40; // -20 to +20 px horizontal offset
                  const yOffset = (random3 - 0.5) * 30; // -15 tp +15 px vertical offset

                  return (
                    <ImageBoard
                      key={`mobile-${image.id}`}
                      image={image}
                      removeImage={removeImage}
                      xOffset={xOffset}
                      yOffset={yOffset}
                      rotation={rotation}
                      zIndex={index + 1}
                      marginLeft="-80px"
                      marginTop="-96px"
                    />
                  );
                })}
              </div>
            </div>

            {/** Desktop view */}
            <div className="hidden lg:flex absolute inset-0 items-center justify-center">
              <div className="relative w-full max-w-[700px] h-[300px] mx-auto">
                {images.map((image, index) => {
                  const seed = image.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
                  const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
                  const random3 = (((seed + 2) * 9301 + 49297) % 233280) / 233280;

                  // Sequential positioning: each image moves right with slight overlap
                  const imageWidth = 192; // w-48 = 192px
                  const overlapAmount = 30; // Reduced overlap
                  const spacing = imageWidth - overlapAmount; // 162px between image centers

                  // Position from left to right with slight random rotation and minimal vertical offset
                  const rotation = (random1 - 0.5) * 50; // -25 to +25 degrees for subtle title
                  const xOffset = index * spacing - ((images.length - 1) * spacing) / 2; // Center the sequence
                  const yOffset = (random3 - 0.5) * 30; // -15 tp +15 px vertical offset

                  return (
                    <ImageBoard
                      key={`mobile-${image.id}`}
                      image={image}
                      removeImage={removeImage}
                      xOffset={xOffset}
                      yOffset={yOffset}
                      rotation={rotation}
                      zIndex={index + 1}
                      marginLeft="-80px"
                      marginTop="-96px"
                    />
                  );
                })}
              </div>
            </div>
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default StyleGuideMoodBoard;
