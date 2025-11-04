// User entity types
export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface UserProfile extends User {
  member?: Member;
}

// Import Member type (will be defined in member.ts)
import type { Member } from './member';
