import { MembershipRole } from '@/prisma/enums';

export class SearchMembershipDto {
    userId?: string;
    circleId?: string;
    role?: MembershipRole;
}
