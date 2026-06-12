import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CircleAdminGuard } from '../auth/guards/circle-admin.guard';
import { ClerkAuthGuard } from '../auth/guards/clerk.auth.guard';
import { CircleService } from './circle.service';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateCircleDto } from './dto/create-circle.dto';
import { UpdateCircleDto } from './dto/update-circle.dto';

@UseGuards(ClerkAuthGuard)
@Controller('circle')
export class CircleController {
    constructor(private readonly circleService: CircleService) {}

    @Post()
    create(@Body() createCircleDto: CreateCircleDto) {
        return this.circleService.create(createCircleDto);
    }

    @Get()
    findAll() {
        return this.circleService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.circleService.findOne(id);
    }

    @Get('code/:code')
    findByCode(@Param('code') code: string) {
        return this.circleService.findByCode(code);
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.circleService.findByUser(userId);
    }

    @Patch(':id')
    @UseGuards(CircleAdminGuard)
    update(@Param('id') id: string, @Body() updateCircleDto: UpdateCircleDto) {
        return this.circleService.update(id, updateCircleDto);
    }

    @Post(':id/members')
    @UseGuards(CircleAdminGuard)
    addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
        return this.circleService.addMember(id, dto);
    }

    @Delete(':id/members/:userId')
    @UseGuards(CircleAdminGuard)
    removeMember(@Param('id') id: string, @Param('userId') userId: string) {
        return this.circleService.removeMember(id, userId);
    }

    @Delete(':id')
    @UseGuards(CircleAdminGuard)
    remove(@Param('id') id: string) {
        return this.circleService.remove(id);
    }
}
