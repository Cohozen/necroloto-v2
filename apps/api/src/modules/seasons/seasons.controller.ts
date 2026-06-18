import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ClerkAuthGuard } from '../auth/guards/clerk.auth.guard';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { SeasonsService } from './seasons.service';

@UseGuards(ClerkAuthGuard)
@Controller('seasons')
export class SeasonsController {
    constructor(private readonly seasonsService: SeasonsService) {}

    @Get()
    findAll() {
        return this.seasonsService.findAll();
    }

    // Declared before ":id" so "active" is not parsed as an id.
    @Get('active')
    getActive() {
        return this.seasonsService.getActive();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.seasonsService.findOne(id);
    }

    @Post()
    @UseGuards(AdminGuard)
    create(@Body() createSeasonDto: CreateSeasonDto) {
        return this.seasonsService.create(createSeasonDto);
    }

    @Patch(':id')
    @UseGuards(AdminGuard)
    update(@Param('id') id: string, @Body() updateSeasonDto: UpdateSeasonDto) {
        return this.seasonsService.update(id, updateSeasonDto);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    remove(@Param('id') id: string) {
        return this.seasonsService.remove(id);
    }
}
