import { IsOptional, IsString } from 'class-validator';

export class EnrichCelebrityDto {
    // Optional explicit Wikidata Q-id to link (admin disambiguation).
    // When absent, the celebrity's existing link or the best name match is used.
    @IsOptional()
    @IsString()
    wikidataId?: string;
}
