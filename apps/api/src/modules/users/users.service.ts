import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationEvents, type UserWelcomedEvent } from '../notifications/events';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private events: EventEmitter2,
    ) {}

    async create(createUserDto: CreateUserDto) {
        // Idempotent provisioning. A Clerk user may already have a row (re-login),
        // or the same verified email may already exist under a *different* clerkId
        // (e.g. a prod row cloned locally, or a Clerk instance migration). In that
        // case we relink the existing row instead of hitting the unique(email)
        // constraint. Clerk verifies emails, so matching on email is safe.
        const existingByClerk = await this.prisma.user.findUnique({
            where: { clerkId: createUserDto.clerkId },
        });
        if (existingByClerk) return existingByClerk;

        if (createUserDto.email) {
            const existingByEmail = await this.prisma.user.findUnique({
                where: { email: createUserDto.email },
            });
            if (existingByEmail) {
                return this.prisma.user.update({
                    where: { id: existingByEmail.id },
                    data: {
                        clerkId: createUserDto.clerkId,
                        // Backfill profile fields only when the row lacks them.
                        image: existingByEmail.image ?? createUserDto.image,
                        username: existingByEmail.username ?? createUserDto.username,
                        firstname: existingByEmail.firstname ?? createUserDto.firstname,
                        lastname: existingByEmail.lastname ?? createUserDto.lastname,
                    },
                });
            }
        }

        const created = await this.prisma.user.create({
            data: createUserDto,
        });
        // Genuinely new player (not a re-login or email relink) → welcome them.
        this.events.emit(NotificationEvents.UserWelcomed, {
            userId: created.id,
        } satisfies UserWelcomedEvent);
        return created;
    }

    async findAll() {
        return this.prisma.user.findMany({
            include: {
                Bets: true,
                Membership: true,
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                Bets: true,
                Membership: true,
            },
        });
    }

    async findByClerkId(clerkId: string) {
        return this.prisma.user.findUnique({
            where: { clerkId },
            include: {
                Bets: true,
                Membership: true,
            },
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        return this.prisma.user.update({
            where: { id },
            data: updateUserDto,
        });
    }

    async remove(id: string) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
}
