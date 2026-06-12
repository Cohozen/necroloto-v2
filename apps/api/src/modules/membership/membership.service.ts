import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { SearchMembershipDto } from './dto/search-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@Injectable()
export class MembershipService {
  constructor(private prisma: PrismaService) {}

  async create(createMembershipDto: CreateMembershipDto) {
    return this.prisma.membership.create({
      data: createMembershipDto,
      include: {
        user: true,
        circle: true,
      },
    });
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
    return this.prisma.membership.delete({
      where: { id },
    });
  }
}
