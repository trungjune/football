import { SetMetadata } from '@nestjs/common';
// Role enum replaced with string literal

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
