// Members API types
import type { Member, Position } from '../entities/member';
import type { PaginationParams } from './common';

export interface CreateMemberRequest {
  fullName: string;
  nickname?: string;
  phone?: string;
  position?: Position;
  skillLevel?: number;
}

export interface UpdateMemberRequest extends Partial<CreateMemberRequest> {}

export interface MemberSearchParams extends PaginationParams {
  position?: Position;
  isActive?: boolean;
  skillLevel?: number;
}

export interface MemberResponse extends Member {
  // Additional computed fields for API response
  totalSessions?: number;
  totalPayments?: number;
  lastSessionDate?: Date;
}
