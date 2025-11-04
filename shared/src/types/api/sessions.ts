// Sessions API types
import type { Session, SessionType, SessionStatus } from '../entities/session';
import type { PaginationParams } from './common';

export interface CreateSessionRequest {
  title: string;
  description?: string;
  datetime: Date;
  location: string;
  maxPlayers?: number;
  cost?: number;
  type?: SessionType;
  registrationDeadline?: Date;
}

export interface UpdateSessionRequest extends Partial<CreateSessionRequest> {
  status?: SessionStatus;
}

export interface SessionSearchParams extends PaginationParams {
  type?: SessionType;
  status?: SessionStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SessionResponse extends Session {
  // Additional computed fields for API response
  registeredCount?: number;
  availableSlots?: number;
  isRegistrationOpen?: boolean;
}

export interface RegisterSessionRequest {
  sessionId: string;
}

export interface CancelRegistrationRequest {
  sessionId: string;
}
