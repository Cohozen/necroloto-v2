import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class EnrichCelebrityDto {
    // Optional explicit Wikidata Q-id to link (admin disambiguation).
    // When absent, the celebrity's existing link or the best name match is used.
    @IsOptional()
    @IsString()
    wikidataId?: string;

    // Re-download the Commons photo even when the celebrity already has one
    // (the default re-sync keeps the existing photo).
    @IsOptional()
    @IsBoolean()
    forcePhoto?: boolean;

    // Only resynchronise the photo — skip dates/role/facets and the rescore.
    @IsOptional()
    @IsBoolean()
    photoOnly?: boolean;
}
