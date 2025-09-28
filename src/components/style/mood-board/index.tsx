'use client';

import { FC, Fragment, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Upload } from 'lucide-react';
import { MoodBoardImage, useMoodBoard } from '@/hooks/use-style';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BreakPoint, useIsMobile } from '@/hooks/use-mobile';

const MobileImageBoard = dynamic(() => import('./responsive-image-board/mobile-image-board'));
const DesktopImageBoard = dynamic(() => import('./responsive-image-board/desktop-image-board'));
const EmptyImageBoard = dynamic(() => import('./responsive-image-board/empty-image-board'));

type StyleGuideMoodBoardProps = {
  guideImages: MoodBoardImage[];
};

const StyleGuideMoodBoard: FC<StyleGuideMoodBoardProps> = ({ guideImages }) => {
  const { images, dragActive, removeImage, handleDrag, handleDrop, handleFileInput, canAddMore } =
    useMoodBoard(guideImages);

  const isMobile = useIsMobile(BreakPoint.lg);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

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

        {images.length > 0 ? (
          <Fragment>
            {isMobile ? (
              <MobileImageBoard images={images} removeImage={removeImage} />
            ) : (
              <DesktopImageBoard images={images} removeImage={removeImage} />
            )}

            {canAddMore && (
              <div className="absolute bottom-6 right-6 z-20">
                <Button onClick={handleUploadClick} size="sm" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Add More
                </Button>
              </div>
            )}
          </Fragment>
        ) : (
          <EmptyImageBoard handleUploadClick={handleUploadClick} />
        )}

        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileInput} className="hidden" />
      </div>

      {/* TODO */}
      <Button className="w-fit">Generate With AI</Button>
    </div>
  );
};

export default StyleGuideMoodBoard;
