interface IArrowHead {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const calculateArrowHead = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  size: number = 10,
) => {
  const angle = Math.atan2(endY - startY, endX - startX);
  const arrowAngle = Math.PI / 6; // 30 degrees

  const x1 = endX - size * Math.cos(angle - arrowAngle);
  const y1 = endY - size * Math.sin(angle - arrowAngle);
  const x2 = endX - size * Math.cos(angle + arrowAngle);
  const y2 = endY - size * Math.sin(angle + arrowAngle);

  return { x1, y1, x2, y2 };
};

export const calculateBoundingBox = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  arrowHead: IArrowHead,
) => {
  const minX = Math.min(startX, endX, arrowHead.x1, arrowHead.x2) - 5;
  const minY = Math.min(startY, endY, arrowHead.y1, arrowHead.y2) - 5;
  const maxX = Math.max(startX, endX, arrowHead.x1, arrowHead.x2) + 5;
  const maxY = Math.max(startY, endY, arrowHead.y1, arrowHead.y2) + 5;
  const width = maxX - minX;
  const height = maxY - minY;

  return {
    minX,
    minY,
    width,
    height,
  };
};
