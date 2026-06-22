import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSeasonDto {
    @IsNumber()
    year: number;

    @IsOptional()
    @IsString()
    name?: string;

    @Type(() => Date)
    @IsDate()
    openDate: Date;

    @Type(() => Date)
    @IsDate()
    betStartDate: Date;

    @Type(() => Date)
    @IsDate()
    betEndDate: Date;

    @Type(() => Date)
    @IsDate()
    closeDate: Date;
}
