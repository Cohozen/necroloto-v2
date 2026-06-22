import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class SearchCelebrityDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsBoolean()
    isAlive?: boolean;

    @IsOptional()
    @IsNumber()
    birthYear?: number;
}
