import { Calendar, Camera, Check, Globe, Plus, Trash2, Upload, User } from 'lucide-react';
import { useState } from 'react';
import { CelebrityPortrait } from '@/components/celebrities/CelebrityPortrait';
import { StatusBadge } from '@/components/celebrities/StatusBadge';
import { Button } from '@/components/ui/button';
import type { CelebrityFormData } from '@/types/admin';
import { DeadSwitch } from './DeadSwitch';
import { DeleteCelebrityDialog } from './DeleteCelebrityDialog';
import { FieldMessage } from './FieldMessage';
import { IconField } from './IconField';
import { ScoringInset } from './ScoringInset';

interface CelebrityFormProps {
    mode: 'edit' | 'create';
    /** Existing fiche, required in edit mode. */
    celeb?: CelebrityFormData;
}

const YEAR = new Date().getFullYear();

/** Create / edit a catalogue celebrity, with the scoring-aware death toggle. */
export function CelebrityForm({ mode, celeb }: CelebrityFormProps) {
    const create = mode === 'create';
    const [deceased, setDeceased] = useState(celeb?.deceased ?? false);

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
                            name={celeb?.name ?? ''}
                            status={deceased ? 'deceased' : 'alive'}
                            rounded="rounded-[18px]"
                            className="aspect-square w-full"
                        />
                    )}
                    <Button variant="outline" size="sm">
                        <Upload size={15} strokeWidth={2} /> Changer la photo
                    </Button>
                </div>

                <div className="flex min-w-0 flex-1 flex-col items-start gap-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neon">
                        {create ? 'Nouvelle célébrité' : 'Éditer la fiche'}
                    </span>
                    <h1
                        className={`font-display text-[40px] font-extrabold leading-[0.96] ${create ? 'text-ink-3' : ''}`}
                    >
                        {create ? 'Sans nom' : celeb?.name}
                    </h1>
                    {create ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-surface px-2.5 py-1 text-xs font-medium text-ink-2">
                            <Plus size={13} strokeWidth={2} /> Brouillon non enregistré
                        </span>
                    ) : (
                        <StatusBadge
                            status={deceased ? 'deceased' : 'alive'}
                            deathLabel={deceased ? celeb?.deathLabel : undefined}
                        />
                    )}
                    <p className="flex items-center gap-1.5 text-xs text-ink-3">
                        <Upload size={12} /> Photo stockée sur Supabase Storage · 512×512 recommandé
                        · JPG/PNG/WebP
                    </p>
                </div>
            </div>

            <hr className="my-6 border-line" />

            {/* identity fields */}
            <div className="grid gap-[18px] sm:grid-cols-2">
                <IconField
                    label="Nom complet"
                    icon={User}
                    sub={create ? '0 / 60' : '23 / 60'}
                    defaultValue={create ? undefined : celeb?.name}
                    placeholder="Nom de la célébrité"
                />
                <IconField
                    label="Date de naissance"
                    icon={Calendar}
                    defaultValue={create ? undefined : celeb?.bornLabel}
                    placeholder="JJ / MM / AAAA"
                />
            </div>

            <div className="mt-[18px]">
                <IconField
                    label="Wikidata QID"
                    icon={Globe}
                    defaultValue={create ? undefined : celeb?.wikidataQid}
                    placeholder="Q… — rechercher sur Wikidata"
                    state={create ? 'default' : 'ok'}
                    message={
                        create ? (
                            <div className="flex items-center gap-1.5 text-xs text-ink-3">
                                <Globe size={12} /> Naissance, photo et catégorie seront
                                auto-renseignées depuis Wikidata.
                            </div>
                        ) : (
                            <FieldMessage kind="ok">
                                Synchronisé depuis Wikidata · il y a 3 j
                            </FieldMessage>
                        )
                    }
                />
            </div>

            {/* status block */}
            <div className="mt-[18px] flex flex-col gap-3">
                <span className="text-[13px] font-semibold text-ink-2">Statut</span>
                <DeadSwitch checked={deceased} onCheckedChange={setDeceased} />
                {deceased && (
                    <IconField
                        label="Date de décès"
                        icon={Calendar}
                        defaultValue={celeb?.deathLabel ?? `… ${YEAR}`}
                        placeholder={`JJ / MM / ${YEAR}`}
                        message={
                            <div className="text-xs text-ink-3">
                                L'année saisie détermine quelles listes sont créditées. Ici :{' '}
                                <b className="text-coral">{YEAR}</b>.
                            </div>
                        }
                    />
                )}
            </div>

            {/* scoring explainer */}
            <div className="mt-6">
                <ScoringInset
                    deceased={deceased}
                    year={YEAR}
                    points={celeb?.points ?? 0}
                    creditedLists={celeb?.bettors ?? 0}
                />
            </div>

            {/* actions */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
                {!create && celeb && (
                    <DeleteCelebrityDialog
                        name={celeb.name}
                        points={celeb.points}
                        bettors={celeb.bettors}
                    >
                        <Button
                            variant="ghost"
                            className="mr-auto border border-coral/35 text-coral hover:bg-coral/10 hover:text-coral"
                        >
                            <Trash2 size={15} strokeWidth={2} /> Supprimer
                        </Button>
                    </DeleteCelebrityDialog>
                )}
                <Button variant="ghost">Annuler</Button>
                <Button className="min-w-[150px]">
                    <Check size={16} strokeWidth={2.4} /> Enregistrer
                </Button>
            </div>
        </div>
    );
}
