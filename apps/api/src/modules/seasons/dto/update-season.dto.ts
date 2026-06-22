import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSeasonDto {
    @IsOptional()
    @IsNumber()
    year?: number;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    openDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    betStartDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    betEndDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    closeDate?: Date;
}
