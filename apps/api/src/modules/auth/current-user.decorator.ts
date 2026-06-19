import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type ClerkClaims, getClerkId } from './clerk-claims';

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
