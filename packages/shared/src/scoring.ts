/**
 * Necroloto scoring rules.
 *
 * A celebrity's death awards points to every bet that listed them.
 * The younger the celebrity at death, the more points it is worth.
 *
 * Ported from the production app (`necroloto/src/lib/helpers/bet.ts`),
 * reimplemented without dayjs to keep this package dependency-free.
 */

/**
 * Full years elapsed between two dates (calendar-accurate, like dayjs `.diff(_, "year")`).
 *
 * Uses UTC accessors: Prisma maps `@db.Date` columns to JS Date objects at UTC
 * midnight, so reading them in UTC keeps the calendar day stable regardless of
 * the server timezone.
 */
export function ageInYears(birth: Date, death: Date): number {
  let age = death.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = death.getUTCMonth() - birth.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && death.getUTCDate() < birth.getUTCDate())
  ) {
    age--;
  }
  return age;
}

/**
 * The (UTC) calendar year of a death date — the year a bet must target to score.
 */
export function deathYear(death: Date): number {
  return death.getUTCFullYear();
}

/**
 * Points awarded for a celebrity, based on their age at death.
 *
 * >= 85 -> 1, >= 75 -> 2, >= 65 -> 3, >= 55 -> 4, otherwise -> 5.
 */
export function calculPointByCelebrity(birth: Date, death: Date): number {
  const age = ageInYears(birth, death);

  if (age >= 85) return 1;
  if (age >= 75) return 2;
  if (age >= 65) return 3;
  if (age >= 55) return 4;

  return 5;
}
