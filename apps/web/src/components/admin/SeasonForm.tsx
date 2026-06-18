import { Link } from '@tanstack/react-router';
import { CalendarClock, CalendarRange, Check, Flag, Hash, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { ApiSeason, CreateSeasonPayload } from '@/lib/api/types';
import { IconField } from './IconField';

interface SeasonFormProps {
    mode: 'create' | 'edit';
    /** Existing season, required in edit mode. */
    season?: ApiSeason;
    onSave: (payload: CreateSeasonPayload) => void;
    onDelete?: () => void;
    isSaving?: boolean;
    isDeleting?: boolean;
    /** Server error message (e.g. overlap / ordering), shown above the actions. */
    saveError?: string | null;
}

/** ISO instant → "YYYY-MM-DDTHH:mm" in local time for a datetime-local input. */
function isoToLocalInput(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "YYYY-MM-DDTHH:mm" (local) → ISO instant. */
function localInputToIso(v: string): string {
    return new Date(v).toISOString();
}

/** Create / edit a season with its four-date window. */
export function SeasonForm({
    mode,
    season,
    onSave,
    onDelete,
    isSaving,
    isDeleting,
    saveError,
}: SeasonFormProps) {
    const create = mode === 'create';

    const [year, setYear] = useState(String(season?.year ?? new Date().getFullYear()));
    const [name, setName] = useState(season?.name ?? '');
    const [openDate, setOpenDate] = useState(isoToLocalInput(season?.openDate));
    const [betStartDate, setBetStartDate] = useState(isoToLocalInput(season?.betStartDate));
    const [betEndDate, setBetEndDate] = useState(isoToLocalInput(season?.betEndDate));
    const [closeDate, setCloseDate] = useState(isoToLocalInput(season?.closeDate));

    const allDatesSet = !!(openDate && betStartDate && betEndDate && closeDate);
    const yearNum = Number.parseInt(year, 10);
    const yearValid = Number.isInteger(yearNum) && yearNum >= 2000 && yearNum <= 2100;

    // Client-side ordering check (the API is the authority).
    const ordered =
        allDatesSet &&
        new Date(openDate) <= new Date(betStartDate) &&
        new Date(betStartDate) <= new Date(betEndDate) &&
        new Date(betEndDate) <= new Date(closeDate);

    const canSubmit = yearValid && allDatesSet && ordered && !isSaving;

    const handleSave = () => {
        if (!canSubmit) return;
        onSave({
            year: yearNum,
            name: name.trim() || null,
            openDate: localInputToIso(openDate),
            betStartDate: localInputToIso(betStartDate),
            betEndDate: localInputToIso(betEndDate),
            closeDate: localInputToIso(closeDate),
        });
    };

    return (
        <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-surface-2 to-surface p-6 md:p-7">
            <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-neon/80 to-transparent" />

            <div className="flex flex-col gap-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neon">
                    {create ? 'Nouvelle saison' : 'Éditer la saison'}
                </span>
                <h1 className="font-display text-[40px] font-extrabold leading-[0.96]">
                    Saison {yearValid ? yearNum : '—'}
                </h1>
            </div>

            <hr className="my-6 border-line" />

            <div className="grid gap-[18px] sm:grid-cols-2">
                <IconField
                    label="Année"
                    icon={Hash}
                    type="number"
                    value={year}
                    onChange={setYear}
                    placeholder="2026"
                    state={year && !yearValid ? 'error' : 'default'}
                />
                <IconField
                    label="Nom (optionnel)"
                    icon={Flag}
                    value={name}
                    onChange={setName}
                    placeholder="Ex. Saison 2026"
                />
            </div>

            <div className="mt-[18px] grid gap-[18px] sm:grid-cols-2">
                <IconField
                    label="Ouverture de la saison"
                    icon={CalendarRange}
                    type="datetime-local"
                    value={openDate}
                    onChange={setOpenDate}
                />
                <IconField
                    label="Clôture de la saison"
                    icon={CalendarRange}
                    type="datetime-local"
                    value={closeDate}
                    onChange={setCloseDate}
                />
                <IconField
                    label="Début des paris"
                    icon={CalendarClock}
                    type="datetime-local"
                    value={betStartDate}
                    onChange={setBetStartDate}
                />
                <IconField
                    label="Fin des paris"
                    icon={CalendarClock}
                    type="datetime-local"
                    value={betEndDate}
                    onChange={setBetEndDate}
                />
            </div>

            {allDatesSet && !ordered && (
                <p className="mt-4 text-[13px] text-coral">
                    Les dates doivent être ordonnées : ouverture ≤ début des paris ≤ fin des paris ≤
                    clôture.
                </p>
            )}

            {saveError && <p className="mt-4 text-[13px] text-coral">{saveError}</p>}

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
                {!create && onDelete && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                className="mr-auto border border-coral/35 text-coral hover:bg-coral/10 hover:text-coral"
                            >
                                <Trash2 size={15} strokeWidth={2} /> Supprimer
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Supprimer la saison {season?.year} ?</DialogTitle>
                                <DialogDescription>
                                    Les paris existants conservent leur année ; seule la
                                    configuration de la saison est supprimée. Cette action est
                                    irréversible.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="ghost">Annuler</Button>
                                </DialogClose>
                                <Button
                                    className="border border-coral/35 bg-coral/10 text-coral hover:bg-coral/20"
                                    onClick={onDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Suppression…' : 'Supprimer'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
                <Button asChild variant="ghost">
                    <Link to="/admin/seasons">Retour</Link>
                </Button>
                <Button className="min-w-[150px]" disabled={!canSubmit} onClick={handleSave}>
                    <Check size={16} strokeWidth={2.4} />
                    {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
            </div>
        </div>
    );
}
