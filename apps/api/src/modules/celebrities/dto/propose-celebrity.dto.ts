import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

/**
 * Payload for a player proposing a missing celebrity from the bet draft.
 * When `wikidataId` is set the service enriches from Wikidata (and dedupes on
 * the unique entity); otherwise the manual fields are stored verbatim.
 */
export class ProposeCelebrityDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    wikidataId?: string;

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
