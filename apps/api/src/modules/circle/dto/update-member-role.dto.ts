import { IsEnum } from 'class-validator';
import { MembershipRole } from '@/prisma/enums';

export class UpdateMemberRoleDto {
    @IsEnum(MembershipRole)
    role: MembershipRole;
}
