import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { FC } from 'react';

type EmptyImageBoardProps = {
  handleUploadClick: () => void;
};

const EmptyImageBoard: FC<EmptyImageBoardProps> = ({ handleUploadClick }) => (
  <div className="relative z-10 space-y-6">
    <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
      <Upload className="w-8 h-8 text-muted-foreground" />
    </div>

    <div className="space-y-2">
      <h3 className="text-lg font-medium text-foreground">Drop your images here</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Drag and drop up to 5 images to build your mood board
      </p>
    </div>

    <Button onClick={handleUploadClick} variant="outline">
      <Upload className="w-4 h-4 mr-2" />
      Choose Files
    </Button>
  </div>
);

export default EmptyImageBoard;
