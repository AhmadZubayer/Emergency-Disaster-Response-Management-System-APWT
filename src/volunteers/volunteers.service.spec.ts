/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { RescueStatus } from 'src/rescue-requests/entities/rescue-request.entity';
import { VolunteersService } from './volunteers.service';
import {
  FieldReportType,
  OrganizationRequestStatus,
  VolunteerSkill,
  VolunteerTaskStatus,
  VolunteerVerificationStatus,
} from './enums/volunteer-status.enum';

describe('VolunteersService', () => {
  let service: VolunteersService;
  let volunteerRepo: any;
  let taskRepo: any;
  let fieldReportRepo: any;
  let organizationRequestRepo: any;
  let organizationJoinRepo: any;
  let groupJoinRepo: any;
  let rescueRequestRepo: any;
  let missingPersonRepo: any;
  let authRepo: any;
  let usersService: any;
  let filesService: any;
  let auditService: any;

  const createRepo = () => ({
    create: jest.fn((value) => ({ ...value })),
    save: jest.fn(async (value) => value),
    findOne: jest.fn(),
    find: jest.fn(async () => []),
    count: jest.fn(async () => 0),
  });

  const verifiedVolunteer = {
    id: 'volunteer-1',
    user_id: 'user-1',
    skills: [VolunteerSkill.FIRST_AID, VolunteerSkill.FLOOD_RESCUE],
    why_join: 'I want to help flood victims',
    nid_card_url: '/user-files/volunteers/nid/test.pdf',
    available: true,
    verification_status: VolunteerVerificationStatus.VERIFIED,
    current_latitude: 23.8103,
    current_longitude: 90.4125,
    on_duty: true,
  };

  beforeEach(() => {
    volunteerRepo = createRepo();
    taskRepo = createRepo();
    fieldReportRepo = createRepo();
    organizationRequestRepo = createRepo();
    organizationJoinRepo = createRepo();
    groupJoinRepo = createRepo();
    rescueRequestRepo = createRepo();
    missingPersonRepo = createRepo();
    authRepo = createRepo();
    usersService = {
      getUserById: jest.fn(),
    };
    filesService = {
      saveFiles: jest.fn().mockResolvedValue(['/user-files/volunteers/nid/test.pdf']),
    };
    auditService = {
      setCreated: jest.fn(),
      setUpdated: jest.fn(),
    };

    service = new VolunteersService(
      volunteerRepo,
      taskRepo,
      fieldReportRepo,
      organizationRequestRepo,
      organizationJoinRepo,
      groupJoinRepo,
      rescueRequestRepo,
      missingPersonRepo,
      authRepo,
      usersService,
      filesService,
      auditService,
    );
  });

  it('registers a volunteer with rescue skills and non-null why_join', async () => {
    usersService.getUserById.mockResolvedValue({ id: 'user-1' });
    volunteerRepo.findOne.mockResolvedValue(null);

    const result = await service.register('user-1', {
      skills: [VolunteerSkill.FIRST_AID, VolunteerSkill.SEARCH_AND_RESCUE],
      why_join: 'I have first aid training and want to support emergency efforts',
      available: true,
    });

    expect(result.skills).toEqual([VolunteerSkill.FIRST_AID, VolunteerSkill.SEARCH_AND_RESCUE]);
    expect(result.why_join).toBe('I have first aid training and want to support emergency efforts');
    expect(result.verification_status).toBe(
      VolunteerVerificationStatus.NOT_APPLIED,
    );
    expect(volunteerRepo.save).toHaveBeenCalled();
  });

  it('does not allow an unverified volunteer to perform field work', async () => {
    volunteerRepo.findOne.mockResolvedValue({
      ...verifiedVolunteer,
      verification_status: VolunteerVerificationStatus.PENDING,
    });

    await expect(
      service.updateLocation('user-1', {
        latitude: 23.8,
        longitude: 90.4,
        on_duty: true,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('submits a completed volunteer profile with NID for verification', async () => {
    volunteerRepo.findOne.mockResolvedValue({
      ...verifiedVolunteer,
      verification_status: VolunteerVerificationStatus.NOT_APPLIED,
    });

    const result = await service.applyForVerification('user-1');

    expect(result.verification_status).toBe(
      VolunteerVerificationStatus.PENDING,
    );
    expect(volunteerRepo.save).toHaveBeenCalled();
  });

  it('returns only nearby unassigned rescue requests', async () => {
    volunteerRepo.findOne.mockResolvedValue(verifiedVolunteer);
    taskRepo.find.mockResolvedValue([]);
    rescueRequestRepo.find.mockResolvedValue([
      {
        id: 'near',
        latitude: 23.811,
        longitude: 90.413,
      },
      {
        id: 'far',
        latitude: 24.9,
        longitude: 91.8,
      },
    ]);

    const result = await service.getNearbyRequests('user-1', 10);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('near');
    expect(result[0].distance_km).toBeLessThan(10);
  });

  it('accepts a rescue request and assigns it to the volunteer', async () => {
    volunteerRepo.findOne.mockResolvedValue(verifiedVolunteer);
    rescueRequestRepo.findOne.mockResolvedValue({
      id: 'request-1',
      status: RescueStatus.PENDING,
      assigned_rescuer_id: null,
    });
    taskRepo.findOne.mockResolvedValue(null);

    const result = await service.acceptTask('user-1', 'request-1');

    expect(result.status).toBe(VolunteerTaskStatus.ACCEPTED);
    expect(rescueRequestRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        status: RescueStatus.ACKNOWLEDGED,
        assigned_rescuer_id: 'volunteer-1',
      }),
    );
  });

  it('updates task progress and completes its rescue request', async () => {
    volunteerRepo.findOne.mockResolvedValue(verifiedVolunteer);
    taskRepo.findOne.mockResolvedValue({
      id: 'task-1',
      volunteer_id: 'volunteer-1',
      status: VolunteerTaskStatus.IN_PROGRESS,
      rescue_request: {
        id: 'request-1',
        status: RescueStatus.IN_PROGRESS,
      },
    });

    const result = await service.completeTask('user-1', 'task-1');

    expect(result.status).toBe(VolunteerTaskStatus.COMPLETED);
    expect(result.completed_at).toBeInstanceOf(Date);
    expect(rescueRequestRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: RescueStatus.RESCUED }),
    );
  });

  it('creates a resource shortage report', async () => {
    volunteerRepo.findOne.mockResolvedValue(verifiedVolunteer);

    const result = await service.reportResourceShortage('user-1', {
      resource_name: 'Drinking water',
      quantity_needed: 100,
      description: 'Camp stock is almost empty',
      latitude: 23.81,
      longitude: 90.41,
    });

    expect(result.report_type).toBe(FieldReportType.RESOURCE_SHORTAGE);
    expect(result.resource_name).toBe('Drinking water');
    expect(fieldReportRepo.save).toHaveBeenCalled();
  });

  it('joins an open organization request and closes it at capacity', async () => {
    volunteerRepo.findOne.mockResolvedValue(verifiedVolunteer);
    const organizationRequest = {
      id: 'organization-request-1',
      needed_volunteers: 1,
      status: OrganizationRequestStatus.OPEN,
    };
    organizationRequestRepo.findOne.mockResolvedValue(organizationRequest);
    organizationJoinRepo.findOne.mockResolvedValue(null);
    organizationJoinRepo.count.mockResolvedValue(0);

    const result = await service.joinOrganizationRequest(
      'user-1',
      'organization-request-1',
    );

    expect(result.organization_request_id).toBe('organization-request-1');
    expect(organizationRequest.status).toBe(OrganizationRequestStatus.CLOSED);
    expect(organizationRequestRepo.save).toHaveBeenCalled();
  });

  it('prevents unavailable volunteers from accepting tasks', async () => {
    volunteerRepo.findOne.mockResolvedValue({
      ...verifiedVolunteer,
      available: false,
    });

    await expect(
      service.acceptTask('user-1', 'request-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

