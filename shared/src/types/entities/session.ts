// Session entity types
export interface Session {
  id: string;
  title: string;
  description?: string;
  datetime: Date;
  location: string;
  maxPlayers: number;
  cost: number;
  type: SessionType;
  status: SessionStatus;
  registrationDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  registrations?: Registration[];
}

export enum SessionType {
  TRAINING = 'TRAINING',
  MATCH = 'MATCH',
  FRIENDLY = 'FRIENDLY',
  TOURNAMENT = 'TOURNAMENT',
}

export enum SessionStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface Registration {
  id: string;
  sessionId: string;
  memberId: string;
  status: RegistrationStatus;
  registeredAt: Date;
  session?: Session;
  member?: Member;
}

export enum RegistrationStatus {
  REGISTERED = 'REGISTERED',
  CANCELLED = 'CANCELLED',
  ATTENDED = 'ATTENDED',
  ABSENT = 'ABSENT',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
}

// Import Member type
import type { Member } from './member';
