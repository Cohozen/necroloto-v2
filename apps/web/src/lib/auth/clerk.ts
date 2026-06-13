// Clerk publishable key from env. When absent (e.g. local dev before keys are
// wired), the app runs without the auth gate so the UI stays previewable.
export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '';

export const isClerkConfigured = CLERK_PUBLISHABLE_KEY.length > 0;
