import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  Max,
  ArrayMinSize,
} from 'class-validator';
import { Position } from '@prisma/client';

export enum BalanceStrategy {
  RANDOM = 'RANDOM',
  SKILL_BALANCED = 'SKILL_BALANCED',
  POSITION_BALANCED = 'POSITION_BALANCED',
  BALANCED = 'BALANCED',
}

export class DivideTeamsDto {
  @ApiProperty({
    example: ['member-1', 'member-2', 'member-3', 'member-4'],
    description: 'Array of member IDs to divide into teams',
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'Cần ít nhất 2 thành viên để chia đội' })
  @IsString({ each: true })
  participantIds: string[];

  @ApiProperty({ example: 2, minimum: 2, maximum: 6 })
  @IsInt({ message: 'Số đội phải là số nguyên' })
  @Min(2, { message: 'Cần ít nhất 2 đội' })
  @Max(6, { message: 'Tối đa 6 đội' })
  numberOfTeams: number;

  @ApiProperty({
    enum: BalanceStrategy,
    example: BalanceStrategy.BALANCED,
    required: false,
    description: 'Strategy for balancing teams',
  })
  @IsOptional()
  @IsEnum(BalanceStrategy, { message: 'Chiến lược cân bằng không hợp lệ' })
  balanceStrategy?: BalanceStrategy = BalanceStrategy.BALANCED;
}

export class ParticipantDto {
  @ApiProperty({ example: 'member-1' })
  id: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  name: string;

  @ApiProperty({ example: 4.5 })
  skill: number;

  @ApiProperty({ enum: Position, example: Position.MIDFIELDER })
  position: Position;
}

export class PositionStatsDto {
  @ApiProperty({ enum: Position, example: Position.MIDFIELDER })
  position: Position;

  @ApiProperty({ example: 3 })
  count: number;

  @ApiProperty({ example: 12.5 })
  totalScore: number;
}

export class TeamDto {
  @ApiProperty({ example: 'Đội 1' })
  name: string;

  @ApiProperty({ type: [ParticipantDto] })
  participants: ParticipantDto[];

  @ApiProperty({ example: 25.5 })
  totalScore: number;

  @ApiProperty({ type: [PositionStatsDto] })
  positionStats: PositionStatsDto[];
}

export class TeamDivisionSummaryDto {
  @ApiProperty({ example: 14 })
  totalParticipants: number;

  @ApiProperty({ example: 3.6 })
  averageSkill: number;

  @ApiProperty({
    example: { GOALKEEPER: 2, DEFENDER: 4, MIDFIELDER: 4, FORWARD: 4 },
    description: 'Overall position distribution',
  })
  positionDistribution: Record<Position, number>;
}

export class TeamDivisionResult {
  @ApiProperty({ type: [TeamDto] })
  teams: TeamDto[];

  @ApiProperty({ type: TeamDivisionSummaryDto })
  summary: TeamDivisionSummaryDto;
}

export class SaveFormationDto {
  @ApiProperty({ example: 'Đội hình cân bằng tuần 1' })
  @IsString()
  @IsNotEmpty({ message: 'Tên đội hình không được để trống' })
  name: string;

  @ApiProperty({ example: 'Đội hình được chia dựa trên kỹ năng và vị trí', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [TeamDto] })
  @IsArray()
  @ArrayMinSize(2, { message: 'Cần ít nhất 2 đội' })
  teams: TeamDto[];
}

export class SavedFormationDto {
  @ApiProperty({ example: 'formation-1' })
  id: string;

  @ApiProperty({ example: 'Đội hình cân bằng tuần 1' })
  name: string;

  @ApiProperty({ example: 'Đội hình được chia dựa trên kỹ năng và vị trí' })
  description?: string;

  @ApiProperty({ type: [TeamDto] })
  teams: TeamDto[];

  @ApiProperty({ example: '2024-12-20T10:00:00Z' })
  createdAt: string;
}
export class TeamDivisionSuggestionDto {
  @ApiProperty({ example: 3 })
  numberOfTeams: number;

  @ApiProperty({ example: 'Cân bằng tốt cho 3 đội, mỗi đội 3-5 người' })
  reason: string;

  @ApiProperty({ example: 4 })
  expectedTeamSize: number;
}

export class PositionAnalysisDto {
  @ApiProperty({ example: true })
  hasGoalkeeper: boolean;

  @ApiProperty({ example: 2 })
  goalkeepersPerTeam: number;

  @ApiProperty({ example: true })
  balancedPositions: boolean;
}

export class SkillAnalysisDto {
  @ApiProperty({ example: 3.8 })
  averageSkill: number;

  @ApiProperty({ example: 0.45 })
  skillVariance: number;

  @ApiProperty({ example: 'SKILL_BALANCED' })
  recommendedStrategy: string;
}

export class ParticipantWithSkillLevelDto extends ParticipantDto {
  @ApiProperty({ example: 'Giỏi' })
  skillLevel: string;
}

export class TeamDivisionSuggestionsResponseDto {
  @ApiProperty({ example: 14 })
  totalParticipants: number;

  @ApiProperty({ type: [TeamDivisionSuggestionDto] })
  suggestions: TeamDivisionSuggestionDto[];

  @ApiProperty({ type: PositionAnalysisDto })
  positionAnalysis: PositionAnalysisDto;

  @ApiProperty({ type: SkillAnalysisDto })
  skillAnalysis: SkillAnalysisDto;

  @ApiProperty({ type: [ParticipantWithSkillLevelDto] })
  participants: ParticipantWithSkillLevelDto[];
}

export class FormationAnalyticsDto {
  @ApiProperty({ example: 14 })
  totalParticipants: number;

  @ApiProperty({
    example: {
      sizeBalance: 'Tốt',
      scoreBalance: 'Tốt',
      averageTeamSize: 3.5,
      averageTeamScore: 12.8,
    },
  })
  teamBalance: any;

  @ApiProperty({
    example: {
      distribution: { GOALKEEPER: 2, DEFENDER: 4, MIDFIELDER: 4, FORWARD: 4 },
      balance: 'Cân bằng',
    },
  })
  positionDistribution: any;

  @ApiProperty({
    example: {
      averageSkill: 3.8,
      skillRange: { min: 2.5, max: 4.8 },
      variance: 0.45,
    },
  })
  skillDistribution: any;
}

export class MatchResultDto {
  @ApiProperty({ example: 'team-1' })
  teamId: string;

  @ApiProperty({ example: 3 })
  score: number;

  @ApiProperty({ example: ['goal-1', 'goal-2', 'goal-3'] })
  goals?: string[];

  @ApiProperty({ example: 85 })
  duration?: number;
}
