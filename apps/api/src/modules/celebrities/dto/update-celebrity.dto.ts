import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateCelebrityDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    birth?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    death?: Date;

    @IsOptional()
    @IsString()
    photo?: string;

    @IsOptional()
    @IsString()
    role?: string;

    @IsOptional()
    @IsString()
    category?: string;
}
