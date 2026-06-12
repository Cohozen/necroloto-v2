import { CircleStatus, CircleVisibility } from '@/prisma/enums';

export class UpdateCircleDto {
    name?: string;
    visibility?: CircleVisibility;
    status?: CircleStatus;
    code?: string;
    allowNewBet?: boolean;
}
