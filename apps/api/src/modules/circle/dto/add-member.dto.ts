import { MembershipRole } from '@/prisma/enums';

export class AddMemberDto {
  userId: string;
  role?: MembershipRole;
}
