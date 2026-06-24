/**
 * Maps raw Wikidata facets to the coarse, filter-friendly values stored on
 * `Celebrity.category` / `Celebrity.gender`. The free-text `role` keeps the exact
 * first-occupation label; `category` is the bucket used by the catalogue filters.
 *
 * The occupation map is a curated subset of the most common P106 occupation Q-ids —
 * an entity with no mapped occupation simply gets no category (filter shows "Autre"
 * client-side / no match). Extend it as gaps surface; it never affects scoring.
 */

/** Ordered list of category buckets — drives the filter menu order. */
export const CATEGORY_BUCKETS = [
    'Cinéma & TV',
    'Musique',
    'Sport',
    'Politique',
    'Littérature',
    'Art',
    'Science',
    'Médias',
    'Affaires',
    'Mode',
    'Humour',
    'Religion',
] as const;

export type CelebrityCategory = (typeof CATEGORY_BUCKETS)[number];

/** Wikidata occupation Q-id (P106) → coarse category bucket. */
const OCCUPATION_CATEGORY: Record<string, CelebrityCategory> = {
    // Cinéma & TV
    Q33999: 'Cinéma & TV', // acteur
    Q10800557: 'Cinéma & TV', // acteur de cinéma
    Q10798782: 'Cinéma & TV', // acteur de télévision
    Q2405480: 'Cinéma & TV', // acteur de doublage
    Q2526255: 'Cinéma & TV', // réalisateur
    Q3282637: 'Cinéma & TV', // producteur de cinéma
    Q28389: 'Cinéma & TV', // scénariste
    // Musique
    Q177220: 'Musique', // chanteur
    Q639669: 'Musique', // musicien
    Q36834: 'Musique', // compositeur
    Q488205: 'Musique', // auteur-compositeur-interprète
    Q855091: 'Musique', // guitariste
    Q486748: 'Musique', // pianiste
    Q183945: 'Musique', // producteur de musique
    Q158852: 'Musique', // chef d'orchestre
    Q2252262: 'Musique', // rappeur
    Q130857: 'Musique', // DJ
    // Sport
    Q2066131: 'Sport', // sportif
    Q937857: 'Sport', // footballeur
    Q3665646: 'Sport', // basketteur
    Q10833314: 'Sport', // joueur de tennis
    Q11513337: 'Sport', // athlète (athlétisme)
    Q19204627: 'Sport', // joueur de football américain
    Q11338576: 'Sport', // boxeur
    Q10843402: 'Sport', // nageur
    Q378622: 'Sport', // pilote automobile
    Q13218361: 'Sport', // cycliste
    // Politique
    Q82955: 'Politique', // politicien
    Q372436: 'Politique', // homme/femme d'État
    Q193391: 'Politique', // diplomate
    Q486839: 'Politique', // parlementaire
    // Littérature
    Q36180: 'Littérature', // écrivain
    Q49757: 'Littérature', // poète
    Q6625963: 'Littérature', // romancier
    Q214917: 'Littérature', // dramaturge
    Q4964182: 'Littérature', // philosophe
    // Art
    Q483501: 'Art', // artiste
    Q1028181: 'Art', // peintre
    Q1281618: 'Art', // sculpteur
    Q33231: 'Art', // photographe
    Q42973: 'Art', // architecte
    // Science
    Q901: 'Science', // scientifique
    Q170790: 'Science', // mathématicien
    Q169470: 'Science', // physicien
    Q593644: 'Science', // chimiste
    Q864503: 'Science', // biologiste
    Q11063: 'Science', // astronome
    Q39631: 'Science', // médecin
    Q205375: 'Science', // inventeur
    // Médias
    Q1930187: 'Médias', // journaliste
    Q947873: 'Médias', // présentateur de télévision
    Q2722764: 'Médias', // animateur de radio
    // Affaires
    Q43845: 'Affaires', // homme/femme d'affaires
    Q131524: 'Affaires', // entrepreneur
    Q484876: 'Affaires', // directeur général
    // Mode
    Q3501317: 'Mode', // créateur de mode
    Q4610556: 'Mode', // mannequin
    // Humour
    Q245068: 'Humour', // humoriste
    // Religion
    Q42603: 'Religion', // prêtre
    Q2259532: 'Religion', // religieux/clerc
};

/** First mapped occupation → its category bucket, else undefined. */
export function deriveCategory(occupationIds: string[]): CelebrityCategory | undefined {
    for (const id of occupationIds) {
        const category = OCCUPATION_CATEGORY[id];
        if (category) return category;
    }
    return undefined;
}

/** Wikidata sex/gender Q-id (P21) → label. Unmapped non-empty ids fall back to "Autre". */
const GENDER_LABEL: Record<string, string> = {
    Q6581097: 'Homme', // masculin
    Q6581072: 'Femme', // féminin
};

export const GENDER_OPTIONS = ['Homme', 'Femme', 'Autre'] as const;

export function deriveGender(genderId?: string): string | undefined {
    if (!genderId) return undefined;
    return GENDER_LABEL[genderId] ?? 'Autre';
}
