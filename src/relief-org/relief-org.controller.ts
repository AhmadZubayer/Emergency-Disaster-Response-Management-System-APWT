import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReliefOrgService } from './relief-org.service';
import { SignUpReliefOrgDto } from './dto/sign-up-relief-org.dto';
import { JwtGuard } from 'src/auth/guards/access-jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { USER_ROLE } from 'src/auth/types/user-roles.type';

@ApiTags('Relief Organization')
@Controller('relief-org')
export class ReliefOrgController {
  constructor(private readonly reliefOrgService: ReliefOrgService) {}

  @Post('sign-up-as-relief-org')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('verification_doc'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Apply/Sign up as a Relief Organization (PDF document required)',
  })
  @ApiResponse({
    status: 201,
    description: 'Relief organization sign up request submitted for admin review.',
  })
  @ResponseMessage('Relief organization sign up request submitted successfully')
  signUpAsReliefOrg(
    @CurrentUser('id') userId: string,
    @Body() dto: SignUpReliefOrgDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.reliefOrgService.signUpAsReliefOrg(userId, dto, file);
  }

  @Patch(':id/verify')
  @UseGuards(JwtGuard, RolesGuard)
  @roles(USER_ROLE.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin verifies a Relief Organization and updates account role',
  })
  @ApiParam({ name: 'id', description: 'Relief Organization UUID' })
  @ResponseMessage(
    'Relief organization verified successfully and account role updated',
  )
  verifyReliefOrg(@Param('id') orgId: string) {
    return this.reliefOrgService.verifyReliefOrg(orgId);
  }

  @Get('profile/me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user relief organization profile' })
  @ResponseMessage('Relief organization profile retrieved successfully')
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.reliefOrgService.getMyProfile(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all registered relief organizations' })
  @ResponseMessage('Relief organizations retrieved successfully')
  getAll() {
    return this.reliefOrgService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get relief organization details by ID' })
  @ApiParam({ name: 'id', description: 'Relief Organization UUID' })
  @ResponseMessage('Relief organization details retrieved successfully')
  getById(@Param('id') id: string) {
    return this.reliefOrgService.getById(id);
  }
}
