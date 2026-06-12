import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CelebritiesService } from './celebrities.service';
import { CreateCelebrityDto } from './dto/create-celebrity.dto';
import { UpdateCelebrityDto } from './dto/update-celebrity.dto';
import { SearchCelebrityDto } from './dto/search-celebrity.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk.auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@UseGuards(ClerkAuthGuard)
@Controller('celebrities')
export class CelebritiesController {
  constructor(private readonly celebritiesService: CelebritiesService) {}

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
  merge(
    @Param('sourceId') sourceId: string,
    @Param('targetId') targetId: string,
  ) {
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
  update(
    @Param('id') id: string,
    @Body() updateCelebrityDto: UpdateCelebrityDto,
  ) {
    return this.celebritiesService.update(id, updateCelebrityDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.celebritiesService.remove(id);
  }
}
