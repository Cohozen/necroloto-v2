import { CircleStatus, CircleVisibility } from '@/prisma/enums';

export class CreateCircleDto {
    name: string;
    visibility?: CircleVisibility;
    status?: CircleStatus;
    code?: string;
    allowNewBet: boolean;
    allowEdit?: boolean;
    betsVisible?: boolean;
    /** Clerk-resolved creator; added as the circle's first ADMIN member. */
    creatorUserId?: string;
}
