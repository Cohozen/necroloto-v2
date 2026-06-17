import { calculPointByCelebrity } from '@necroloto/shared/scoring';
import { Link } from '@tanstack/react-router';
import { Calendar, Camera, Check, Globe, Plus, Sparkles, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CelebrityPortrait } from '@/components/celebrities/CelebrityPortrait';
import { StatusBadge } from '@/components/celebrities/StatusBadge';
import { Button } from '@/components/ui/button';
import type { ApiCelebrity, CreateCelebrityPayload, WikidataSummaryDto } from '@/lib/api/types';
import { DeadSwitch } from './DeadSwitch';
import { DeleteCelebrityDialog } from './DeleteCelebrityDialog';
import { IconField } from './IconField';
import { ScoringInset } from './ScoringInset';
import { WikidataSearchDialog } from './WikidataSearchDialog';

interface CelebrityFormProps {
    mode: 'edit' | 'create';
    /** Existing fiche, required in edit mode. */
    celebrity?: ApiCelebrity;
    onSave: (payload: CreateCelebrityPayload) => void;
    onDelete?: () => void;
    /** Enrich from a chosen Wikidata QID (edit mode — runs immediately). */
    onEnrich?: (wikidataId: string) => void;
    /** Number of lists betting on this celebrity (edit mode, for the scoring inset). */
    bettors?: number;
    isSaving?: boolean;
    isDeleting?: boolean;
    isEnriching?: boolean;
    saveError?: boolean;
}

const YEAR = new Date().getFullYear();
const MAX_NAME = 60;

/** ISO date string → "YYYY-MM-DD" for a native date input. */
function isoToInput(iso?: string | null): string {
    return iso ? iso.slice(0, 10) : '';
}

/** "YYYY-MM-DD" → full ISO at UTC midnight (the column is @db.Date). */
function inputToIso(d: string): string {
    return `${d}T00:00:00.000Z`;
}

/** Mirrors the catalogue/detail scoring: awarded if dead, else potential this year. */
function previewPoints(birth: string, death: string, deceased: boolean): number {
    if (!birth) return 0;
    const birthDate = new Date(inputToIso(birth));
    const deathDate =
        deceased && death ? new Date(inputToIso(death)) : new Date(Date.UTC(YEAR, 11, 31));
    return calculPointByCelebrity(birthDate, deathDate);
}

/** Create / edit a catalogue celebrity, with the scoring-aware death toggle. */
export function CelebrityForm({
    mode,
    celebrity,
    onSave,
    onDelete,
    onEnrich,
    bettors = 0,
    isSaving,
    isDeleting,
    isEnriching,
    saveError,
}: CelebrityFormProps) {
    const create = mode === 'create';

    const [name, setName] = useState(celebrity?.name ?? '');
    const [birth, setBirth] = useState(isoToInput(celebrity?.birth));
    const [death, setDeath] = useState(isoToInput(celebrity?.death));
    const [deceased, setDeceased] = useState(!!celebrity?.death);
    const [role, setRole] = useState(celebrity?.role ?? '');
    // Edit mode reads the linked QID from the entity; create mode remembers the
    // candidate picked before the fiche exists (enriched after creation).
    const [pickedWikidataId, setPickedWikidataId] = useState<string | undefined>(undefined);

    // Re-seed from the entity when it changes (e.g. after an enrich refetch).
    // biome-ignore lint/correctness/useExhaustiveDependencies: seed on entity identity/content only.
    useEffect(() => {
        if (!celebrity) return;
        setName(celebrity.name ?? '');
        setBirth(isoToInput(celebrity.birth));
        setDeath(isoToInput(celebrity.death));
        setDeceased(!!celebrity.death);
        setRole(celebrity.role ?? '');
    }, [celebrity?.id, celebrity?.birth, celebrity?.death, celebrity?.name, celebrity?.role]);

    const wikidataId = celebrity?.wikidataId ?? pickedWikidataId;
    const trimmedName = name.trim();
    // A death must carry a date — the death year decides which bets get credited.
    const missingDeathDate = deceased && !death;
    const canSubmit = trimmedName.length > 0 && !isSaving && !missingDeathDate;

    const handleSelectWikidata = (c: WikidataSummaryDto) => {
        // Edit mode: enrich immediately (the entity exists). The refetch re-seeds
        // the fields. Create mode: prefill locally and report the QID to the parent,
        // which enriches once the fiche has been created.
        onEnrich?.(c.wikidataId);
        if (create) {
            if (!trimmedName) setName(c.label);
            setBirth(isoToInput(c.birth));
            if (c.death) {
                setDeath(isoToInput(c.death));
                setDeceased(true);
            }
            setPickedWikidataId(c.wikidataId);
        }
    };

    const handleSave = () => {
        if (!canSubmit) return;
        onSave({
            name: trimmedName,
            birth: birth ? inputToIso(birth) : null,
            death: deceased && death ? inputToIso(death) : null,
            role: role.trim() || null,
        });
    };

    const points = previewPoints(birth, death, deceased);

    return (
        <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-6 md:p-7">
            <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-neon/80 to-transparent" />

            {/* header: portrait + identity */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                <div className="flex w-[128px] shrink-0 flex-col gap-2.5">
                    {create ? (
                        <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-[18px] border border-dashed border-line-2 bg-surface text-ink-3">
                            <Camera size={26} />
                            <span className="text-center text-[11px] leading-tight">
                                Glisser
                                <br />
                                une image
                            </span>
                        </div>
                    ) : (
                        <CelebrityPortrait
                            name={trimmedName || '?'}
                            status={deceased ? 'deceased' : 'alive'}
                            rounded="rounded-[18px]"
                            className="aspect-square w-full"
                        />
                    )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col items-start gap-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neon">
                        {create ? 'Nouvelle célébrité' : 'Éditer la fiche'}
                    </span>
                    <h1
                        className={`font-display text-[40px] font-extrabold leading-[0.96] ${trimmedName ? '' : 'text-ink-3'}`}
                    >
                        {trimmedName || 'Sans nom'}
                    </h1>
                    {create && !trimmedName ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-surface px-2.5 py-1 text-xs font-medium text-ink-2">
                            <Plus size={13} strokeWidth={2} /> Brouillon non enregistré
                        </span>
                    ) : (
                        <StatusBadge
                            status={deceased ? 'deceased' : 'alive'}
                            deathLabel={undefined}
                        />
                    )}
                </div>
            </div>

            <hr className="my-6 border-line" />

            {/* identity fields */}
            <div className="grid gap-[18px] sm:grid-cols-2">
                <IconField
                    label="Nom complet"
                    icon={User}
                    sub={`${name.length} / ${MAX_NAME}`}
                    value={name}
                    onChange={(v) => setName(v.slice(0, MAX_NAME))}
                    placeholder="Nom de la célébrité"
                />
                <IconField
                    label="Date de naissance"
                    icon={Calendar}
                    type="date"
                    value={birth}
                    onChange={setBirth}
                    placeholder="JJ / MM / AAAA"
                />
            </div>

            <div className="mt-[18px]">
                <IconField
                    label="Rôle / métier"
                    icon={User}
                    value={role}
                    onChange={setRole}
                    placeholder="Ex. Actrice, Chanteur…"
                />
            </div>

            {/* Wikidata link + search */}
            <div className="mt-[18px] flex flex-col gap-2">
                <span className="text-[13px] font-semibold text-ink-2">Wikidata</span>
                <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-line-2 bg-surface-2 p-2.5">
                    <span className="inline-flex items-center gap-2 px-1 text-[13px]">
                        <Globe size={16} className="text-ink-3" />
                        {wikidataId ? (
                            <span className="font-mono text-ink">{wikidataId}</span>
                        ) : (
                            <span className="text-ink-3">Non lié</span>
                        )}
                    </span>
                    <WikidataSearchDialog
                        initialQuery={trimmedName}
                        onSelect={handleSelectWikidata}
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                            disabled={isEnriching}
                        >
                            <Sparkles size={15} strokeWidth={2} />
                            {isEnriching
                                ? 'Enrichissement…'
                                : wikidataId
                                  ? 'Changer la source'
                                  : 'Rechercher sur Wikidata'}
                        </Button>
                    </WikidataSearchDialog>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-ink-3">
                    <Globe size={12} /> Naissance, décès et photo sont repris depuis Wikidata.
                </p>
            </div>

            {/* status block */}
            <div className="mt-[18px] flex flex-col gap-3">
                <span className="text-[13px] font-semibold text-ink-2">Statut</span>
                <DeadSwitch checked={deceased} onCheckedChange={setDeceased} />
                {deceased && (
                    <IconField
                        label="Date de décès"
                        icon={Calendar}
                        type="date"
                        value={death}
                        onChange={setDeath}
                        placeholder={`JJ / MM / ${YEAR}`}
                        message={
                            missingDeathDate ? (
                                <div className="text-xs text-coral">
                                    Renseignez une date de décès pour enregistrer.
                                </div>
                            ) : (
                                <div className="text-xs text-ink-3">
                                    L'année saisie détermine quelles listes sont créditées.
                                </div>
                            )
                        }
                    />
                )}
            </div>

            {/* scoring explainer */}
            <div className="mt-6">
                <ScoringInset
                    deceased={deceased}
                    year={YEAR}
                    points={points}
                    creditedLists={bettors}
                />
            </div>

            {saveError && (
                <p className="mt-4 text-[13px] text-coral">
                    L'enregistrement a échoué. Vérifiez votre connexion et réessayez.
                </p>
            )}

            {/* actions */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
                {!create && celebrity && onDelete && (
                    <DeleteCelebrityDialog
                        name={celebrity.name}
                        points={points}
                        bettors={bettors}
                        onConfirm={onDelete}
                        isPending={isDeleting}
                    >
                        <Button
                            variant="ghost"
                            className="mr-auto border border-coral/35 text-coral hover:bg-coral/10 hover:text-coral"
                        >
                            <Trash2 size={15} strokeWidth={2} /> Supprimer
                        </Button>
                    </DeleteCelebrityDialog>
                )}
                <Button asChild variant="ghost">
                    <Link to="/admin/celebrities">Retour</Link>
                </Button>
                <Button className="min-w-[150px]" disabled={!canSubmit} onClick={handleSave}>
                    <Check size={16} strokeWidth={2.4} />
                    {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
            </div>
        </div>
    );
}
