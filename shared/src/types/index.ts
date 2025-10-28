// Shared types for frontend and backend
export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum Position {
  GOALKEEPER = 'GOALKEEPER',
  DEFENDER = 'DEFENDER',
  MIDFIELDER = 'MIDFIELDER',
  FORWARD = 'FORWARD',
}

export enum MemberType {
  OFFICIAL = 'OFFICIAL',
  TRIAL = 'TRIAL',
  GUEST = 'GUEST',
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LEFT = 'LEFT',
}

export enum SessionType {
  TRAINING = 'TRAINING',
  FRIENDLY_MATCH = 'FRIENDLY_MATCH',
  TOURNAMENT = 'TOURNAMENT',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
}

export enum FeeType {
  MONTHLY = 'MONTHLY',
  PER_SESSION = 'PER_SESSION',
  SPECIAL = 'SPECIAL',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum PreferredFoot {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  BOTH = 'BOTH',
}

// Base interfaces
export interface User {
  id: string;
  email: string;
  phone?: string;
  image?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Member {
  id: string;
  userId: string;
  fullName: string;
  nickname?: string;
  dateOfBirth?: Date;
  position: Position;
  height?: number;
  weight?: number;
  preferredFoot?: PreferredFoot;
  avatar?: string;
  memberType: MemberType;
  status: MemberStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  datetime: Date;
  location: string;
  type: SessionType;
  maxParticipants?: number;
  registrationDeadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  sessionId: string;
  memberId: string;
  status: AttendanceStatus;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Fee {
  id: string;
  teamId: string;
  title: string;
  description?: string;
  amount: number;
  type: FeeType;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  feeId: string;
  memberId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}