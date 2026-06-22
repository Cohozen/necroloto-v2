import { IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchBetDto {
    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    circleId?: string;

    @IsOptional()
    @IsNumber()
    year?: number;
}
