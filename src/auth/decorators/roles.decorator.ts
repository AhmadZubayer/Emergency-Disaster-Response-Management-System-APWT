import { SetMetadata } from '@nestjs/common';

export const roles = (...roles: string[]) => SetMetadata('roles', roles);
