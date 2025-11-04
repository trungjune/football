// Member entity types
export interface Member {
  id: string;
  userId: string;
  fullName: string;
  nickname?: string;
  phone?: string;
  position?: Position;
  skillLevel: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export enum Position {
  GOALKEEPER = 'GOALKEEPER',
  DEFENDER = 'DEFENDER',
  MIDFIELDER = 'MIDFIELDER',
  FORWARD = 'FORWARD',
}

export enum MemberType {
  REGULAR = 'REGULAR',
  GUEST = 'GUEST',
  TRIAL = 'TRIAL',
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum PreferredFoot {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  BOTH = 'BOTH',
}

// Import User type
import type { User } from './user';
