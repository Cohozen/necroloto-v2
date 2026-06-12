import {
    Body,
    Controller,
    Delete,
    FileTypeValidator,
    Get,
    MaxFileSizeValidator,
    Param,
    ParseFilePipe,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ClerkAuthGuard } from '../auth/guards/clerk.auth.guard';
import { StorageService } from '../storage/storage.service';
import { CelebritiesService } from './celebrities.service';
import { CreateCelebrityDto } from './dto/create-celebrity.dto';
import { SearchCelebrityDto } from './dto/search-celebrity.dto';
import { UpdateCelebrityDto } from './dto/update-celebrity.dto';

@UseGuards(ClerkAuthGuard)
@Controller('celebrities')
export class CelebritiesController {
    constructor(
        private readonly celebritiesService: CelebritiesService,
        private readonly storage: StorageService,
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

    @Post('search')
    search(@Body() searchCelebrityDto: SearchCelebrityDto) {
        return this.celebritiesService.search(searchCelebrityDto);
    }

    @Post(':sourceId/merge/:targetId')
    @UseGuards(AdminGuard)
    merge(@Param('sourceId') sourceId: string, @Param('targetId') targetId: string) {
        return this.celebritiesService.merge(sourceId, targetId);
    }

    @Get()
    findAll() {
        return this.celebritiesService.findAll();
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
