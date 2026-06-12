/**
 * Helpers to read identity/role information off a request that has already
 * passed `ClerkAuthGuard` (which sets `request.user` to the verified JWT claims).
 */

export interface ClerkClaims {
  sub?: string; // Clerk user id
  // Roles may surface under different claim names depending on how the Clerk
  // session token template is customized. We look them all up.
  metadata?: { roles?: unknown };
  publicMetadata?: { roles?: unknown };
  public_metadata?: { roles?: unknown };
  [key: string]: unknown;
}

export function getClerkId(request: { user?: ClerkClaims }): string | undefined {
  return request.user?.sub;
}

/** Extracts a string[] of roles from whichever metadata claim is present. */
export function getRolesFromClaims(claims: ClerkClaims | undefined): string[] {
  const raw =
    claims?.metadata?.roles ??
    claims?.publicMetadata?.roles ??
    claims?.public_metadata?.roles;
  if (Array.isArray(raw)) return raw.filter((r): r is string => typeof r === 'string');
  return [];
}

export function claimsHaveAdmin(claims: ClerkClaims | undefined): boolean {
  return getRolesFromClaims(claims).includes('admin');
}
