import { MembershipRole } from '@/prisma/enums';

export class CreateMembershipDto {
  userId: string;
  circleId: string;
  role?: MembershipRole;
}
