import { FC, RefObject } from 'react';
import { MoodBoardImage } from '@/hooks/use-style';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useStyleGuide } from '@/hooks/use-style-guide';

type GenerateStyleGuideButtonProps = {
  images: MoodBoardImage[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  projectId: string;
};

const GenerateStyleGuideButton: FC<GenerateStyleGuideButtonProps> = ({
  images,
  fileInputRef,
  projectId,
}) => {
  const { handleGenerateStyleGuide, isGenerating } = useStyleGuide(projectId, images, fileInputRef);

  return (
    images.length > 0 && (
      <div className="flex justify-end">
        <Button
          className="rounded-full"
          onClick={handleGenerateStyleGuide}
          disabled={isGenerating || images.some((img) => img.uploading)}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Images...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate with AI
            </>
          )}
        </Button>
      </div>
    )
  );
};

export default GenerateStyleGuideButton;
