import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { SyncJobType } from '@/prisma/client';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ClerkAuthGuard } from '../auth/guards/clerk.auth.guard';
import { BulkCelebritiesDto } from '../celebrities/dto/bulk-celebrities.dto';
import { JobsService } from './jobs.service';

@UseGuards(ClerkAuthGuard)
@Controller('jobs')
export class JobsController {
    constructor(private readonly jobs: JobsService) {}

    // Admin-only: enqueue a bulk Wikidata enrich. Returns the job immediately;
    // the front polls GET /jobs/:id for progress.
    @Post('bulk-enrich')
    @HttpCode(HttpStatus.ACCEPTED)
    @UseGuards(AdminGuard)
    bulkEnrich(@Body() dto: BulkCelebritiesDto) {
        return this.jobs.enqueueBulkEnrich(dto.ids);
    }

    // Admin-only: recent jobs for the automation history (optional type filter).
    @Get()
    @UseGuards(AdminGuard)
    list(
        @Query('type') type?: string,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
    ) {
        const parsed = type && type in SyncJobType ? (type as SyncJobType) : undefined;
        return this.jobs.findRecent(limit, parsed);
    }

    // Admin-only: a single job, polled by the front for live progress.
    @Get(':id')
    @UseGuards(AdminGuard)
    get(@Param('id') id: string) {
        return this.jobs.findOne(id);
    }
}
