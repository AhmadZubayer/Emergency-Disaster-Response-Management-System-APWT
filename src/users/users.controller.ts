import {
  Body,
  Controller,
  Patch,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtGuard } from 'src/auth/guards/access-jwt-guard';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { CompleteUserProfileDto } from './dto/complete-user-profile.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('update-profile')
  @UseGuards(JwtGuard)
  @UseInterceptors(FilesInterceptor('file'))
  @ResponseMessage('User profile updated successfully')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const file = files && files.length > 0 ? files[0] : undefined;
    return await this.usersService.updateProfile(
      userId,
      updateUserProfileDto,
      file,
    );
  }

  @Put('complete-profile')
  @UseGuards(JwtGuard)
  @UseInterceptors(FilesInterceptor('file'))
  @ResponseMessage('User profile completed successfully')
  async completeProfile(
    @CurrentUser('id') userId: string,
    @Body() completeUserProfileDto: CompleteUserProfileDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const file = files && files.length > 0 ? files[0] : undefined;
    return await this.usersService.completeProfile(
      userId,
      completeUserProfileDto,
      file,
    );
  }

  @Patch('is-safe')
  @UseGuards(JwtGuard)
  @ResponseMessage('Safety status updated successfully')
  async toggleIsSafe(@CurrentUser('id') userId: string) {
    return await this.usersService.toggleIsSafe(userId);
  }
}
