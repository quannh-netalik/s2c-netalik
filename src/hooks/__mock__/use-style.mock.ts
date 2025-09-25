import { MoodBoardImage } from '../use-style';

// Mock for a successfully uploaded image from server
export const serverLoadedImage: MoodBoardImage = {
  id: 'server-img-1',
  preview: 'https://storage.googleapis.com/your-bucket/image1.jpg',
  storageId: 'storage-id-1',
  uploaded: true,
  uploading: false,
  url: 'https://storage.googleapis.com/your-bucket/image1.jpg',
  isFromServer: true
};

// Mock for a local image that's currently uploading
export const uploadingImage: MoodBoardImage = {
  id: 'local-img-1',
  preview: 'blob:http://localhost:3000/123e4567-e89b-12d3-a456-426614174000',
  uploaded: false,
  uploading: true
};

// Mock for a successfully uploaded local image
export const uploadedLocalImage: MoodBoardImage = {
  id: 'local-img-2',
  preview: 'https://storage.googleapis.com/your-bucket/completed-upload.jpg',
  storageId: 'storage-id-2',
  uploaded: true,
  uploading: false,
  url: 'https://storage.googleapis.com/your-bucket/completed-upload.jpg'
};

// Mock for a failed upload
export const failedUploadImage: MoodBoardImage = {
  id: 'local-img-3',
  preview: 'blob:http://localhost:3000/123e4567-e89b-12d3-a456-426614174001',
  uploaded: false,
  uploading: false,
  error: 'Failed to upload image: Network error'
};

// Collection of mock images in different states
export const mockMoodBoardImages: MoodBoardImage[] = [
  serverLoadedImage,
  uploadingImage,
  uploadedLocalImage,
  failedUploadImage,
  {
    id: 'server-img-2',
    preview: 'https://storage.googleapis.com/your-bucket/image2.jpg',
    storageId: 'storage-id-3',
    uploaded: true,
    uploading: false,
    url: 'https://storage.googleapis.com/your-bucket/image2.jpg',
    isFromServer: true
  },
  {
    id: 'local-img-4',
    preview: 'blob:http://localhost:3000/123e4567-e89b-12d3-a456-426614174002',
    uploaded: false,
    uploading: false
  }
];