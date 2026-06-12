import { verifyToken } from '@clerk/backend';
import {
    type CanActivate,
    type ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

interface AuthRequest {
    headers: { authorization?: string };
    user?: unknown;
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
    private extractTokenFromHeader(request: AuthRequest): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthRequest>();
        const token = this.extractTokenFromHeader(request);

        if (!token) throw new UnauthorizedException();

        try {
            request.user = await verifyToken(token, {
                jwtKey: process.env.CLERK_JWT_KEY,
            });
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }
}
