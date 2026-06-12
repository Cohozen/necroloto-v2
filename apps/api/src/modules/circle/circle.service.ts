import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateCircleDto } from './dto/create-circle.dto';
import { UpdateCircleDto } from './dto/update-circle.dto';

@Injectable()
export class CircleService {
  constructor(private prisma: PrismaService) {}

  async create(createCircleDto: CreateCircleDto) {
    return this.prisma.circle.create({
      data: createCircleDto,
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
