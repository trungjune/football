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

// Using string literals to avoid Prisma enum import issues
type Position = 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';
type MemberType = 'OFFICIAL' | 'TRIAL' | 'GUEST';
type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'LEFT';
type PreferredFoot = 'LEFT' | 'RIGHT';

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

  @ApiProperty({ enum: ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'], example: 'FORWARD' })
  @IsEnum(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'])
  position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';

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

  @ApiProperty({ enum: ['LEFT', 'RIGHT'], required: false })
  @IsOptional()
  @IsEnum(['LEFT', 'RIGHT'])
  preferredFoot?: PreferredFoot;

  @ApiProperty({ enum: ['OFFICIAL', 'TRIAL', 'GUEST'], example: 'OFFICIAL' })
  @IsEnum(['OFFICIAL', 'TRIAL', 'GUEST'])
  memberType: MemberType;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE', 'LEFT'], example: 'ACTIVE' })
  @IsEnum(['ACTIVE', 'INACTIVE', 'LEFT'])
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

  @ApiProperty({ enum: ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'], required: false })
  @IsOptional()
  @IsEnum(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'])
  position?: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';

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

  @ApiProperty({ enum: ['LEFT', 'RIGHT'], required: false })
  @IsOptional()
  @IsEnum(['LEFT', 'RIGHT'])
  preferredFoot?: PreferredFoot;

  @ApiProperty({ enum: ['OFFICIAL', 'TRIAL', 'GUEST'], required: false })
  @IsOptional()
  @IsEnum(['OFFICIAL', 'TRIAL', 'GUEST'])
  memberType?: MemberType;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE', 'LEFT'], required: false })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'LEFT'])
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

  @ApiProperty({ enum: ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'], required: false })
  @IsOptional()
  @IsEnum(['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD'])
  position?: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE', 'LEFT'], required: false })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'LEFT'])
  status?: MemberStatus;

  @ApiProperty({ enum: ['OFFICIAL', 'TRIAL', 'GUEST'], required: false })
  @IsOptional()
  @IsEnum(['OFFICIAL', 'TRIAL', 'GUEST'])
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
