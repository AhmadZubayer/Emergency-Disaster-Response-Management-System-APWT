import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TrashService } from './trash.service';
import { JwtGuard } from 'src/auth/guards/access-jwt-guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('trash')
@UseGuards(JwtGuard)
export class TrashController {
  constructor(private readonly trashService: TrashService) {}

  @Get()
  @ResponseMessage('Trash items retrieved successfully')
  async getUserTrash(@CurrentUser('id') userId: string) {
    return this.trashService.getUserTrash(userId);
  }

  @Post(':id/restore')
  @ResponseMessage('Item restored successfully')
  async restore(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.trashService.restore(id, userId, role);
  }

  @Delete(':id')
  @ResponseMessage('Item permanently deleted')
  async deletePermanently(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.trashService.deletePermanently(id, userId, role);
  }
}
