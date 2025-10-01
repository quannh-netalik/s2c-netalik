import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Point } from '@/redux/slice/viewport';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const extractNameFromEmail = (email: string): string => {
  const username = email.split('@')[0];
  return username
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export const combinedSlug = (name: string | undefined, maxLen = 80): string | null => {
  if (!name) {
    return null;
  }

  let s = name
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '');

  if (!s) {
    return null;
  }

  if (s.length > maxLen) {
    s = s.slice(0, maxLen);
  }

  return s;
};

export const polylineBox = (points: ReadonlyArray<Point>) => {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (let i = 0; i < points.length; i++) {
    const { x, y } = points[i];
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
};
