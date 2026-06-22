import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
    @IsString()
    clerkId: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    firstname?: string;

    @IsOptional()
    @IsString()
    lastname?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    clerkCreatedAt?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    clerkUpdatedAt?: Date;
}
