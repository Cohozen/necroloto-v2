import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBetDto {
    @IsOptional()
    @IsNumber()
    year?: number;

    @IsOptional()
    @IsString()
    circleId?: string;
}
