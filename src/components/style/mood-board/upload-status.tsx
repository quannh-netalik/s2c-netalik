import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { FC, memo } from 'react';

type UploadStatusProps = {
  uploading: boolean;
  uploaded: boolean;
  error?: string;
};


const UploadStatus: FC<UploadStatusProps> = ({ uploading, uploaded, error }) => {
  if (uploading) {
    return (
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
        <Loader2 className="w-6 h-6 text-white animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute top-2 right-2">
        <AlertCircle className="w-5 h-5 text-red-400" />
      </div>
    );
  }

  if (uploaded) {
    return (
      <div className="absolute top-2 right-2">
        <CheckCircle className="w-5 h-5 text-green-400" />
      </div>
    );
  }

  return null;
};

function areEqual(prev: UploadStatusProps, next: UploadStatusProps) {
  return (
    prev.uploading === next.uploading &&
    prev.uploaded === next.uploaded &&
    prev.error === next.error
  );
}

export default memo(UploadStatus, areEqual);
