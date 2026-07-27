import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MissingPersonsService } from './missing-persons.service';
import { CreateMissingPersonDto } from './dto/create-missing-person.dto';
import { UpdateMissingPersonDto } from './dto/update-missing-person.dto';
import { UpdateMissingPersonStatusDto } from './dto/update-missing-person-status.dto';
import { MissingPersonStatus } from './entities/missing-person.entity';
import { JwtGuard } from 'src/auth/guards/access-jwt-guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('missing-persons')
export class MissingPersonsController {
  constructor(
    private readonly missingPersonsService: MissingPersonsService,
  ) {}

  @Post()
  @UseGuards(JwtGuard)
  @UseInterceptors(FilesInterceptor('file'))
  async create(
    @CurrentUser('id') reporterId: string,
    @Body() dto: CreateMissingPersonDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const file = files && files.length > 0 ? files[0] : undefined;
    return await this.missingPersonsService.create(reporterId, dto, file);
  }

  @Get('my')
  @UseGuards(JwtGuard)
  async findMyReports(@CurrentUser('id') reporterId: string) {
    return await this.missingPersonsService.findMyReports(reporterId);
  }

  @Get()
  async findAll(
    @Query('status') status?: MissingPersonStatus,
    @Query('search') search?: string,
  ) {
    return await this.missingPersonsService.findAll(status, search);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.missingPersonsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard)
  @UseInterceptors(FilesInterceptor('file'))
  async update(
    @Param('id') id: string,
    @CurrentUser('id') reporterId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdateMissingPersonDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const file = files && files.length > 0 ? files[0] : undefined;
    return await this.missingPersonsService.update(
      id,
      reporterId,
      role,
      dto,
      file,
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtGuard)
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') reporterId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdateMissingPersonStatusDto,
  ) {
    return await this.missingPersonsService.updateStatus(
      id,
      reporterId,
      role,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') reporterId: string,
    @CurrentUser('role') role: string,
  ) {
    return await this.missingPersonsService.remove(id, reporterId, role);
  }
}
