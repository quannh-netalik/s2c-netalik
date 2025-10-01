import { FC, Fragment } from 'react';
import { Shape } from '@/redux/slice/shapes';
import { Point } from '@/redux/slice/viewport';

import RectanglePreview from './rectangle/preview';
import EllipsePreview from './ellipse/preview';
import LinePreview from './line/preview';
import ArrowPreview from './arrow/preview';

type DraftShapeProps = {
  type?: Shape['type'];
  startWorld: Point;
  currentWorld: Point;
  points?: Point[];
};

const DraftShape: FC<DraftShapeProps> = ({ type, startWorld, currentWorld }) => (
  <Fragment>
    {type === 'rect' && <RectanglePreview startWorld={startWorld} currentWorld={currentWorld} />}
    {type === 'ellipse' && <EllipsePreview startWorld={startWorld} currentWorld={currentWorld} />}
    {type === 'line' && <LinePreview startWorld={startWorld} currentWorld={currentWorld} />}
    {type === 'arrow' && <ArrowPreview startWorld={startWorld} currentWorld={currentWorld} />}
  </Fragment>
);

export default DraftShape;
