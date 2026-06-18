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
import { AdminGuard } from '../auth/guards/admin.guard';
import { ClerkAuthGuard } from '../auth/guards/clerk.auth.guard';
import { SeasonsService } from '../seasons/seasons.service';
import { StorageService } from '../storage/storage.service';
import { CelebritiesService } from './celebrities.service';
import { BulkCelebritiesDto } from './dto/bulk-celebrities.dto';
import { CreateCelebrityDto } from './dto/create-celebrity.dto';
import { EnrichCelebrityDto } from './dto/enrich-celebrity.dto';
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

    // Admin-only: delete several celebrities at once.
    @Delete('bulk')
    @UseGuards(AdminGuard)
    bulkRemove(@Body() dto: BulkCelebritiesDto) {
        return this.celebritiesService.bulkRemove(dto.ids);
    }

    // Admin-only: enrich several celebrities from Wikidata at once.
    @Post('bulk/enrich')
    @UseGuards(AdminGuard)
    bulkEnrich(@Body() dto: BulkCelebritiesDto) {
        return this.celebritiesService.bulkEnrich(dto.ids);
    }

    @Post('search')
    search(@Body() searchCelebrityDto: SearchCelebrityDto) {
        return this.celebritiesService.search(searchCelebrityDto);
    }

    @Post(':sourceId/merge/:targetId')
    @UseGuards(AdminGuard)
    merge(@Param('sourceId') sourceId: string, @Param('targetId') targetId: string) {
        return this.celebritiesService.merge(sourceId, targetId);
    }

    // Admin-only: Wikidata candidates for a name (disambiguation before enrich).
    @Get('wikidata/search')
    @UseGuards(AdminGuard)
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
    findAll() {
        return this.celebritiesService.findAll();
    }

    // Admin-only: paginated catalogue (name search, status filter, alphabetical).
    // Declared before ":id" so "admin" is not parsed as an id.
    @Get('admin/list')
    @UseGuards(AdminGuard)
    findPage(
        @Query('search') search?: string,
        @Query('status') status?: 'all' | 'alive' | 'deceased',
        @Query('take', new DefaultValuePipe(24), ParseIntPipe) take = 24,
        @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip = 0,
    ) {
        return this.celebritiesService.findPage({ search, status, take, skip });
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
    findOne(@Param('id') id: string) {
        return this.celebritiesService.findOne(id);
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
