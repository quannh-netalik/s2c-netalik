export const isPublicRoutes = ["/auth(.*)", "/"];

export const isBypassRoutes = [
  "/api/polar/webhook",
  "/api/ingest(.*)",
  "/api/auth(.*)",
  "/convex(.*)",
];

export const isProtectedRoutes = ["/dashboard(.*)"];
