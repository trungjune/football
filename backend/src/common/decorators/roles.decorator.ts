import { SetMetadata } from '@nestjs/common';
import { UserRole as Role } from '@football-manager/shared';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
