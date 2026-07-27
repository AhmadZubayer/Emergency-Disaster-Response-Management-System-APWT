import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from 'src/auth/entities/auth.entity';
import { USER_ROLE } from 'src/auth/types/user-roles.type';
import {
  RescueRequest,
  RescueStatus,
} from 'src/rescue-requests/entities/rescue-request.entity';
import { UsersService } from 'src/users/users.service';
import { IsNull, Not, Repository } from 'typeorm';
import { CreateOrganizationRequestDto } from './dto/create-organization-request.dto';
import { CreateResourceShortageDto } from './dto/create-resource-shortage.dto';
import { CreateRouteReportDto } from './dto/create-route-report.dto';
import { RegisterVolunteerDto } from './dto/register-volunteer.dto';
import { UpdateTaskProgressDto } from './dto/update-task-progress.dto';
import { UpdateVolunteerLocationDto } from './dto/update-volunteer-location.dto';
import { UpdateVolunteerProfileDto } from './dto/update-volunteer-profile.dto';
import { FieldReport } from './entities/field-report.entity';
import { OrganizationVolunteerRequest } from './entities/organization-volunteer-request.entity';
import { VolunteerOrganizationJoin } from './entities/volunteer-organization-join.entity';
import { VolunteerTask } from './entities/volunteer-task.entity';
import { Volunteer } from './entities/volunteer.entity';
import {
  FieldReportType,
  OrganizationRequestStatus,
  ReportSeverity,
  VolunteerTaskStatus,
  VolunteerVerificationStatus,
} from './enums/volunteer-status.enum';

@Injectable()
export class VolunteersService {
  constructor(
    @InjectRepository(Volunteer)
    private readonly volunteerRepo: Repository<Volunteer>,
    @InjectRepository(VolunteerTask)
    private readonly taskRepo: Repository<VolunteerTask>,
    @InjectRepository(FieldReport)
    private readonly fieldReportRepo: Repository<FieldReport>,
    @InjectRepository(OrganizationVolunteerRequest)
    private readonly organizationRequestRepo: Repository<OrganizationVolunteerRequest>,
    @InjectRepository(VolunteerOrganizationJoin)
    private readonly organizationJoinRepo: Repository<VolunteerOrganizationJoin>,
    @InjectRepository(RescueRequest)
    private readonly rescueRequestRepo: Repository<RescueRequest>,
    @InjectRepository(Auth)
    private readonly authRepo: Repository<Auth>,
    private readonly usersService: UsersService,
  ) {}

  async register(
    userId: string,
    dto: RegisterVolunteerDto,
  ): Promise<Volunteer> {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    const existingVolunteer = await this.volunteerRepo.findOne({
      where: { user_id: userId },
    });
    if (existingVolunteer) {
      throw new BadRequestException('Volunteer profile already exists');
    }

    const volunteer = this.volunteerRepo.create({
      user_id: userId,
      skills: this.cleanSkills(dto.skills ?? []),
      available: dto.available ?? false,
      verification_status: VolunteerVerificationStatus.NOT_APPLIED,
      on_duty: false,
    });

    return await this.volunteerRepo.save(volunteer);
  }

  async getMyProfile(userId: string): Promise<Volunteer> {
    return await this.getVolunteerByUserId(userId);
  }

  async updateProfile(
    userId: string,
    dto: UpdateVolunteerProfileDto,
  ): Promise<Volunteer> {
    const volunteer = await this.getVolunteerByUserId(userId);

    if (dto.skills !== undefined) {
      const skills = this.cleanSkills(dto.skills);
      if (skills.length === 0) {
        throw new BadRequestException('At least one rescue skill is required');
      }
      volunteer.skills = skills;
    }

    if (dto.available !== undefined) {
      volunteer.available = dto.available;
      if (!dto.available) {
        volunteer.on_duty = false;
      }
    }

    return await this.volunteerRepo.save(volunteer);
  }

  async applyForVerification(userId: string): Promise<Volunteer> {
    const volunteer = await this.getVolunteerByUserId(userId);

    if (!volunteer.skills || volunteer.skills.length === 0) {
      throw new BadRequestException(
        'Add at least one rescue skill before applying for verification',
      );
    }

    if (
      volunteer.verification_status === VolunteerVerificationStatus.VERIFIED
    ) {
      throw new BadRequestException('Volunteer is already verified');
    }

    volunteer.verification_status = VolunteerVerificationStatus.PENDING;
    return await this.volunteerRepo.save(volunteer);
  }

  async reviewVerification(
    volunteerId: string,
    status: VolunteerVerificationStatus,
  ): Promise<Volunteer> {
    if (
      status !== VolunteerVerificationStatus.VERIFIED &&
      status !== VolunteerVerificationStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Verification review must be verified or rejected',
      );
    }

    const volunteer = await this.volunteerRepo.findOne({
      where: { id: volunteerId },
    });
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }

    volunteer.verification_status = status;
    volunteer.available =
      status === VolunteerVerificationStatus.VERIFIED
        ? volunteer.available
        : false;
    volunteer.on_duty = false;

    const auth = await this.authRepo.findOne({
      where: { user_id: volunteer.user_id },
    });
    if (auth) {
      auth.role =
        status === VolunteerVerificationStatus.VERIFIED
          ? USER_ROLE.VOLUNTEER
          : USER_ROLE.USER;
      await this.authRepo.save(auth);
    }

    return await this.volunteerRepo.save(volunteer);
  }

  async updateLocation(
    userId: string,
    dto: UpdateVolunteerLocationDto,
  ): Promise<Volunteer> {
    const volunteer = await this.getVerifiedVolunteer(userId);

    if (dto.on_duty === true && !volunteer.available) {
      throw new BadRequestException(
        'Set volunteer availability before going on duty',
      );
    }

    volunteer.current_latitude = dto.latitude;
    volunteer.current_longitude = dto.longitude;
    volunteer.last_location_update = new Date();

    if (dto.on_duty !== undefined) {
      volunteer.on_duty = dto.on_duty;
    }

    return await this.volunteerRepo.save(volunteer);
  }

  async getNearbyRequests(
    userId: string,
    radiusKm = 25,
  ): Promise<Array<RescueRequest & { distance_km: number }>> {
    const volunteer = await this.getVerifiedVolunteer(userId);

    if (
      volunteer.current_latitude === null ||
      volunteer.current_longitude === null
    ) {
      throw new BadRequestException(
        'Share your current location before viewing nearby requests',
      );
    }

    if (!volunteer.available) {
      throw new BadRequestException(
        'Set your availability before viewing matching requests',
      );
    }

    if (radiusKm <= 0 || radiusKm > 200) {
      throw new BadRequestException(
        'Search radius must be between 1 and 200 kilometers',
      );
    }

    const rejectedTasks = await this.taskRepo.find({
      where: {
        volunteer_id: volunteer.id,
        status: VolunteerTaskStatus.REJECTED,
      },
    });
    const rejectedRequestIds = new Set(
      rejectedTasks.map((task) => task.rescue_request_id),
    );

    const requests = await this.rescueRequestRepo.find({
      where: {
        status: RescueStatus.PENDING,
        assigned_rescuer_id: IsNull(),
      },
      relations: { user: true },
      order: { created_at: 'DESC' },
    });

    return requests
      .filter((request) => !rejectedRequestIds.has(request.id))
      .map((request) => ({
        ...request,
        distance_km: this.calculateDistance(
          Number(volunteer.current_latitude),
          Number(volunteer.current_longitude),
          Number(request.latitude),
          Number(request.longitude),
        ),
      }))
      .filter((request) => request.distance_km <= radiusKm)
      .sort((a, b) => a.distance_km - b.distance_km);
  }

  async acceptTask(
    userId: string,
    rescueRequestId: string,
  ): Promise<VolunteerTask> {
    const volunteer = await this.getVerifiedVolunteer(userId);
    if (!volunteer.available) {
      throw new BadRequestException(
        'Set your availability before accepting a task',
      );
    }

    const request = await this.rescueRequestRepo.findOne({
      where: { id: rescueRequestId },
    });
    if (!request) {
      throw new NotFoundException('Rescue request not found');
    }

    if (
      request.assigned_rescuer_id &&
      request.assigned_rescuer_id !== volunteer.id
    ) {
      throw new BadRequestException(
        'Rescue task has already been assigned to another volunteer',
      );
    }

    if (
      request.status === RescueStatus.RESCUED ||
      request.status === RescueStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Completed or cancelled rescue request cannot be accepted',
      );
    }

    let task = await this.taskRepo.findOne({
      where: {
        volunteer_id: volunteer.id,
        rescue_request_id: rescueRequestId,
      },
    });

    if (!task) {
      task = this.taskRepo.create({
        volunteer_id: volunteer.id,
        rescue_request_id: rescueRequestId,
        status: VolunteerTaskStatus.ACCEPTED,
      });
    } else {
      task.status = VolunteerTaskStatus.ACCEPTED;
      task.completed_at = null;
    }

    request.assigned_rescuer_id = volunteer.id;
    request.status = RescueStatus.ACKNOWLEDGED;
    await this.rescueRequestRepo.save(request);

    return await this.taskRepo.save(task);
  }

  async rejectTask(
    userId: string,
    rescueRequestId: string,
  ): Promise<VolunteerTask> {
    const volunteer = await this.getVerifiedVolunteer(userId);
    const request = await this.rescueRequestRepo.findOne({
      where: { id: rescueRequestId },
    });

    if (!request) {
      throw new NotFoundException('Rescue request not found');
    }

    if (request.assigned_rescuer_id === volunteer.id) {
      throw new BadRequestException(
        'An accepted task cannot be rejected. Update its progress instead',
      );
    }

    let task = await this.taskRepo.findOne({
      where: {
        volunteer_id: volunteer.id,
        rescue_request_id: rescueRequestId,
      },
    });

    if (!task) {
      task = this.taskRepo.create({
        volunteer_id: volunteer.id,
        rescue_request_id: rescueRequestId,
        status: VolunteerTaskStatus.REJECTED,
      });
    } else {
      task.status = VolunteerTaskStatus.REJECTED;
    }

    return await this.taskRepo.save(task);
  }

  async getAssignedTasks(userId: string): Promise<VolunteerTask[]> {
    const volunteer = await this.getVolunteerByUserId(userId);
    return await this.taskRepo.find({
      where: {
        volunteer_id: volunteer.id,
        status: Not(VolunteerTaskStatus.REJECTED),
      },
      relations: {
        rescue_request: {
          user: true,
        },
      },
      order: { updated_at: 'DESC' },
    });
  }

  async updateTaskProgress(
    userId: string,
    taskId: string,
    dto: UpdateTaskProgressDto,
  ): Promise<VolunteerTask> {
    if (
      dto.status !== VolunteerTaskStatus.ACCEPTED &&
      dto.status !== VolunteerTaskStatus.IN_PROGRESS &&
      dto.status !== VolunteerTaskStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Task progress can only be accepted, in progress, or completed',
      );
    }

    const volunteer = await this.getVerifiedVolunteer(userId);
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: { rescue_request: true },
    });

    if (!task) {
      throw new NotFoundException('Volunteer task not found');
    }
    if (task.volunteer_id !== volunteer.id) {
      throw new ForbiddenException('You can only update your assigned tasks');
    }

    task.status = dto.status;
    if (dto.progress_note !== undefined) {
      task.progress_note = dto.progress_note;
    }

    if (dto.status === VolunteerTaskStatus.ACCEPTED) {
      task.rescue_request.status = RescueStatus.ACKNOWLEDGED;
    }
    if (dto.status === VolunteerTaskStatus.IN_PROGRESS) {
      task.rescue_request.status = RescueStatus.IN_PROGRESS;
    }
    if (dto.status === VolunteerTaskStatus.COMPLETED) {
      task.rescue_request.status = RescueStatus.RESCUED;
      task.completed_at = new Date();
    }

    await this.rescueRequestRepo.save(task.rescue_request);
    return await this.taskRepo.save(task);
  }

  async completeTask(userId: string, taskId: string): Promise<VolunteerTask> {
    return await this.updateTaskProgress(userId, taskId, {
      status: VolunteerTaskStatus.COMPLETED,
      progress_note: 'Rescue task completed',
    });
  }

  async reportRoute(
    userId: string,
    dto: CreateRouteReportDto,
  ): Promise<FieldReport> {
    const volunteer = await this.getVerifiedVolunteer(userId);
    const report = this.fieldReportRepo.create({
      volunteer_id: volunteer.id,
      report_type: dto.report_type,
      description: dto.description,
      latitude: dto.latitude,
      longitude: dto.longitude,
      address: dto.address ?? null,
      severity: dto.severity ?? ReportSeverity.HIGH,
      resource_name: null,
      quantity_needed: null,
    });

    return await this.fieldReportRepo.save(report);
  }

  async reportResourceShortage(
    userId: string,
    dto: CreateResourceShortageDto,
  ): Promise<FieldReport> {
    const volunteer = await this.getVerifiedVolunteer(userId);
    const report = this.fieldReportRepo.create({
      volunteer_id: volunteer.id,
      report_type: FieldReportType.RESOURCE_SHORTAGE,
      description: dto.description,
      latitude: dto.latitude,
      longitude: dto.longitude,
      address: dto.address ?? null,
      severity: dto.severity ?? ReportSeverity.HIGH,
      resource_name: dto.resource_name,
      quantity_needed: dto.quantity_needed,
    });

    return await this.fieldReportRepo.save(report);
  }

  async getMyFieldReports(userId: string): Promise<FieldReport[]> {
    const volunteer = await this.getVolunteerByUserId(userId);
    return await this.fieldReportRepo.find({
      where: { volunteer_id: volunteer.id },
      order: { created_at: 'DESC' },
    });
  }

  async createOrganizationRequest(
    organizationUserId: string,
    dto: CreateOrganizationRequestDto,
  ): Promise<OrganizationVolunteerRequest> {
    const request = this.organizationRequestRepo.create({
      organization_user_id: organizationUserId,
      title: dto.title,
      description: dto.description,
      required_skills: this.cleanSkills(dto.required_skills),
      location: dto.location,
      needed_volunteers: dto.needed_volunteers,
      status: OrganizationRequestStatus.OPEN,
    });

    return await this.organizationRequestRepo.save(request);
  }

  async getOpenOrganizationRequests(
    userId: string,
  ): Promise<OrganizationVolunteerRequest[]> {
    const volunteer = await this.getVerifiedVolunteer(userId);
    const requests = await this.organizationRequestRepo.find({
      where: { status: OrganizationRequestStatus.OPEN },
      relations: { organization_user: true },
      order: { created_at: 'DESC' },
    });

    const volunteerSkills = new Set(
      volunteer.skills.map((skill) => skill.toLowerCase()),
    );

    return requests.sort((first, second) => {
      const firstMatches = first.required_skills.filter((skill) =>
        volunteerSkills.has(skill.toLowerCase()),
      ).length;
      const secondMatches = second.required_skills.filter((skill) =>
        volunteerSkills.has(skill.toLowerCase()),
      ).length;
      return secondMatches - firstMatches;
    });
  }

  async joinOrganizationRequest(
    userId: string,
    requestId: string,
  ): Promise<VolunteerOrganizationJoin> {
    const volunteer = await this.getVerifiedVolunteer(userId);
    const request = await this.organizationRequestRepo.findOne({
      where: {
        id: requestId,
        status: OrganizationRequestStatus.OPEN,
      },
    });

    if (!request) {
      throw new NotFoundException(
        'Open organization volunteer request not found',
      );
    }

    const existingJoin = await this.organizationJoinRepo.findOne({
      where: {
        volunteer_id: volunteer.id,
        organization_request_id: request.id,
      },
    });
    if (existingJoin) {
      throw new BadRequestException(
        'You already joined this organization request',
      );
    }

    const joinedCount = await this.organizationJoinRepo.count({
      where: { organization_request_id: request.id },
    });
    if (joinedCount >= request.needed_volunteers) {
      request.status = OrganizationRequestStatus.CLOSED;
      await this.organizationRequestRepo.save(request);
      throw new BadRequestException(
        'This organization request already has enough volunteers',
      );
    }

    const join = this.organizationJoinRepo.create({
      volunteer_id: volunteer.id,
      organization_request_id: request.id,
    });
    const savedJoin = await this.organizationJoinRepo.save(join);

    if (joinedCount + 1 >= request.needed_volunteers) {
      request.status = OrganizationRequestStatus.CLOSED;
      await this.organizationRequestRepo.save(request);
    }

    return savedJoin;
  }

  async getMyOrganizationRequests(
    userId: string,
  ): Promise<VolunteerOrganizationJoin[]> {
    const volunteer = await this.getVolunteerByUserId(userId);
    return await this.organizationJoinRepo.find({
      where: { volunteer_id: volunteer.id },
      relations: {
        organization_request: {
          organization_user: true,
        },
      },
      order: { joined_at: 'DESC' },
    });
  }

  private async getVolunteerByUserId(userId: string): Promise<Volunteer> {
    const volunteer = await this.volunteerRepo.findOne({
      where: { user_id: userId },
      relations: { user: true },
    });
    if (!volunteer) {
      throw new NotFoundException(
        'Volunteer profile not found. Register as a volunteer first',
      );
    }
    return volunteer;
  }

  private async getVerifiedVolunteer(userId: string): Promise<Volunteer> {
    const volunteer = await this.getVolunteerByUserId(userId);
    if (
      volunteer.verification_status !== VolunteerVerificationStatus.VERIFIED
    ) {
      throw new ForbiddenException(
        'Volunteer verification is required for this action',
      );
    }
    return volunteer;
  }

  private cleanSkills(skills: string[]): string[] {
    return [
      ...new Set(
        skills
          .map((skill) => skill.trim().toLowerCase())
          .filter((skill) => skill.length > 0),
      ),
    ];
  }

  private calculateDistance(
    latitudeOne: number,
    longitudeOne: number,
    latitudeTwo: number,
    longitudeTwo: number,
  ): number {
    const earthRadiusKm = 6371;
    const latDistance = this.toRadians(latitudeTwo - latitudeOne);
    const lngDistance = this.toRadians(longitudeTwo - longitudeOne);
    const value =
      Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
      Math.cos(this.toRadians(latitudeOne)) *
        Math.cos(this.toRadians(latitudeTwo)) *
        Math.sin(lngDistance / 2) *
        Math.sin(lngDistance / 2);
    const distance =
      earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));

    return Number(distance.toFixed(2));
  }

  private toRadians(value: number): number {
    return value * (Math.PI / 180);
  }
}
