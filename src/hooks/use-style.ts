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
