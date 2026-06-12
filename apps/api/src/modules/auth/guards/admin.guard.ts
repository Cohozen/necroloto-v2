import { createClerkClient } from '@clerk/backend';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ClerkClaims, claimsHaveAdmin, getClerkId } from '../clerk-claims';

/**
 * Allows only global admins (manage the celebrity catalog, etc.).
 *
 * Primary path: read the `admin` role from the verified Clerk JWT claims — add
 * `{"metadata": "{{user.public_metadata}}"}` to the Clerk session token so
 * `public_metadata.roles` rides along (no per-request Clerk API call).
 *
 * Fallback: if the claim is absent and CLERK_SECRET_KEY is set, look the user
 * up via the Clerk backend API and read publicMetadata.roles.
 *
 * Must run after ClerkAuthGuard (which populates `request.user`).
 */
@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: ClerkClaims }>();

    if (claimsHaveAdmin(request.user)) return true;

    const clerkId = getClerkId(request);
    const secretKey = process.env.CLERK_SECRET_KEY;
    if (clerkId && secretKey) {
      try {
        const clerk = createClerkClient({ secretKey });
        const user = await clerk.users.getUser(clerkId);
        const roles = (user.publicMetadata?.roles ?? []) as unknown;
        if (Array.isArray(roles) && roles.includes('admin')) return true;
      } catch {
        // fall through to forbidden
      }
    }

    throw new ForbiddenException('Admin role required');
  }
}
