import { FrameShape, Shape } from '@/redux/slice/shapes';
import { Point } from '@/redux/slice/viewport';

const _checkFrameByCoordinate = (
  frame: FrameShape,
): { _isShapeInsideFrame: (p: Point) => boolean } => {
  const frameLeft = frame.x;
  const frameTop = frame.y;
  const frameRight = frame.x + frame.w;
  const frameBottom = frame.y + frame.h;

  return {
    _isShapeInsideFrame: ({ x, y }: Point) =>
      x >= frameLeft && x <= frameRight && y >= frameTop && y <= frameBottom,
  };
};

export const isShapeInsideFrame = (shape: Shape, frame: FrameShape): boolean => {
  const { _isShapeInsideFrame } = _checkFrameByCoordinate(frame);

  switch (shape.type) {
    case 'rect':
    case 'ellipse':
    case 'frame':
      // Check if shape center pointer is within frame
      const centerX = shape.x + shape.w / 2;
      const centerY = shape.y + shape.h / 2;
      return _isShapeInsideFrame({
        x: centerX,
        y: centerY,
      });

    case 'text':
      // Check if text position is within frame
      return _isShapeInsideFrame({
        x: shape.x,
        y: shape.y,
      });
    case 'free-draw':
      // Check if any drawing points are within frame
      return shape.points.some(_isShapeInsideFrame);
    case 'line':
    case 'arrow':
      // Check if either start or end point is within frame
      const startInside = _isShapeInsideFrame({ x: shape.startX, y: shape.startY });
      const endInside = _isShapeInsideFrame({ x: shape.endX, y: shape.endY });

      return startInside || endInside;
    default:
      return false;
  }
};

export const getShapesInsideFrame = (shapes: Shape[], frame: FrameShape): Shape[] => {
  // Simple coordinate-based detection: find shapes within frame bounds
  const shapesInFrame = shapes.filter(
    (shape) => shape.id !== frame.id && isShapeInsideFrame(shape, frame),
  );

  console.log(`Frame ${frame.frameNumber} capture:`, {
    totalShapes: shapes.length,
    captured: shapesInFrame.length,
    capturedTypes: shapesInFrame.map((s) => s.type),
  });

  return shapesInFrame;
};

const _renderShapeOnCanvas = (
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  frameX: number,
  frameY: number,
) => {
  ctx.save();

  switch (shape.type) {
    case 'frame':
    case 'rect':
    case 'ellipse': {
      const relativeX = shape.x - frameX;
      const relativeY = shape.y - frameY;

      ctx.strokeStyle = shape.stroke && shape.stroke !== 'transparent' ? shape.stroke : '#ffffff';
      ctx.lineWidth = shape.strokeWidth || 2;

      const borderRadius = shape.type === 'rect' ? 8 : 0;
      ctx.beginPath();

      if (shape.type === 'ellipse') {
        ctx.ellipse(
          relativeX + shape.w / 2,
          relativeY + shape.h / 2,
          shape.w / 2,
          shape.h / 2,
          0,
          0,
          2 * Math.PI,
        );
      } else {
        ctx.roundRect(relativeX, relativeY, shape.w, shape.h, borderRadius);
      }

      ctx.stroke();
      break;
    }
    case 'text': {
      const textRelativeX = shape.x - frameX;
      const textRelativeY = shape.y - frameY;

      ctx.fillStyle = shape.fill || '#ffffff';
      ctx.font = `${shape.fontSize}px ${shape.fontFamily || 'Inter, sans-serif'}`;
      ctx.textBaseline = 'top';
      ctx.fillText(shape.text, textRelativeX, textRelativeY);
      break;
    }
    case 'free-draw': {
      if (shape.points.length > 1) {
        ctx.strokeStyle = shape.stroke || '#ffffff';
        ctx.lineWidth = shape.strokeWidth || 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        const firstPoint = shape.points[0];
        ctx.moveTo(firstPoint.x - frameX, firstPoint.y - frameY);

        for (let i = 1; i < shape.points.length; i++) {
          const point = shape.points[i];
          ctx.lineTo(point.x - frameX, point.y - frameY);
        }

        ctx.stroke();
      }
      break;
    }
    case 'line': {
      ctx.strokeStyle = shape.stroke || '#ffffff';
      ctx.lineWidth = shape.strokeWidth || 2;
      ctx.beginPath();

      ctx.moveTo(shape.startX - frameX, shape.startY - frameY);
      ctx.lineTo(shape.endX - frameX, shape.endY - frameY);
      ctx.stroke();

      break;
    }
    case 'arrow': {
      ctx.strokeStyle = shape.stroke || '#ffffff';
      ctx.lineWidth = shape.strokeWidth || 2;
      ctx.beginPath();

      ctx.moveTo(shape.startX - frameX, shape.startY - frameY);
      ctx.lineTo(shape.endX - frameX, shape.endY - frameY);
      ctx.stroke();

      const headLength = 10;
      const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
      ctx.fillStyle = shape.stroke || '#ffffff';
      ctx.beginPath();

      ctx.moveTo(shape.endX - frameX, shape.endY - frameY);
      ctx.lineTo(
        shape.endX - frameX - headLength * Math.cos(angle - Math.PI / 6),
        shape.endY - frameY - headLength * Math.sin(angle - Math.PI / 6),
      );
      ctx.lineTo(
        shape.endX - frameX - headLength * Math.cos(angle + Math.PI / 6),
        shape.endY - frameY - headLength * Math.sin(angle + Math.PI / 6),
      );
      ctx.closePath();
      ctx.fill();
      break;
    }
  }
  ctx.restore();
};

export const generateFrameSnapshot = async (
  frame: FrameShape,
  allShapes: Shape[],
): Promise<Blob> => {
  const shapesInFrame = getShapesInsideFrame(allShapes, frame);
  const canvas = document.createElement('canvas');
  canvas.width = frame.w;
  canvas.height = frame.h;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  ctx.beginPath();
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.clip();

  shapesInFrame.forEach((shape) => {
    _renderShapeOnCanvas(ctx, shape, frame.x, frame.y);
  });

  ctx.restore();
  console.log('✅ All shapes rendered');

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image blob'));
        }
      },
      'image/png',
      1.0,
    );
  });
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
