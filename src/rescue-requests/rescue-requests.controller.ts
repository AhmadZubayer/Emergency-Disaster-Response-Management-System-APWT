import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RescueRequestsService } from './rescue-requests.service';
import { CreateRescueRequestDto } from './dto/create-rescue-request.dto';
import { UpdateRescueRequestStatusDto } from './dto/update-rescue-request-status.dto';
import { JwtGuard } from 'src/auth/guards/access-jwt-guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('rescue-requests')
@UseGuards(JwtGuard)
export class RescueRequestsController {
  constructor(private readonly rescueService: RescueRequestsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('file'))
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRescueRequestDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const file = files && files.length > 0 ? files[0] : undefined;
    return await this.rescueService.create(userId, dto, file);
  }

  @Get('my')
  async findMyRequests(@CurrentUser('id') userId: string) {
    return await this.rescueService.findMyRequests(userId);
  }

  @Get()
  async findAll() {
    return await this.rescueService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.rescueService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateRescueRequestStatusDto,
  ) {
    return await this.rescueService.updateStatus(id, dto);
  }

  @Patch(':id/cancel')
  async cancelMyRequest(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return await this.rescueService.cancelMyRequest(id, userId);
  }
}
