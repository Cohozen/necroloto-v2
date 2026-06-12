import { MembershipRole } from '@/prisma/enums';

export class UpdateMembershipDto {
  role?: MembershipRole;
}
