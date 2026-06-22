import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MembershipRole } from '@/prisma/enums';

export class CreateMembershipDto {
    @IsString()
    userId: string;

    @IsString()
    circleId: string;

    @IsOptional()
    @IsEnum(MembershipRole)
    role?: MembershipRole;
}
