import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Position, MemberType, MemberStatus, PreferredFoot } from '@prisma/client';

export class CreateMemberDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'Văn A', required: false })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ example: '1995-01-01', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ enum: Position, example: Position.FORWARD })
  @IsEnum(Position)
  position: Position;

  @ApiProperty({ example: 170, required: false })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(250)
  height?: number;

  @ApiProperty({ example: 70, required: false })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  weight?: number;

  @ApiProperty({ enum: PreferredFoot, required: false })
  @IsOptional()
  @IsEnum(PreferredFoot)
  preferredFoot?: PreferredFoot;

  @ApiProperty({ enum: MemberType, example: MemberType.OFFICIAL })
  @IsEnum(MemberType)
  memberType: MemberType;

  @ApiProperty({ enum: MemberStatus, example: MemberStatus.ACTIVE })
  @IsEnum(MemberStatus)
  status: MemberStatus;
}

export class UpdateMemberDto {
  @ApiProperty({ example: 'Nguyễn Văn A', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: 'Văn A', required: false })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ example: '1995-01-01', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ enum: Position, required: false })
  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @ApiProperty({ example: 170, required: false })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(250)
  height?: number;

  @ApiProperty({ example: 70, required: false })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(200)
  weight?: number;

  @ApiProperty({ enum: PreferredFoot, required: false })
  @IsOptional()
  @IsEnum(PreferredFoot)
  preferredFoot?: PreferredFoot;

  @ApiProperty({ enum: MemberType, required: false })
  @IsOptional()
  @IsEnum(MemberType)
  memberType?: MemberType;

  @ApiProperty({ enum: MemberStatus, required: false })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class MemberSearchDto {
  @ApiProperty({ example: 'Nguyễn', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: Position, required: false })
  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @ApiProperty({ enum: MemberStatus, required: false })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiProperty({ enum: MemberType, required: false })
  @IsOptional()
  @IsEnum(MemberType)
  memberType?: MemberType;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ example: 'fullName', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ example: 'asc', enum: ['asc', 'desc'], required: false })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class AssignToTeamDto {
  @ApiProperty({ example: 'team-uuid' })
  @IsUUID()
  teamId: string;

  @ApiProperty({ type: [String], example: ['member-uuid-1', 'member-uuid-2'] })
  @IsUUID('4', { each: true })
  memberIds: string[];
}
