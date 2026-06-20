/**
 * Payload for a player proposing a missing celebrity from the bet draft.
 * When `wikidataId` is set the service enriches from Wikidata (and dedupes on
 * the unique entity); otherwise the manual fields are stored verbatim.
 */
export class ProposeCelebrityDto {
    name: string;
    wikidataId?: string;
    birth?: Date;
    death?: Date;
    photo?: string;
    role?: string;
    category?: string;
}
