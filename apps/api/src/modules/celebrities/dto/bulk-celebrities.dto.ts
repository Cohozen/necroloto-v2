import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

/** A set of celebrity ids targeted by a bulk admin action. */
export class BulkCelebritiesDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    ids: string[];
}
