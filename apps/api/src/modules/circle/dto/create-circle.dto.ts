import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { CircleStatus, CircleVisibility } from '@/prisma/enums';

export class CreateCircleDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsEnum(CircleVisibility)
    visibility?: CircleVisibility;

    @IsOptional()
    @IsEnum(CircleStatus)
    status?: CircleStatus;

    @IsOptional()
    @IsString()
    code?: string;

    @IsBoolean()
    allowNewBet: boolean;

    @IsOptional()
    @IsBoolean()
    allowEdit?: boolean;

    @IsOptional()
    @IsBoolean()
    betsVisible?: boolean;

    /** Clerk-resolved creator; added as the circle's first ADMIN member. */
    @IsOptional()
    @IsString()
    creatorUserId?: string;
}
