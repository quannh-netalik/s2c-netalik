import { useMutation } from 'convex/react';
import { useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';
import { Id } from '../../convex/_generated/dataModel';

export interface MoodBoardImage {
  id: string;
  file?: File; // Optional for server-loaded images
  preview: string; // Local preview URL or Convex URL
  storageId?: string;
  uploaded: boolean;
  uploading: boolean;
  error?: string;
  url?: string; // Convex URL for uploaded images
  isFromServer?: boolean; // Track if image came from server
}

interface StylesFormData {
  images: MoodBoardImage[];
}

export const useMoodBoard = (guideImages: MoodBoardImage[]) => {
  const [dragActive, setDragActive] = useState(false);
  const searchParam = useSearchParams();
  const projectId = searchParam.get('projectId');

  const form = useForm<StylesFormData>({
    defaultValues: {
      images: [],
    },
  });

  const { watch, setValue, getValues } = form;
  const images = watch('images');

  const generateUploadUrl = useMutation(api.moodBoard.generateUploadUrl);
  const removeMoodBoardImage = useMutation(api.moodBoard.removeMoodBoardImage);
  const addMoodBoardImage = useMutation(api.moodBoard.addMoodBoardImage);

  const uploadImage = useCallback(
    async (file: File): Promise<{ storageId: string }> => {
      try {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        });

        if (!result.ok) {
          throw new Error(`Upload failed: ${result.statusText}`);
        }

        const { storageId } = await result.json();

        return {
          storageId,
        };
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [generateUploadUrl],
  );

  useEffect(() => {
    if (guideImages && guideImages.length > 0) {
      const serverImages: MoodBoardImage[] = guideImages.map((img) => ({
        id: img.id,
        preview: img.url!,
        storageId: img.storageId,
        uploaded: true,
        uploading: false,
        url: img.url,
        isFromServer: true,
      }));

      const currentImages = getValues('images');

      if (currentImages.length === 0) {
        setValue('images', serverImages);
      } else {
        const mergedImages = [...currentImages];
        serverImages.forEach((serverImg) => {
          const clientIndex = mergedImages.findIndex((clientImg) => clientImg.storageId === serverImg.storageId);

          if (clientIndex !== -1) {
            // Clean up old blob URL if it exists
            if (mergedImages[clientIndex].preview.startsWith('blob:')) {
              URL.revokeObjectURL(mergedImages[clientIndex].preview);
            }

            // Replace with server image
            mergedImages[clientIndex] = serverImg;
          }
        });

        setValue('images', mergedImages);
      }
    }
  }, [guideImages, setValue, getValues]);

  const startUploadingProcess = useCallback(
    async (updatedImages: MoodBoardImage[]) => {
      // Initial Loading State
      setValue('images', [...getValues('images'), ...updatedImages]);

      // Start upload process
      const _uploadProcesses = await Promise.allSettled(
        updatedImages.map(async (image) => {
          try {
            const { storageId } = await uploadImage(image.file!);

            return {
              id: image.id,
              storageId,
            };
          } catch (error) {
            console.error(error);
            const errorImages = getValues('images');
            const errorIndex = errorImages.findIndex((img) => img.id === image.id);
            if (errorIndex !== -1) {
              errorImages[errorIndex] = {
                ...errorImages[errorIndex],
                uploading: false,
                error: 'Upload failed',
              };
              setValue('images', errorImages);
            }
          }
        }),
      );

      // Map fulfilled process as {id}:{storageId}
      const mapIdStorageId = new Map<string, string>();
      for (let i = 0; i < _uploadProcesses.length; i++) {
        const process = _uploadProcesses[i];
        if (process.status === 'fulfilled' && process.value) {
          mapIdStorageId.set(process.value.id, process.value.storageId);
        }
      }

      // Update to Convex Server with state handling
      for (const updatedImage of updatedImages) {
        const storageId = mapIdStorageId.get(updatedImage.id);

        // If promise is rejected, it will not be set in fulfilled storageId state
        // Checking storageId ensures that the uploading image has been uploaded to a store
        if (storageId) {
          await addMoodBoardImage({
            projectId: projectId as Id<'projects'>,
            storageId: storageId as Id<'_storage'>,
          });

          const finalImages = getValues('images');
          const finalIndex = finalImages.findIndex((img) => img.id === updatedImage.id);
          if (finalIndex !== -1) {
            finalImages[finalIndex] = {
              ...finalImages[finalIndex],
              storageId,
              uploaded: true,
              uploading: false,
              isFromServer: true, // Now it's server image
            };
            setValue('images', finalImages);
          }
        }
      }

      toast.success('Image added to mood board');
    },
    [addMoodBoardImage, getValues, projectId, setValue, uploadImage],
  );

  const addImage = useCallback(
    (files: File[]) => {
      if (images.length + files.length > 5) {
        toast.error('Maximum 5 images allowed');
        return;
      }

      const newImages: MoodBoardImage[] = files.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        uploaded: false,
        uploading: true, // Start uploading process
        isFromServer: false,
      }));

      startUploadingProcess(newImages);
    },
    [images, startUploadingProcess],
  );

  const removeImage = useCallback(
    async (imageId: string) => {
      const imageToRemove = images.find((img) => img.id === imageId);
      if (!imageToRemove) return;

      // If it's server image with storageId, remove from Convex
      if (imageToRemove.isFromServer && imageToRemove.storageId && projectId) {
        try {
          await removeMoodBoardImage({
            projectId: projectId as Id<'projects'>,
            storageId: imageToRemove.storageId as Id<'_storage'>,
          });
        } catch (error) {
          console.error(error);
          toast.error('Failed to remove image from server');
          return;
        }
      }

      const updatedImages = images.filter((img) => {
        if (img.id !== imageId) return true;

        // Clean up preview URL only for local images
        if (!img.isFromServer && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }

        return false;
      });

      setValue('images', updatedImages);
      toast.success('Image removed');
    },
    [images, projectId, removeMoodBoardImage, setValue],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));

      if (imageFiles.length === 0) {
        toast.error('Please drop image files only');
        return;
      }

      addImage(imageFiles);
    },
    [addImage],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      addImage(files);

      // Reset input
      e.target.value = '';
    },
    [addImage],
  );

  useEffect(() => {
    return () => {
      images.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [images]);

  return {
    images,
    dragActive,
    removeImage,
    handleDrag,
    handleDrop,
    handleFileInput,
    canAddMore: images.length < 5,
  };
};
