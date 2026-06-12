import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ClerkClaims, claimsHaveAdmin, getClerkId } from '../clerk-claims';

/**
 * Allows the request only if the current user is an ADMIN member of the circle
 * referenced by the route param (`:id` or `:circleId`). Global admins always pass.
 *
 * Maps the Clerk user id (JWT `sub`) to our DB user via `User.clerkId`, then
 * checks the Membership role. No external secret required.
 *
 * Must run after ClerkAuthGuard.
 */
@Injectable()
export class CircleAdminGuard implements CanActivate {
    constructor(private prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<{
            user?: ClerkClaims;
            params: Record<string, string>;
        }>();

        if (claimsHaveAdmin(request.user)) return true;

        const clerkId = getClerkId(request);
        const circleId = request.params.id ?? request.params.circleId;
        if (!clerkId || !circleId) throw new ForbiddenException();

        const membership = await this.prisma.membership.findFirst({
            where: { circleId, role: 'ADMIN', user: { clerkId } },
            select: { id: true },
        });
        if (!membership) {
            throw new ForbiddenException('Circle admin role required');
        }
        return true;
    }
}
