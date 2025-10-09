import { RefObject, useCallback } from 'react';

import { MoodBoardImage } from './use-style';
import { useGenerateStyleGuideMutation } from '@/redux/api/style-guide';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const useStyleGuide = (
  projectId: string,
  images: MoodBoardImage[],
  fileInputRef: RefObject<HTMLInputElement | null>,
) => {
  const [generateStyleGuide, { isLoading: isGenerating }] = useGenerateStyleGuideMutation();

  const router = useRouter();
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleGenerateStyleGuide = useCallback(async () => {
    if (!projectId) {
      toast.error('No project selected');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    if (images.some((img) => img.uploading)) {
      toast.error('Please wait for all images to finish uploading');
      return;
    }

    try {
      toast.loading('Generating style guide...', {
        id: 'generate-style-guide',
      });

      const result = await generateStyleGuide({ projectId }).unwrap();

      if (!result.success) {
        toast.error(result.message || 'Failed to generate style guide', {
          id: 'generate-style-guide',
        });
        return;
      }

      router.refresh();
      toast.success('Style guide generated successfully!', { id: 'generate-style-guide' });

      setTimeout(() => {
        toast.success('Style guide generated! Switch to Colors tab to see the results', {
          duration: 5000,
        });
      }, 1500);
      handleUploadClick();
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'error' in error
          ? (error as { error: string }).error
          : 'An unknown error occurred! Failed to generate style guide';
      toast.error(errorMessage, { id: 'generate-style-guide' });
    }
  }, [generateStyleGuide, handleUploadClick, images, projectId, router]);

  return {
    isGenerating,
    handleGenerateStyleGuide,
  };
};
