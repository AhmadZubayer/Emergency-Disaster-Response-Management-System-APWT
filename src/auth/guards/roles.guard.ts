import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { USER_ROLE } from 'src/auth/types/user-roles.type';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflactor: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflactor.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }
    const user = context.switchToHttp().getRequest().user;
    if (!user) {
      return false;
    }

    if (user.role === USER_ROLE.ADMIN || requiredRoles.includes(user.role)) {
      return true;
    }

    return false;
  }
}