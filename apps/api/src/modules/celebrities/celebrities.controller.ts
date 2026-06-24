import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    FileTypeValidator,
    Get,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentClerkId, IsAdminClaim } from '../auth/current-user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ClerkAuthGuard } from '../auth/guards/clerk.auth.guard';
import { SeasonsService } from '../seasons/seasons.service';
import { StorageService } from '../storage/storage.service';
import { CelebritiesService } from './celebrities.service';
import { BulkCelebritiesDto } from './dto/bulk-celebrities.dto';
import { CreateCelebrityDto } from './dto/create-celebrity.dto';
import { EnrichCelebrityDto } from './dto/enrich-celebrity.dto';
import { ProposeCelebrityDto } from './dto/propose-celebrity.dto';
import { SearchCelebrityDto } from './dto/search-celebrity.dto';
import { UpdateCelebrityDto } from './dto/update-celebrity.dto';

@UseGuards(ClerkAuthGuard)
@Controller('celebrities')
export class CelebritiesController {
    constructor(
        private readonly celebritiesService: CelebritiesService,
        private readonly storage: StorageService,
        private readonly seasons: SeasonsService,
    ) {}

    // Admin-only: upload/replace a celebrity photo (multipart field "file").
    @Post(':id/photo')
    @UseGuards(AdminGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadPhoto(
        @Param('id') id: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /^image\// }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        const url = await this.storage.uploadCelebrityPhoto(id, file);
        return this.celebritiesService.setPhoto(id, url);
    }

    @Post()
    @UseGuards(AdminGuard)
    create(@Body() createCelebrityDto: CreateCelebrityDto) {
        return this.celebritiesService.create(createCelebrityDto);
    }

    // Any authenticated player may propose a missing celebrity from the bet
    // draft. The entry is created PENDING (visible only to the proposer) until
    // an admin approves it.
    @Post('propose')
    propose(@Body() dto: ProposeCelebrityDto, @CurrentClerkId() clerkId?: string) {
        return this.celebritiesService.propose(dto, clerkId);
    }

    // Admin-only: validate a proposed celebrity (optionally enrich first).
    @Post(':id/approve')
    @UseGuards(AdminGuard)
    approve(@Param('id') id: string, @Body() dto: EnrichCelebrityDto) {
        return this.celebritiesService.approve(id, dto.wikidataId);
    }

    // Admin-only: reject a proposed celebrity (kept REJECTED, pulled from bets).
    @Post(':id/reject')
    @UseGuards(AdminGuard)
    reject(@Param('id') id: string) {
        return this.celebritiesService.reject(id);
    }

    // Admin-only: delete several celebrities at once.
    @Delete('bulk')
    @UseGuards(AdminGuard)
    bulkRemove(@Body() dto: BulkCelebritiesDto) {
        return this.celebritiesService.bulkRemove(dto.ids);
    }

    @Post('search')
    search(@Body() searchCelebrityDto: SearchCelebrityDto, @CurrentClerkId() clerkId?: string) {
        return this.celebritiesService.search(searchCelebrityDto, clerkId);
    }

    @Post(':sourceId/merge/:targetId')
    @UseGuards(AdminGuard)
    merge(@Param('sourceId') sourceId: string, @Param('targetId') targetId: string) {
        return this.celebritiesService.merge(sourceId, targetId);
    }

    // Wikidata candidates for a name (disambiguation before enrich / proposal).
    // Read-only, so any authenticated user may call it — the bet-draft proposal
    // flow searches Wikidata first.
    @Get('wikidata/search')
    searchWikidata(@Query('name') name: string) {
        return this.celebritiesService.searchWikidata(name);
    }

    // Admin-only: fill birth/death/photo from Wikidata and link the entity.
    @Post(':id/enrich')
    @UseGuards(AdminGuard)
    enrich(@Param('id') id: string, @Body() dto: EnrichCelebrityDto) {
        return this.celebritiesService.enrich(id, dto.wikidataId);
    }

    @Get()
    findAll(@CurrentClerkId() clerkId?: string) {
        return this.celebritiesService.findAll(clerkId);
    }

    // Paginated, alphabetically-ordered catalogue for the bet draft (living picks
    // only, name search). Declared before ":id" so "catalogue" is not parsed as
    // an id. Any authenticated user — visibility filters pending to its proposer.
    @Get('catalogue')
    findCataloguePage(
        @CurrentClerkId() clerkId?: string,
        @Query('search') search?: string,
        @Query('take', new DefaultValuePipe(24), ParseIntPipe) take = 24,
        @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip = 0,
    ) {
        return this.celebritiesService.findCataloguePage({ search, take, skip }, clerkId);
    }

    // Admin-only: paginated catalogue (name search, status filter, alphabetical).
    // Declared before ":id" so "admin" is not parsed as an id.
    @Get('admin/list')
    @UseGuards(AdminGuard)
    findPage(
        @Query('search') search?: string,
        @Query('status') status?: 'all' | 'alive' | 'deceased' | 'pending',
        @Query('wikidata') wikidata?: 'linked' | 'unlinked',
        @Query('take', new DefaultValuePipe(24), ParseIntPipe) take = 24,
        @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip = 0,
    ) {
        return this.celebritiesService.findPage({ search, status, wikidata, take, skip });
    }

    // Recent deaths for the dashboard feed. Declared before ":id" for clarity.
    @Get('deaths/feed')
    async deathFeed(
        @Query('year', new ParseIntPipe({ optional: true })) year: number | undefined,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        const y = year ?? (await this.seasons.getActiveYear());
        return this.celebritiesService.deathFeed(y, limit);
    }

    @Get(':id')
    findOne(
        @Param('id') id: string,
        @CurrentClerkId() clerkId?: string,
        @IsAdminClaim() isAdmin?: boolean,
    ) {
        return this.celebritiesService.findOne(id, clerkId, isAdmin);
    }

    @Patch(':id')
    @UseGuards(AdminGuard)
    update(@Param('id') id: string, @Body() updateCelebrityDto: UpdateCelebrityDto) {
        return this.celebritiesService.update(id, updateCelebrityDto);
    }

    @Delete(':id')
    @UseGuards(AdminGuard)
    remove(@Param('id') id: string) {
        return this.celebritiesService.remove(id);
    }
}
