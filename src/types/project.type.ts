import { EntityState } from '@reduxjs/toolkit';

import { Id } from '../../convex/_generated/dataModel';
import { SelectionMap, Shape, Tool } from '@/redux/slice/shapes';
import { Point } from '@/redux/slice/viewport';

export type Project = {
  _id: Id<'projects'>;
  _creationTime: number;
  description?: string | undefined;
  styleGuide?: string | undefined;
  viewportData?: {
    scale: number;
    translate: Point;
  };
  generatedDesignData?: object;
  thumbnail?: string | undefined;
  moodBoardImages?: string[] | undefined;
  inspirationImages?: string[] | undefined;
  isPublic?: boolean | undefined;
  tags?: string[] | undefined;
  userId: Id<'users'>;
  name: string;
  sketchesData: {
    shapes: EntityState<Shape, string>;
    tool: Tool;
    selected: SelectionMap;
    frameCounter: number;
  };
  lastModified: number;
  createdAt: number;
  projectNumber: number;
};
