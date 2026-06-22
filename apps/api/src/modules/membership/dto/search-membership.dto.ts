import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MembershipRole } from '@/prisma/enums';

export class SearchMembershipDto {
    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    circleId?: string;

    @IsOptional()
    @IsEnum(MembershipRole)
    role?: MembershipRole;
}
