import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type ClerkClaims, claimsHaveAdmin, getClerkId } from './clerk-claims';

/**
 * Clerk user id (JWT `sub`) of the authenticated request, or `undefined` when
 * absent. Requires `ClerkAuthGuard` to have set `request.user`. Services then
 * map it to a DB `User` via `clerkId` to resolve the viewer.
 */
export const CurrentClerkId = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): string | undefined => {
        const request = ctx.switchToHttp().getRequest<{ user?: ClerkClaims }>();
        return getClerkId(request);
    },
);

/**
 * Whether the authenticated request carries the global-admin role in its JWT
 * claims. Claim-only (no Clerk backend fallback) — use to widen visibility on
 * non-admin-guarded handlers (e.g. let admins open a pending celebrity fiche).
 */
export const IsAdminClaim = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): boolean => {
        const request = ctx.switchToHttp().getRequest<{ user?: ClerkClaims }>();
        return claimsHaveAdmin(request.user);
    },
);
