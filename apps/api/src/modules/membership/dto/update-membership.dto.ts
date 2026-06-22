import { IsEnum, IsOptional } from 'class-validator';
import { MembershipRole } from '@/prisma/enums';

export class UpdateMembershipDto {
    @IsOptional()
    @IsEnum(MembershipRole)
    role?: MembershipRole;
}
