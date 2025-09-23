import { combinedSlug, extractNameFromEmail } from "@/lib/utils";

export type ConvexUserRaw = {
  _creationTime: number;
  _id: string;
  email: string;
  emailVerificationTime?: number;
  image?: string;
  name?: string;
};

export type Profile = {
  id: string;
  createdAtMs: number;
  email: string;
  emailVerifiedAtMs?: number;
  image?: string;
  name?: string;
};

export const normalizeProfile = (raw: ConvexUserRaw | null): Profile | null => {
  if (!raw) return null;

  const name = combinedSlug(raw.name!) || extractNameFromEmail(raw.email);

  return {
    id: raw._id,
    createdAtMs: raw._creationTime,
    email: raw.email,
    emailVerifiedAtMs: raw.emailVerificationTime,
    image: raw.image,
    name,
  };
};
