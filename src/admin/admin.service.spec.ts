import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { USER_ROLE } from 'src/auth/types/user-roles.type';
import { VolunteerVerificationStatus } from 'src/volunteers/enums/volunteer-status.enum';
import { VerificationStatus } from 'src/relief-org/entities/relief-org.entity';
import { PostStatus } from 'src/community-posts/enums/post-status.enum';

describe('AdminService', () => {
  let service: AdminService;
  let authRepo: any;
  let usersRepo: any;
  let volunteerRepo: any;
  let reliefOrgRepo: any;
  let disasterRepo: any;
  let rescueRequestRepo: any;
  let communityPostRepo: any;

  const createRepo = () => ({
    find: jest.fn(async () => []),
    findAndCount: jest.fn(async () => [[], 0]),
    findOne: jest.fn(),
    save: jest.fn(async (value) => value),
    update: jest.fn(async () => undefined),
    count: jest.fn(async () => 0),
    softDelete: jest.fn(async () => undefined),
    restore: jest.fn(async () => undefined),
  });

  beforeEach(() => {
    authRepo = createRepo();
    usersRepo = createRepo();
    volunteerRepo = createRepo();
    reliefOrgRepo = createRepo();
    disasterRepo = createRepo();
    rescueRequestRepo = createRepo();
    communityPostRepo = createRepo();

    service = new AdminService(
      authRepo,
      usersRepo,
      volunteerRepo,
      reliefOrgRepo,
      disasterRepo,
      rescueRequestRepo,
      communityPostRepo,
    );
  });

  it('updates a user role to admin when it is supported', async () => {
    authRepo.findOne.mockResolvedValue({ role: USER_ROLE.USER });

    const result = await service.updateAccountRole('user-1', 'ADMIN');

    expect(result.role).toBe(USER_ROLE.ADMIN);
    expect(authRepo.save).toHaveBeenCalled();
  });

  it('rejects unsupported roles', async () => {
    authRepo.findOne.mockResolvedValue({ role: USER_ROLE.USER });

    await expect(service.updateAccountRole('user-1', 'supervisor')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('verifies a volunteer with a supported status', async () => {
    volunteerRepo.findOne.mockResolvedValue({ verification_status: VolunteerVerificationStatus.PENDING });

    const result = await service.verifyVolunteer('vol-1', 'verified');

    expect(result.verification_status).toBe(VolunteerVerificationStatus.VERIFIED);
  });

  it('throws when volunteer cannot be found', async () => {
    volunteerRepo.findOne.mockResolvedValue(null);

    await expect(service.verifyVolunteer('missing', 'verified')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('verifies a relief organization', async () => {
    reliefOrgRepo.findOne.mockResolvedValue({ verificationStatus: VerificationStatus.PENDING });

    const result = await service.verifyReliefOrg('org-1', 'verified');

    expect(result.verificationStatus).toBe(VerificationStatus.VERIFIED);
  });

  it('moderates a community post to archived', async () => {
    communityPostRepo.findOne.mockResolvedValue({ status: PostStatus.POSTED });

    const result = await service.moderateCommunityPost('post-1', 'archived');

    expect(result.status).toBe(PostStatus.ARCHIVED);
  });

  it('returns an admin report summary', async () => {
    authRepo.count.mockResolvedValue(2);
    volunteerRepo.count.mockResolvedValue(3);
    reliefOrgRepo.count.mockResolvedValue(4);
    disasterRepo.count.mockResolvedValue(5);
    rescueRequestRepo.count.mockResolvedValue(6);
    communityPostRepo.count.mockResolvedValue(7);

    const result = await service.generateReport();

    expect(result.accounts).toBe(2);
    expect(result.volunteers).toBe(3);
    expect(result.generatedAt).toBeInstanceOf(Date);
  });

  it('paginates account listings', async () => {
    authRepo.findAndCount.mockResolvedValue([[{ id: 'auth-1' }], 1]);

    const result = await service.listAccounts({ page: '2', limit: '5', role: 'admin', includeDeleted: true });

    expect(authRepo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
        withDeleted: true,
        where: { role: USER_ROLE.ADMIN },
      }),
    );
    expect(result.meta.page).toBe(2);
    expect(result.data).toHaveLength(1);
  });

  it('soft deletes and restores an account', async () => {
    authRepo.findOne.mockResolvedValue({ id: 'auth-1', user_id: 'user-1' });

    const deleted = await service.softDeleteAccount('user-1');
    const restored = await service.restoreAccount('user-1');

    expect(authRepo.softDelete).toHaveBeenCalledWith('auth-1');
    expect(usersRepo.softDelete).toHaveBeenCalledWith('user-1');
    expect(authRepo.restore).toHaveBeenCalledWith('auth-1');
    expect(usersRepo.restore).toHaveBeenCalledWith('user-1');
    expect(deleted.message).toContain('soft deleted');
    expect(restored.message).toContain('restored');
  });

  it('soft deletes and restores a community post', async () => {
    communityPostRepo.findOne.mockResolvedValue({ id: 'post-1', status: PostStatus.POSTED });

    const deleted = await service.softDeleteCommunityPost('post-1');
    const restored = await service.restoreCommunityPost('post-1');

    expect(communityPostRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: PostStatus.REMOVED }));
    expect(communityPostRepo.softDelete).toHaveBeenCalledWith('post-1');
    expect(communityPostRepo.restore).toHaveBeenCalledWith('post-1');
    expect(deleted.message).toContain('soft deleted');
    expect(restored.message).toContain('restored');
  });
});
