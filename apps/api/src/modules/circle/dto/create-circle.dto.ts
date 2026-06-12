import { CircleVisibility, CircleStatus } from '@/prisma/enums';

export class CreateCircleDto {
  name: string;
  visibility?: CircleVisibility;
  status?: CircleStatus;
  code?: string;
  allowNewBet: boolean;
}
