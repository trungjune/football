import { z } from 'zod';
import {
  UserRole,
  Position,
  MemberType,
  MemberStatus,
  SessionType,
  FeeType,
  PaymentMethod,
  PreferredFoot,
} from '../types/entities';

// User schemas
export const CreateUserSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z.nativeEnum(UserRole).default(UserRole.MEMBER),
});

export const UpdateUserSchema = CreateUserSchema.partial();

// Member schemas
export const CreateMemberSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  nickname: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  position: z.nativeEnum(Position),
  height: z.number().positive().optional(),
  weight: z.number().positive().optional(),
  preferredFoot: z.nativeEnum(PreferredFoot).optional(),
  memberType: z.nativeEnum(MemberType).default(MemberType.REGULAR),
  status: z.nativeEnum(MemberStatus).default(MemberStatus.ACTIVE),
});

export const UpdateMemberSchema = CreateMemberSchema.partial();

// Session schemas
export const CreateSessionSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional(),
  datetime: z.string().datetime('Thời gian không hợp lệ'),
  location: z.string().min(1, 'Địa điểm không được để trống'),
  type: z.nativeEnum(SessionType),
  maxParticipants: z.number().positive().optional(),
  registrationDeadline: z.string().datetime().optional(),
});

export const UpdateSessionSchema = CreateSessionSchema.partial();

// Fee schemas
export const CreateFeeSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional(),
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  type: z.nativeEnum(FeeType),
  dueDate: z.string().datetime().optional(),
});

export const UpdateFeeSchema = CreateFeeSchema.partial();

// Payment schemas
export const CreatePaymentSchema = z.object({
  feeId: z.string().uuid('ID phí không hợp lệ'),
  memberId: z.string().uuid('ID thành viên không hợp lệ'),
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  method: z.nativeEnum(PaymentMethod),
});

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Search schemas
export const MemberSearchSchema = z
  .object({
    search: z.string().optional(),
    position: z.nativeEnum(Position).optional(),
    status: z.nativeEnum(MemberStatus).optional(),
    memberType: z.nativeEnum(MemberType).optional(),
  })
  .merge(PaginationSchema);

export const SessionSearchSchema = z
  .object({
    search: z.string().optional(),
    type: z.nativeEnum(SessionType).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
  })
  .merge(PaginationSchema);

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type CreateMemberDto = z.infer<typeof CreateMemberSchema>;
export type UpdateMemberDto = z.infer<typeof UpdateMemberSchema>;
export type CreateSessionDto = z.infer<typeof CreateSessionSchema>;
export type UpdateSessionDto = z.infer<typeof UpdateSessionSchema>;
export type CreateFeeDto = z.infer<typeof CreateFeeSchema>;
export type UpdateFeeDto = z.infer<typeof UpdateFeeSchema>;
export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
export type PaginationDto = z.infer<typeof PaginationSchema>;
export type MemberSearchDto = z.infer<typeof MemberSearchSchema>;
export type SessionSearchDto = z.infer<typeof SessionSearchSchema>;
