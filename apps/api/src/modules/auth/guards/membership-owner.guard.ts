import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ClerkClaims, claimsHaveAdmin, getClerkId } from '../clerk-claims';

/**
 * Allows the request only if the current user may delete the membership
 * referenced by the route param (`:id`). That means the caller either:
 *  - owns the membership (its `userId` maps to the JWT `sub`), or
 *  - is an ADMIN member of the membership's circle, or
 *  - is a global admin.
 *
 * Maps the Clerk user id (JWT `sub`) to our DB user via `User.clerkId`, mirroring
 * CircleAdminGuard. Must run after ClerkAuthGuard.
 */
@Injectable()
export class MembershipOwnerGuard implements CanActivate {
    constructor(private prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<{
            user?: ClerkClaims;
            params: Record<string, string>;
        }>();

        if (claimsHaveAdmin(request.user)) return true;

        const clerkId = getClerkId(request);
        const membershipId = request.params.id;
        if (!clerkId || !membershipId) throw new ForbiddenException();

        const membership = await this.prisma.membership.findUnique({
            where: { id: membershipId },
            select: { circleId: true, user: { select: { clerkId: true } } },
        });
        if (!membership) throw new NotFoundException('Membership not found');

        // The caller owns this membership.
        if (membership.user.clerkId === clerkId) return true;

        // Or the caller is an ADMIN member of the membership's circle.
        const adminMembership = await this.prisma.membership.findFirst({
            where: { circleId: membership.circleId, role: 'ADMIN', user: { clerkId } },
            select: { id: true },
        });
        if (adminMembership) return true;

        throw new ForbiddenException('You may only remove your own membership');
    }
}
