import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/guards/clerk.auth.guard';
import type { SortByRank } from './bets.service';
import { BetsService } from './bets.service';
import { AddCelebrityToBetDto } from './dto/add-celebrity-to-bet.dto';
import { CreateBetDto } from './dto/create-bet.dto';
import { ReplaceCelebritiesDto } from './dto/replace-celebrities.dto';
import { SearchBetDto } from './dto/search-bet.dto';
import { UpdateBetDto } from './dto/update-bet.dto';
import { UpdatePointsDto } from './dto/update-points.dto';

@UseGuards(ClerkAuthGuard)
@Controller('bets')
export class BetsController {
    constructor(private readonly betsService: BetsService) {}

    @Post()
    create(@Body() createBetDto: CreateBetDto) {
        return this.betsService.create(createBetDto);
    }

    @Post('search')
    search(@Body() searchBetDto: SearchBetDto) {
        return this.betsService.search(searchBetDto);
    }

    @Get()
    findAll() {
        return this.betsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.betsService.findOne(id);
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: string) {
        return this.betsService.findByUser(userId);
    }

    @Get('circle/:circleId')
    findByCircle(@Param('circleId') circleId: string) {
        return this.betsService.findByCircle(circleId);
    }

    @Get('circle/:circleId/rank')
    rank(
        @Param('circleId') circleId: string,
        @Query('year', new DefaultValuePipe(new Date().getUTCFullYear()), ParseIntPipe)
        year: number,
        @Query('sort', new DefaultValuePipe('points')) sort: SortByRank,
    ) {
        return this.betsService.rankByYearAndCircle(circleId, year, sort);
    }

    @Get('circle/:circleId/rank/user/:userId')
    position(
        @Param('circleId') circleId: string,
        @Param('userId') userId: string,
        @Query('year', new DefaultValuePipe(new Date().getUTCFullYear()), ParseIntPipe)
        year: number,
        @Query('sort', new DefaultValuePipe('points')) sort: SortByRank,
    ) {
        return this.betsService.positionOfUser(userId, circleId, year, sort);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBetDto: UpdateBetDto) {
        return this.betsService.update(id, updateBetDto);
    }

    @Post(':id/celebrities')
    addCelebrityToBet(@Param('id') id: string, @Body() dto: AddCelebrityToBetDto) {
        return this.betsService.addCelebrityToBet(id, dto);
    }

    @Patch(':id/celebrities')
    replaceCelebrities(@Param('id') id: string, @Body() dto: ReplaceCelebritiesDto) {
        return this.betsService.replaceCelebrities(id, dto.celebrities);
    }

    @Patch(':betId/celebrities/:celebrityId/points')
    updateCelebrityPoints(
        @Param('betId') betId: string,
        @Param('celebrityId') celebrityId: string,
        @Body() dto: UpdatePointsDto,
    ) {
        return this.betsService.updateCelebrityPoints(betId, celebrityId, dto);
    }

    @Delete(':id/celebrities/:celebrityId')
    removeCelebrityFromBet(@Param('id') id: string, @Param('celebrityId') celebrityId: string) {
        return this.betsService.removeCelebrityFromBet(id, celebrityId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.betsService.remove(id);
    }
}
