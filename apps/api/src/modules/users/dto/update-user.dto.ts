import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    image?: string;

    // Nullable on purpose: a cleared username is sent as null. @IsOptional()
    // lets null/undefined through, so @IsString() only runs on a real string.
    @IsOptional()
    @IsString()
    username?: string | null;

    @IsOptional()
    @IsString()
    firstname?: string;

    @IsOptional()
    @IsString()
    lastname?: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    clerkUpdatedAt?: Date;
}
