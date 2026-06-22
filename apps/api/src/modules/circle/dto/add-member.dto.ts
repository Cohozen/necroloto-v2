import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MembershipRole } from '@/prisma/enums';

export class AddMemberDto {
    @IsString()
    userId: string;

    @IsOptional()
    @IsEnum(MembershipRole)
    role?: MembershipRole;
}
