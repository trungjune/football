import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
// Using string literals instead of Prisma enums

export class CreateSessionDto {
  @ApiProperty({ example: 'Buổi tập thứ 7' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @ApiProperty({ example: 'Buổi tập kỹ thuật cơ bản', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-12-25T10:00:00Z' })
  @IsDateString({}, { message: 'Thời gian không hợp lệ' })
  datetime: string;

  @ApiProperty({ example: 'Sân bóng ABC, Quận 1' })
  @IsString()
  @IsNotEmpty({ message: 'Địa điểm không được để trống' })
  location: string;

  @ApiProperty({ enum: ['TRAINING', 'FRIENDLY_MATCH', 'TOURNAMENT'], example: 'TRAINING' })
  @IsEnum(['TRAINING', 'FRIENDLY_MATCH', 'TOURNAMENT'], { message: 'Loại buổi tập không hợp lệ' })
  type: 'TRAINING' | 'FRIENDLY_MATCH' | 'TOURNAMENT';

  @ApiProperty({ example: 14, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng tối đa phải là số nguyên' })
  @Min(1, { message: 'Số lượng tối đa phải lớn hơn 0' })
  maxParticipants?: number;

  @ApiProperty({ example: '2024-12-24T18:00:00Z', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Hạn đăng ký không hợp lệ' })
  registrationDeadline?: string;
}

export class UpdateSessionDto extends PartialType(CreateSessionDto) {}

export class SessionSearchDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: ['TRAINING', 'FRIENDLY_MATCH', 'TOURNAMENT'], required: false })
  @IsOptional()
  @IsEnum(['TRAINING', 'FRIENDLY_MATCH', 'TOURNAMENT'])
  type?: 'TRAINING' | 'FRIENDLY_MATCH' | 'TOURNAMENT';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ example: 'datetime', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'datetime';

  @ApiProperty({ enum: ['asc', 'desc'], example: 'desc', required: false })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class MarkAttendanceDto {
  @ApiProperty({ enum: ['PRESENT', 'ABSENT', 'LATE'], example: 'PRESENT' })
  @IsEnum(['PRESENT', 'ABSENT', 'LATE'], { message: 'Trạng thái điểm danh không hợp lệ' })
  status: 'PRESENT' | 'ABSENT' | 'LATE';

  @ApiProperty({ example: 'Đi muộn do kẹt xe', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AttendanceStatsDto {
  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 8 })
  present: number;

  @ApiProperty({ example: 1 })
  absent: number;

  @ApiProperty({ example: 1 })
  late: number;
}
