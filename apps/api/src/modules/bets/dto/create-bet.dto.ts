import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBetDto {
    @IsString()
    userId: string;

    @IsOptional()
    @IsString()
    circleId?: string;

    @IsNumber()
    year: number;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    celebrityIds?: string[];
}
