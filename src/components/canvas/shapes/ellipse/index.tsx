import { EllipseShape } from '@/redux/slice/shapes';
import { FC } from 'react';

type EllipseComponentProps = {
  shape: EllipseShape;
};

const EllipseComponent: FC<EllipseComponentProps> = ({ shape }) => (
  <div
    className="absolute border-solid pointer-events-none"
    style={{
      left: shape.x,
      top: shape.y,
      width: shape.w,
      height: shape.h,
      borderColor: shape.stroke,
      borderWidth: shape.strokeWidth,
      backgroundColor: shape.fill ?? 'transparent',
      borderRadius: '50%',
    }}
  />
);

export default EllipseComponent;
