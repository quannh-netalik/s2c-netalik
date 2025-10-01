'use client';

import { polylineBox } from '@/lib/utils';
import {
  addArrow,
  addEllipse,
  addFrame,
  addFreeDrawShape,
  addLine,
  addRect,
  addText,
  clearSelection,
  removeShape,
  selectShape,
  setTool,
  Shape,
  Tool,
  updateShape,
} from '@/redux/slice/shapes';
import {
  handToolDisable,
  handToolEnable,
  panEnd,
  panMove,
  panStart,
  Point,
  screenToWorld,
  wheelPan,
  wheelZoom,
} from '@/redux/slice/viewport';
import { AppDispatch, useAppSelector } from '@/redux/store';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

interface TouchPointer {
  id: number;
  p: Point;
}

const RAF_INTERVAL_MS = 8;
const SHAPE_MIN_SIZE = 10;
const RESIZE_PADDING = 5;

interface DraftShape {
  type: 'frame' | 'rect' | 'ellipse' | 'arrow' | 'line';
  startWorld: Point;
  currentWorld: Point;
}

type WithClientXY = {
  clientX: number;
  clientY: number;
};

export const useInfiniteCanvas = () => {
  const dispatch = useDispatch<AppDispatch>();

  const viewport = useAppSelector((s) => s.viewport);

  const entityState = useAppSelector((s) => s.shapes.shapes);
  const shapeList: Shape[] = entityState.ids
    .map((id) => entityState.entities[id])
    .filter((s: Shape | undefined): s is Shape => Boolean(s));

  const currentTool = useAppSelector((s) => s.shapes.tool);
  const selectedShapes = useAppSelector((s) => s.shapes.selected);

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const shapesEntities = useAppSelector((s) => s.shapes.shapes.entities);

  const hasSelectedText = Object.keys(selectedShapes).some((id) => {
    const shape = shapesEntities[id];
    return shape?.type === 'text';
  });

  useEffect(() => {
    if (hasSelectedText && !isSidebarOpen) {
      setIsSidebarOpen(true);
    } else if (!hasSelectedText) {
      setIsSidebarOpen(false);
    }
  }, [hasSelectedText, isSidebarOpen]);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const touchMapRef = useRef<Map<number, TouchPointer>>(new Map());

  const buttonActionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Preview shape for the mouse while drawing
  const draftShapeRef = useRef<DraftShape | null>(null);
  const freeDrawPointsRef = useRef<Point[]>([]);
  const isSpacePressed = useRef<boolean>(false);
  const isDrawingRef = useRef<boolean>(false);
  const isMovingRef = useRef<boolean>(false);
  const moveStartRef = useRef<Point | null>(null);

  const initialShapePositionRef = useRef<
    Record<
      string,
      {
        x?: number;
        y?: number;
        points?: Point[];
        startX?: number;
        startY?: number;
        endX?: number;
        endY?: number;
      }
    >
  >({});

  const isErasingRef = useRef<boolean>(false);
  const erasedShapesRef = useRef<Set<string>>(new Set());

  const isResizingRef = useRef<boolean>(false);
  const resizeDataRef = useRef<{
    shapeId: string;
    corner: 'nw' | 'ne' | 'sw' | 'se';
    initialBounds: {
      x: number;
      y: number;
      w: number;
      h: number;
    };
    startPoint: {
      x: number;
      y: number;
    };
  } | null>(null);

  const lastFreehandFrameRef = useRef<number>(0);
  const freehandRafRef = useRef<number | null>(null);
  const panRafRef = useRef<number | null>(null);
  const pendingPanPointRef = useRef<Point | null>(null);

  const [, force] = useState(0);
  const requestRender = useCallback((): void => {
    force((n) => (n + 1) | 0);
  }, []);

  const localPointFromClient = useCallback((clientX: number, clientY: number): Point => {
    const el = canvasRef.current;
    if (!el) {
      return { x: clientX, y: clientY };
    }

    const r = el.getBoundingClientRect();
    return {
      x: clientX - r.left,
      y: clientY - r.top,
    };
  }, []);

  const blurActiveTextInput = useCallback(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el) return;

    const isInput = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
    const isEditable = el.isContentEditable;

    if (isInput || isEditable) el.blur();
  }, []);

  const getLocalPointFromPtr = useCallback(
    (e: WithClientXY): Point => {
      return localPointFromClient(e.clientX, e.clientY);
    },
    [localPointFromClient],
  );

  const distanceToLineSegment = useCallback(
    (point: Point, lineStart: Point, lineEnd: Point): number => {
      const A = point.x - lineStart.x;
      const B = point.y - lineStart.y;
      const C = lineEnd.x - lineStart.x;
      const D = lineEnd.y - lineStart.y;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;

      let param = -1;
      if (lenSq !== 0) {
        param = dot / lenSq;
      }

      let xx, yy;
      if (param < 0) {
        xx = lineStart.x;
        yy = lineStart.y;
      } else if (param > 1) {
        xx = lineEnd.x;
        yy = lineEnd.y;
      } else {
        xx = lineStart.x + param * C;
        yy = lineStart.y + param * D;
      }

      const dx = point.x - xx;
      const dy = point.y - yy;
      return Math.sqrt(dx * dx + dy * dy);
    },
    [],
  );

  const isPointInShape = useCallback(
    (point: Point, shape: Shape): boolean => {
      switch (shape.type) {
        case 'frame':
        case 'rect':
        case 'ellipse':
        case 'generated-ui':
          return (
            point.x >= shape.x &&
            point.x <= shape.x + shape.w &&
            point.y >= shape.y &&
            point.y <= shape.y + shape.h
          );
        case 'free-draw': {
          const threshold = 5;

          for (let i = 0; i < shape.points.length - 1; i++) {
            const p1 = shape.points[i];
            const p2 = shape.points[i + 1];
            if (distanceToLineSegment(point, p1, p2) <= threshold) {
              return true;
            }
          }
          return false;
        }
        case 'arrow':
        case 'line': {
          const lineThreshold = 8;

          return (
            distanceToLineSegment(
              point,
              { x: shape.startX, y: shape.startY },
              { x: shape.endX, y: shape.endY },
            ) <= lineThreshold
          );
        }
        case 'text': {
          const textWidth = Math.max(shape.text.length * (shape.fontSize * 0.6), 100);
          const textHeight = shape.fontSize * 1.2;
          const padding = 8;

          return (
            point.x >= shape.x - 2 &&
            point.x <= shape.x + textWidth + padding + 2 &&
            point.y >= shape.y - 2 &&
            point.y <= shape.y + textHeight + padding + 2
          );
        }
        default:
          return false;
      }
    },
    [distanceToLineSegment],
  );

  const getShapeAtPoint = useCallback(
    (worldPoint: Point): Shape | null => {
      for (let i = shapeList.length - 1; i >= 0; i--) {
        const shape = shapeList[i];
        if (isPointInShape(worldPoint, shape)) {
          return shape;
        }
      }

      return null;
    },
    [isPointInShape, shapeList],
  );

  const schedulePanMove = useCallback(
    (p: Point) => {
      pendingPanPointRef.current = p;
      if (pendingPanPointRef.current !== null) return;

      panRafRef.current = window.requestAnimationFrame(() => {
        const next = pendingPanPointRef.current;
        pendingPanPointRef.current = null;
        panRafRef.current = null;

        if (next) {
          dispatch(panMove(next));
        }
      });
    },
    [dispatch],
  );

  const freehandTick = useCallback((): void => {
    const now = performance.now();
    if (now - lastFreehandFrameRef.current >= RAF_INTERVAL_MS) {
      if (freeDrawPointsRef.current.length > 0) {
        requestRender();
      }

      lastFreehandFrameRef.current = now;
    }

    if (isDrawingRef.current) {
      freehandRafRef.current = window.requestAnimationFrame(freehandTick);
    }
  }, [requestRender]);

  const onWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      const originScreen = localPointFromClient(e.clientX, e.clientY);
      if (e.ctrlKey || e.metaKey) {
        dispatch(wheelZoom({ deltaY: e.deltaY, originScreen }));
      } else {
        const dx = e.shiftKey ? e.deltaY : e.deltaX;
        const dy = e.shiftKey ? 0 : e.deltaY;
        dispatch(wheelPan({ dx: -dx, dy: -dy }));
      }
    },
    [dispatch, localPointFromClient],
  );

  const setInitialShapePosition = useCallback((shape: Shape) => {
    if (
      shape.type === 'frame' ||
      shape.type === 'rect' ||
      shape.type === 'ellipse' ||
      shape.type === 'generated-ui'
    ) {
      initialShapePositionRef.current[shape.id] = {
        x: shape.x,
        y: shape.y,
      };
    } else if (shape.type === 'free-draw') {
      initialShapePositionRef.current[shape.id] = {
        points: [...shape.points],
      };
    } else if (shape.type === 'arrow' || shape.type === 'line') {
      initialShapePositionRef.current[shape.id] = {
        startX: shape.startX,
        startY: shape.startY,
        endX: shape.endX,
        endY: shape.endY,
      };
    } else if (shape.type === 'text') {
      initialShapePositionRef.current[shape.id] = {
        x: shape.x,
        y: shape.y,
      };
    }
  }, []);

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const isButton =
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.classList.contains('pointer-events-auto') ||
        target.closest('.pointer-events-auto');

      if (isButton) {
        console.log('🪞 Not preventing default - clicked on interactive element:');
        return; // Don't handle canvas interactions when clicking buttons
      }

      e.preventDefault();

      const local = getLocalPointFromPtr(e.nativeEvent);
      const world = screenToWorld(local, viewport.translate, viewport.scale);

      if (touchMapRef.current.size <= 1) {
        canvasRef.current?.setPointerCapture?.(e.pointerId);
        const isPanButton = e.button === 1 || e.button === 2;
        const panByShift = isSpacePressed.current && e.button === 0;

        if (isPanButton || panByShift) {
          const mode = isSpacePressed.current ? 'shiftPanning' : 'panning';
          dispatch(panStart({ screen: local, mode }));
          return;
        }

        if (e.button === 0) {
          if (currentTool === 'select') {
            const hitShape = getShapeAtPoint(world);
            if (hitShape) {
              const isAlreadySelected = selectedShapes[hitShape.id];
              // Handle add extra shape
              if (!isAlreadySelected) {
                dispatch(!e.shiftKey ? clearSelection() : selectShape(hitShape.id));
              }

              isMovingRef.current = true;
              moveStartRef.current = world;

              initialShapePositionRef.current = {};
              Object.keys(selectedShapes).forEach((id) => {
                const shape = entityState.entities[id];
                if (shape) {
                  setInitialShapePosition(shape);
                }
              });

              setInitialShapePosition(hitShape);
            } else {
              // Clicked on empty space - clear selection and blur any active text inputs
              if (!e.shiftKey) {
                dispatch(clearSelection());
                blurActiveTextInput();
              }
            }
          } else if (currentTool === 'eraser') {
            isErasingRef.current = true;
            erasedShapesRef.current.clear();

            const hitShape = getShapeAtPoint(world);
            if (hitShape) {
              dispatch(removeShape(hitShape.id));
              erasedShapesRef.current.add(hitShape.id);
            } else {
              blurActiveTextInput();
            }
          } else if (currentTool === 'text') {
            dispatch(addText({ x: world.x, y: world.y }));
            dispatch(setTool('select'));
          } else {
            isDrawingRef.current = true;
            if (
              currentTool === 'frame' ||
              currentTool === 'rect' ||
              currentTool === 'ellipse' ||
              currentTool === 'arrow' ||
              currentTool === 'line'
            ) {
              console.log('Starting to draw: ', currentTool, 'at:', world);
              draftShapeRef.current = {
                type: currentTool,
                startWorld: world,
                currentWorld: world,
              };
              requestRender();
            } else if (currentTool === 'free-draw') {
              freeDrawPointsRef.current = [world];
              lastFreehandFrameRef.current = performance.now();
              freehandRafRef.current = window.requestAnimationFrame(freehandTick);
              requestRender();
            }
          }
        }
      }
    },
    [
      blurActiveTextInput,
      currentTool,
      dispatch,
      entityState.entities,
      freehandTick,
      getLocalPointFromPtr,
      getShapeAtPoint,
      requestRender,
      selectedShapes,
      setInitialShapePosition,
      viewport.scale,
      viewport.translate,
    ],
  );

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const local = getLocalPointFromPtr(e.nativeEvent);
      const world = screenToWorld(local, viewport.translate, viewport.scale);

      if (viewport.mode === 'panning' || viewport.mode === 'shiftPanning') {
        schedulePanMove(local);
        return;
      }

      if (isErasingRef.current && currentTool === 'eraser') {
        const hitShape = getShapeAtPoint(world);
        if (hitShape && !erasedShapesRef.current.has(hitShape.id)) {
          // Delete the shape if we haven't already deleted it in this drag
          dispatch(removeShape(hitShape.id));
          erasedShapesRef.current.add(hitShape.id);
        }
      }

      if (isMovingRef.current && moveStartRef.current && currentTool === 'select') {
        const deltaX = world.x - moveStartRef.current.x;
        const deltaY = world.y - moveStartRef.current.y;

        Object.keys(initialShapePositionRef.current).forEach((id) => {
          const initialPos = initialShapePositionRef.current[id];
          const shape = entityState.entities[id];

          if (shape && initialPos) {
            if (
              shape.type === 'frame' ||
              shape.type === 'rect' ||
              shape.type === 'ellipse' ||
              shape.type === 'text' ||
              shape.type === 'generated-ui'
            ) {
              if (typeof initialPos.x === 'number' && typeof initialPos.y === 'number') {
                dispatch(
                  updateShape({
                    id,
                    patch: {
                      x: initialPos.x + deltaX,
                      y: initialPos.y + deltaY,
                    },
                  }),
                );
              }
            } else if (shape.type === 'free-draw') {
              const initialPoints = initialPos.points;
              if (initialPoints) {
                const newPoints = initialPoints.map((point) => ({
                  x: point.x + deltaX,
                  y: point.y + deltaY,
                }));

                dispatch(
                  updateShape({
                    id,
                    patch: {
                      points: newPoints,
                    },
                  }),
                );
              }
            } else if (shape.type === 'arrow' || shape.type === 'line') {
              if (
                typeof initialPos.startX === 'number' &&
                typeof initialPos.startY === 'number' &&
                typeof initialPos.endX === 'number' &&
                typeof initialPos.endY === 'number'
              ) {
                dispatch(
                  updateShape({
                    id,
                    patch: {
                      startX: initialPos.startX + deltaX,
                      startY: initialPos.startY + deltaY,
                      endX: initialPos.endX + deltaX,
                      endY: initialPos.endY + deltaY,
                    },
                  }),
                );
              }
            }
          }
        });
      }

      if (isDrawingRef.current) {
        if (draftShapeRef.current) {
          draftShapeRef.current.currentWorld = world;
          requestRender();
        } else if (currentTool === 'free-draw') {
          freeDrawPointsRef.current.push(world);
        }
      }
    },
    [
      currentTool,
      dispatch,
      entityState.entities,
      getLocalPointFromPtr,
      getShapeAtPoint,
      requestRender,
      schedulePanMove,
      viewport.mode,
      viewport.scale,
      viewport.translate,
    ],
  );

  const finalizeDrawingIfAny = useCallback((): void => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (freehandRafRef.current) {
      window.cancelAnimationFrame(freehandRafRef.current);
      freehandRafRef.current = null;
    }

    const draft = draftShapeRef.current;
    if (draft) {
      const x = Math.min(draft.startWorld.x, draft.currentWorld.x);
      const y = Math.min(draft.startWorld.y, draft.currentWorld.y);
      const w = Math.abs(draft.currentWorld.x - draft.startWorld.x);
      const h = Math.abs(draft.currentWorld.y - draft.startWorld.y);

      if (w > 1 && h > 1) {
        const frame = { x, y, w, h };
        if (draft.type === 'frame') {
          console.log('Adding frame shape: ', frame);
          dispatch(addFrame(frame));
        } else if (draft.type === 'rect') {
          dispatch(addRect(frame));
        } else if (draft.type === 'ellipse') {
          dispatch(addEllipse(frame));
        } else if (draft.type === 'arrow') {
          dispatch(
            addArrow({
              startX: draft.startWorld.x,
              startY: draft.startWorld.y,
              endX: draft.currentWorld.x,
              endY: draft.currentWorld.y,
            }),
          );
        } else if (draft.type === 'line') {
          dispatch(
            addLine({
              startX: draft.startWorld.x,
              startY: draft.startWorld.y,
              endX: draft.currentWorld.x,
              endY: draft.currentWorld.y,
            }),
          );
        }
      }

      draftShapeRef.current = null;
    } else if (currentTool === 'free-draw') {
      const pts = freeDrawPointsRef.current;
      if (pts.length > 1) {
        dispatch(addFreeDrawShape({ points: pts }));
      }
      freeDrawPointsRef.current = [];
    }

    requestRender();
  }, [currentTool, dispatch, requestRender]);

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      canvasRef.current?.releasePointerCapture?.(e.pointerId);

      if (viewport.mode === 'panning' || viewport.mode === 'shiftPanning') {
        dispatch(panEnd());
      }

      if (isMovingRef.current) {
        isMovingRef.current = false;
        moveStartRef.current = null;
        initialShapePositionRef.current = {};
      }

      if (isErasingRef.current) {
        isErasingRef.current = false;
        erasedShapesRef.current.clear();
      }

      finalizeDrawingIfAny();
    },
    [dispatch, finalizeDrawingIfAny, viewport.mode],
  );

  const onPointerCancel: React.PointerEventHandler<HTMLDivElement> = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      onPointerUp(e);
    },
    [onPointerUp],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if ((e.code === 'ShiftLeft' || e.code === 'ShiftRight') && !e.repeat) {
        e.preventDefault();
        isSpacePressed.current = true; // Keep the same ref name for consistency
        dispatch(handToolEnable());
      }

      // 👇 Escape: reset tool to "select"
      if (e.code === 'Escape') {
        e.preventDefault();
        dispatch(setTool('select'));
        buttonActionRefs.current['select']?.focus();
        dispatch(clearSelection()); // [optional] deselect everything
      }
    },
    [dispatch],
  );

  const onKeyUp = useCallback(
    (e: KeyboardEvent): void => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        e.preventDefault();
        isSpacePressed.current = false;
        dispatch(handToolDisable());
      }
    },
    [dispatch],
  );

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    document.addEventListener('keydown', onKeyDown, { signal });
    document.addEventListener('keyup', onKeyUp, { signal });

    return () => {
      controller.abort();

      if (freehandRafRef.current) {
        window.cancelAnimationFrame(freehandRafRef.current);
      }

      if (panRafRef.current) {
        window.cancelAnimationFrame(panRafRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Cleanup function only need to be happened once

  useEffect(() => {
    const handleResizeStart = (e: CustomEvent) => {
      const { shapeId, corner, bounds } = e.detail;
      isResizingRef.current = true;
      resizeDataRef.current = {
        shapeId,
        corner,
        initialBounds: bounds,
        startPoint: {
          x: e.detail.clientX || 0,
          y: e.detail.clientY || 0,
        },
      };
    };

    const handleResizeMove = (e: CustomEvent) => {
      if (!isResizingRef.current || !resizeDataRef.current) return;
      const { shapeId, corner, initialBounds } = resizeDataRef.current;
      const { clientX, clientY } = e.detail;

      const canvasEl = canvasRef.current;
      if (!canvasEl) return;

      const rect = canvasEl.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      const world = screenToWorld({ x: localX, y: localY }, viewport.translate, viewport.scale);

      const shape = entityState.entities[shapeId];
      if (!shape) return;

      const newBounds = { ...initialBounds };
      switch (corner) {
        case 'nw':
          newBounds.w = Math.max(10, initialBounds.w + (initialBounds.x - world.x));
          newBounds.h = Math.max(10, initialBounds.h + (initialBounds.y - world.y));
          newBounds.x = world.x;
          newBounds.y = world.y;
          break;
        case 'ne':
          newBounds.w = Math.max(10, world.x - initialBounds.x);
          newBounds.h = Math.max(10, initialBounds.y - world.y);
          newBounds.y = world.y;
          break;
        case 'sw':
          newBounds.w = Math.max(10, initialBounds.w + (initialBounds.x - world.x));
          newBounds.h = Math.max(10, world.y - initialBounds.y);
          newBounds.x = world.x;
          break;
        case 'se':
          newBounds.w = Math.max(10, world.x - initialBounds.x);
          newBounds.h = Math.max(10, world.y - initialBounds.y);
          break;
      }

      if (shape.type === 'frame' || shape.type === 'rect' || shape.type === 'ellipse') {
        dispatch(
          updateShape({
            id: shapeId,
            patch: {
              x: newBounds.x,
              y: newBounds.y,
              w: newBounds.w,
              h: newBounds.h,
            },
          }),
        );
      } else if (shape.type === 'free-draw') {
        const { minX, minY, width, height } = polylineBox(shape.points);

        const newX = newBounds.x + RESIZE_PADDING; // remove padding
        const newY = newBounds.y + RESIZE_PADDING;
        const newWidth = Math.max(SHAPE_MIN_SIZE, newBounds.w - RESIZE_PADDING * 2); // Minimum size and remove padding
        const newHeight = Math.max(SHAPE_MIN_SIZE, newBounds.h - RESIZE_PADDING * 2);

        const scaleX = width > 0 ? newWidth / width : 1;
        const scaleY = height > 0 ? newHeight / height : 1;

        const scalePoints: Point[] = shape.points.map((point: Point) => ({
          x: newX + (point.x - minX) * scaleX,
          y: newY + (point.y - minY) * scaleY,
        }));

        dispatch(
          updateShape({
            id: shapeId,
            patch: {
              points: scalePoints,
            },
          }),
        );
      } else if (shape.type === 'line' || shape.type === 'arrow') {
        const minX = Math.min(shape.startX, shape.endX);
        const maxX = Math.max(shape.startX, shape.endX);
        const minY = Math.min(shape.startY, shape.endY);
        const maxY = Math.max(shape.startY, shape.endY);
        const width = maxX - minX;
        const height = maxY - minY;

        const newX = newBounds.x + RESIZE_PADDING;
        const newY = newBounds.y + RESIZE_PADDING;
        const newWidth = Math.max(SHAPE_MIN_SIZE, newBounds.w - RESIZE_PADDING * 2); // Minimum size and remove padding
        const newHeight = Math.max(SHAPE_MIN_SIZE, newBounds.h - RESIZE_PADDING * 2);

        let newStartX, newStartY, newEndX, newEndY;
        if (width === 0) {
          newStartX = newX + newWidth / 2;
          newEndX = newX + newWidth / 2;
          newStartY = shape.startY < shape.endY ? newY : newY + newHeight;
          newEndY = shape.startY < shape.endY ? newY + newHeight : newY;
        } else if (height === 0) {
          newStartX = shape.startX < shape.endX ? newX : newX + newWidth;
          newEndX = shape.startX < shape.endX ? newX + newWidth : newX;
          newStartY = newY + newHeight / 2;
          newEndY = newY + newHeight / 2;
        } else {
          const scaleX = newWidth / width;
          const scaleY = newHeight / height;

          newStartX = newX + (shape.startX - minX) * scaleX;
          newStartY = newY + (shape.startY - minY) * scaleY;
          newEndX = newX + (shape.endX - minX) * scaleX;
          newEndY = newY + (shape.endY - minY) * scaleY;
        }

        dispatch(
          updateShape({
            id: shapeId,
            patch: {
              startX: newStartX,
              startY: newStartY,
              endX: newEndX,
              endY: newEndY,
            },
          }),
        );
      }
    };

    const handleResizeEnd = () => {
      isResizingRef.current = false;
      resizeDataRef.current = null;
    };

    const controller = new AbortController();
    const { signal } = controller;
    window.addEventListener('shape-resize-start', <EventListener>handleResizeStart, { signal });
    window.addEventListener('shape-resize-move', <EventListener>handleResizeMove, { signal });
    window.addEventListener('shape-resize-end', <EventListener>handleResizeEnd, { signal });

    return () => {
      controller.abort();
    };
  }, [dispatch, entityState.entities, viewport.translate, viewport.scale]);

  const attachCanvasRef = useCallback(
    (ref: HTMLDivElement | null): void => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('wheel', onWheel);
      }

      // Store the new canvas reference
      canvasRef.current = ref;

      // Add wheel event listener to the new canvas (for zoom/pan)
      if (ref) {
        ref.addEventListener('wheel', onWheel, { passive: false });
      }
    },
    [onWheel],
  );

  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('wheel', onWheel);
      }
    };
  }, [onWheel]);

  const selectTool = useCallback(
    (tool: Tool): void => {
      dispatch(setTool(tool));
    },
    [dispatch],
  );

  const getDraftShape = (): DraftShape | null => draftShapeRef.current;
  const getFreeDrawPoints = (): ReadonlyArray<Point> => freeDrawPointsRef.current;

  return {
    viewport,
    shapes: shapeList,
    currentTool,
    selectedShapes,

    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,

    attachCanvasRef,
    selectTool,
    getDraftShape,
    getFreeDrawPoints,

    isSidebarOpen,
    hasSelectedText,
    setIsSidebarOpen,
    buttonActionRefs,
  };
};
