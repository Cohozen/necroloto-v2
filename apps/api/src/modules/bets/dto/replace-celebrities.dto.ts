import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class ReplaceCelebritiesDto {
    // Each entry is a celebrity id, an existing name (case-insensitive),
    // or a new name to create on the fly.
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    celebrities: string[];
}
