import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { CircleStatus, CircleVisibility } from '@/prisma/enums';

export class UpdateCircleDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEnum(CircleVisibility)
    visibility?: CircleVisibility;

    @IsOptional()
    @IsEnum(CircleStatus)
    status?: CircleStatus;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsBoolean()
    allowNewBet?: boolean;

    @IsOptional()
    @IsBoolean()
    allowEdit?: boolean;

    @IsOptional()
    @IsBoolean()
    betsVisible?: boolean;
}
