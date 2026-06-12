/**
 * Domain enums, mirrored from the Prisma schema so they can be shared by the
 * web/mobile clients without importing the Prisma client.
 * Keep in sync with `apps/api/prisma/schema.prisma`.
 */

export const CircleStatus = {
  OPEN: "OPEN",
  LOCKED: "LOCKED",
  ARCHIVED: "ARCHIVED",
} as const;
export type CircleStatus = (typeof CircleStatus)[keyof typeof CircleStatus];

export const MembershipRole = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;
export type MembershipRole = (typeof MembershipRole)[keyof typeof MembershipRole];

export const CircleVisibility = {
  PRIVATE: "PRIVATE",
  PUBLIC: "PUBLIC",
} as const;
export type CircleVisibility =
  (typeof CircleVisibility)[keyof typeof CircleVisibility];
