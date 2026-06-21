import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { type MembershipCreatedEvent, NotificationEvents } from '../notifications/events';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { SearchMembershipDto } from './dto/search-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@Injectable()
export class MembershipService {
    constructor(
        private prisma: PrismaService,
        private events: EventEmitter2,
    ) {}

    async create(createMembershipDto: CreateMembershipDto) {
        const membership = await this.prisma.membership.create({
            data: createMembershipDto,
            include: {
                user: true,
                circle: true,
            },
        });
        this.events.emit(NotificationEvents.MembershipCreated, {
            circleId: membership.circleId,
            userId: membership.userId,
        } satisfies MembershipCreatedEvent);
        return membership;
    }

    async findAll() {
        return this.prisma.membership.findMany({
            include: {
                user: true,
                circle: true,
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.membership.findUnique({
            where: { id },
            include: {
                user: true,
                circle: true,
            },
        });
    }

    async findByUser(userId: string) {
        return this.prisma.membership.findMany({
            where: { userId },
            include: {
                user: true,
                circle: true,
            },
        });
    }

    async findByCircle(circleId: string) {
        return this.prisma.membership.findMany({
            where: { circleId },
            include: {
                user: true,
                circle: true,
            },
        });
    }

    async search(searchMembershipDto: SearchMembershipDto) {
        const { userId, circleId, role } = searchMembershipDto;

        return this.prisma.membership.findMany({
            where: {
                ...(userId && { userId }),
                ...(circleId && { circleId }),
                ...(role && { role }),
            },
            include: {
                user: true,
                circle: true,
            },
        });
    }

    async update(id: string, updateMembershipDto: UpdateMembershipDto) {
        return this.prisma.membership.update({
            where: { id },
            data: updateMembershipDto,
            include: {
                user: true,
                circle: true,
            },
        });
    }

    async remove(id: string) {
        const membership = await this.prisma.membership.findUnique({
            where: { id },
            select: { role: true, circleId: true },
        });
        if (!membership) throw new NotFoundException('Membership not found');

        // A circle must never be left without an admin.
        if (membership.role === 'ADMIN') {
            const adminCount = await this.prisma.membership.count({
                where: { circleId: membership.circleId, role: 'ADMIN' },
            });
            if (adminCount === 1) {
                throw new ForbiddenException('Impossible de quitter : vous êtes le seul admin');
            }
        }

        return this.prisma.membership.delete({
            where: { id },
        });
    }
}
