import { Injectable } from '@nestjs/common';
import type { CircleVisibility } from '@/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { BetsService } from '../bets/bets.service';
import { SeasonsService } from '../seasons/seasons.service';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateCircleDto } from './dto/create-circle.dto';
import { UpdateCircleDto } from './dto/update-circle.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

/** One podium slot (top 3) in a circle summary. */
export interface PodiumSlot {
    place: 1 | 2 | 3;
    userId: string;
    name: string;
    points: number;
    isYou: boolean;
}

/** Per-circle summary for a user (powers the hub + dashboard cards). */
export interface CircleSummary {
    id: string;
    name: string;
    visibility: CircleVisibility;
    members: number;
    myRank: number;
    myPoints: number;
    isLeader: boolean;
    /** Whether members may still edit their bet list (gates the draft). */
    allowEdit: boolean;
    /** Whether new bets may still be created in this circle. */
    allowNewBet: boolean;
    /** Whether the season's betting window is currently open for this year. */
    bettingOpen: boolean;
    podium: PodiumSlot[];
}

/** Best display name for a user (username → full name → email local part). */
function displayName(user: {
    username: string | null;
    firstname: string | null;
    lastname: string | null;
    email: string | null;
}): string {
    if (user.username) return user.username;
    const full = [user.firstname, user.lastname].filter(Boolean).join(' ').trim();
    if (full) return full;
    if (user.email) return user.email.split('@')[0];
    return 'Joueur';
}

// Code charset without ambiguous chars (no 0/O, 1/I).
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Injectable()
export class CircleService {
    constructor(
        private prisma: PrismaService,
        private bets: BetsService,
        private seasons: SeasonsService,
    ) {}

    async create(createCircleDto: CreateCircleDto) {
        const { creatorUserId, code, ...rest } = createCircleDto;
        const finalCode = code ?? (await this.generateUniqueCode());

        return this.prisma.circle.create({
            data: {
                ...rest,
                code: finalCode,
                // The creator becomes the first member, as circle admin.
                ...(creatorUserId
                    ? { memberships: { create: { userId: creatorUserId, role: 'ADMIN' } } }
                    : {}),
            },
            include: {
                memberships: {
                    include: {
                        user: true,
                    },
                },
                bets: true,
            },
        });
    }

    /** Generates a short, human-friendly invite code unique across circles. */
    private async generateUniqueCode(): Promise<string> {
        for (let attempt = 0; attempt < 10; attempt += 1) {
            const code = Array.from(
                { length: 6 },
                () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
            ).join('');
            const existing = await this.prisma.circle.findFirst({ where: { code } });
            if (!existing) return code;
        }
        throw new Error('Could not generate a unique circle code');
    }

    /**
     * Per-circle summaries for a user: member count, my rank/points, top-3 podium.
     * Reuses the bets ranking (single source of truth for leaderboards).
     */
    async findUserSummaries(userId: string, year: number): Promise<CircleSummary[]> {
        const circles = await this.prisma.circle.findMany({
            where: { memberships: { some: { userId } } },
            include: { _count: { select: { memberships: true } } },
        });

        // Season betting window is global per year (same for every circle).
        const bettingOpen = await this.seasons.isBettingOpen(year);

        return Promise.all(
            circles.map(async (circle): Promise<CircleSummary> => {
                const ranked = await this.bets.rankByYearAndCircle(circle.id, year, 'points');
                const mine = ranked.find((bet) => bet.userId === userId);
                const podium: PodiumSlot[] = ranked.slice(0, 3).map((bet, index) => ({
                    place: (index + 1) as 1 | 2 | 3,
                    userId: bet.userId,
                    name: displayName(bet.user),
                    points: bet.total,
                    isYou: bet.userId === userId,
                }));

                return {
                    id: circle.id,
                    name: circle.name,
                    visibility: circle.visibility,
                    members: circle._count.memberships,
                    myRank: mine?.rank ?? 0,
                    myPoints: mine?.total ?? 0,
                    isLeader: mine?.rank === 1,
                    allowEdit: circle.allowEdit,
                    allowNewBet: circle.allowNewBet,
                    bettingOpen,
                    podium,
                };
            }),
        );
    }

    async findAll() {
        return this.prisma.circle.findMany({
            include: {
                memberships: {
                    include: {
                        user: true,
                    },
                },
                bets: true,
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.circle.findUnique({
            where: { id },
            include: {
                memberships: {
                    include: {
                        user: true,
                    },
                },
                bets: {
                    include: {
                        user: true,
                        CelebritiesOnBet: {
                            include: {
                                celebrity: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async findByCode(code: string) {
        return this.prisma.circle.findFirst({
            where: { code },
            include: {
                memberships: {
                    include: {
                        user: true,
                    },
                },
                bets: true,
            },
        });
    }

    async findByUser(userId: string) {
        return this.prisma.circle.findMany({
            where: {
                memberships: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                memberships: {
                    include: {
                        user: true,
                    },
                },
                bets: true,
            },
        });
    }

    async update(id: string, updateCircleDto: UpdateCircleDto) {
        return this.prisma.circle.update({
            where: { id },
            data: updateCircleDto,
            include: {
                memberships: {
                    include: {
                        user: true,
                    },
                },
                bets: true,
            },
        });
    }

    async addMember(circleId: string, dto: AddMemberDto) {
        return this.prisma.membership.create({
            data: {
                circleId,
                userId: dto.userId,
                role: dto.role || 'MEMBER',
            },
            include: {
                user: true,
                circle: true,
            },
        });
    }

    async updateMemberRole(circleId: string, userId: string, dto: UpdateMemberRoleDto) {
        return this.prisma.membership.update({
            where: {
                userId_circleId: {
                    userId,
                    circleId,
                },
            },
            data: { role: dto.role },
            include: {
                user: true,
                circle: true,
            },
        });
    }

    async removeMember(circleId: string, userId: string) {
        return this.prisma.membership.delete({
            where: {
                userId_circleId: {
                    userId,
                    circleId,
                },
            },
        });
    }

    async remove(id: string) {
        return this.prisma.circle.delete({
            where: { id },
        });
    }
}
