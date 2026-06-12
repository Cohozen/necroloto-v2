import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/guards/clerk.auth.guard';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { SearchMembershipDto } from './dto/search-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { MembershipService } from './membership.service';

@UseGuards(ClerkAuthGuard)
@Controller('membership')
export class MembershipController {
    constructor(private readonly membershipService: MembershipService) {}

    @Post()
    create(@Body() createMembershipDto: CreateMembershipDto) {
        return this.membershipService.create(createMembershipDto);
    }

    @Post('search')
    search(@Body() searchMembershipDto: SearchMembershipDto) {
        return this.membershipService.search(searchMembershipDto);
    }

    @Get()
    findAll() {
        return this.membershipService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.membershipService.findOne(id);
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.membershipService.findByUser(userId);
    }

    @Get('circle/:circleId')
    findByCircle(@Param('circleId') circleId: string) {
        return this.membershipService.findByCircle(circleId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMembershipDto: UpdateMembershipDto) {
        return this.membershipService.update(id, updateMembershipDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.membershipService.remove(id);
    }
}
