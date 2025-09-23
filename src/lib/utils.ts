import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const extractNameFromEmail = (email: string): string => {
  const username = email.split("@")[0];
  return username
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

export const combinedSlug = (
  name: string | undefined,
  maxLen = 80
): string | null => {
  if (!name) {
    return null;
  }

  let s = name
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

  if (!s) {
    return null;
  }

  if (s.length > maxLen) {
    s = s.slice(0, maxLen);
  }

  return s;
};
