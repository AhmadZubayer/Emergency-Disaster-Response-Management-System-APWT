/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/require-await */
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtGuard } from 'src/auth/guards/access-jwt-guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { VolunteerTaskStatus } from 'src/volunteers/enums/volunteer-status.enum';
import { VolunteersController } from 'src/volunteers/volunteers.controller';
import { VolunteersService } from 'src/volunteers/volunteers.service';

class TestJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requestObject = context.switchToHttp().getRequest();
    requestObject.user = {
      id: 'user-1',
      email: 'volunteer@example.com',
      role: 'volunteer',
    };
    return true;
  }
}

describe('VolunteersController (e2e)', () => {
  let app: INestApplication<App>;
  let volunteersService: Record<string, jest.Mock>;

  beforeEach(async () => {
    volunteersService = {
      register: jest.fn(async (userId, dto) => ({ userId, ...dto })),
      getMyProfile: jest.fn(async (userId) => ({ user_id: userId })),
      updateProfile: jest.fn(async (userId, dto) => ({ userId, ...dto })),
      applyForVerification: jest.fn(async () => ({ status: 'pending' })),
      reviewVerification: jest.fn(async (id, status) => ({ id, status })),
      updateLocation: jest.fn(async (userId, dto) => ({ userId, ...dto })),
      getNearbyRequests: jest.fn(async () => [{ id: 'request-1' }]),
      acceptTask: jest.fn(async (userId, requestId) => ({
        userId,
        requestId,
        status: 'accepted',
      })),
      rejectTask: jest.fn(async (userId, requestId) => ({
        userId,
        requestId,
        status: 'rejected',
      })),
      getAssignedTasks: jest.fn(async () => []),
      updateTaskProgress: jest.fn(async (userId, taskId, dto) => ({
        userId,
        taskId,
        ...dto,
      })),
      completeTask: jest.fn(async (userId, taskId) => ({
        userId,
        taskId,
        status: 'completed',
      })),
      reportRoute: jest.fn(async (userId, dto) => ({ userId, ...dto })),
      reportResourceShortage: jest.fn(async (userId, dto) => ({
        userId,
        ...dto,
      })),
      getMyFieldReports: jest.fn(async () => []),
      createOrganizationRequest: jest.fn(async (userId, dto) => ({
        userId,
        ...dto,
      })),
      getOpenOrganizationRequests: jest.fn(async () => []),
      joinOrganizationRequest: jest.fn(async (userId, requestId) => ({
        userId,
        requestId,
      })),
      getMyOrganizationRequests: jest.fn(async () => []),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [VolunteersController],
      providers: [
        {
          provide: VolunteersService,
          useValue: volunteersService,
        },
      ],
    })
      .overrideGuard(JwtGuard)
      .useClass(TestJwtGuard)
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  it('registers a volunteer with rescue skills', async () => {
    await request(app.getHttpServer())
      .post('/volunteers/register')
      .send({
        skills: ['first aid', 'swimming'],
        available: true,
      })
      .expect(201)
      .expect((response) => {
        expect(response.body.userId).toBe('user-1');
        expect(response.body.skills).toEqual(['first aid', 'swimming']);
      });
  });

  it('returns nearby rescue requests with a numeric radius', async () => {
    await request(app.getHttpServer())
      .get('/volunteers/rescue-requests/nearby?radius=15')
      .expect(200)
      .expect([{ id: 'request-1' }]);

    expect(volunteersService.getNearbyRequests).toHaveBeenCalledWith(
      'user-1',
      15,
    );
  });

  it('accepts and updates a rescue task', async () => {
    await request(app.getHttpServer())
      .post('/volunteers/rescue-tasks/request-1/accept')
      .expect(201)
      .expect((response) => {
        expect(response.body.status).toBe('accepted');
      });

    await request(app.getHttpServer())
      .patch('/volunteers/rescue-tasks/task-1/progress')
      .send({
        status: VolunteerTaskStatus.IN_PROGRESS,
        progress_note: 'Travelling to the affected area',
      })
      .expect(200)
      .expect((response) => {
        expect(response.body.status).toBe(VolunteerTaskStatus.IN_PROGRESS);
      });
  });

  it('reports a blocked route and a resource shortage', async () => {
    await request(app.getHttpServer())
      .post('/volunteers/field-reports/routes')
      .send({
        report_type: 'blocked_route',
        description: 'Road is blocked by fallen trees',
        latitude: 23.81,
        longitude: 90.41,
        severity: 'high',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/volunteers/field-reports/shortages')
      .send({
        resource_name: 'Drinking water',
        quantity_needed: 100,
        description: 'Relief camp stock is low',
        latitude: 23.81,
        longitude: 90.41,
      })
      .expect(201);
  });

  it('joins an organization volunteer request', async () => {
    await request(app.getHttpServer())
      .post('/volunteers/organization-requests/request-1/join')
      .expect(201)
      .expect({
        userId: 'user-1',
        requestId: 'request-1',
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
