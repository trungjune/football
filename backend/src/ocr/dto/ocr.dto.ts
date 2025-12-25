import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProcessImageResponseDto {
  @ApiProperty({ description: 'Danh sách tên được nhận dạng từ OCR' })
  ocrNames: string[];

  @ApiProperty({ description: 'Danh sách members được match' })
  matchedMembers: MatchedMemberDto[];

  @ApiProperty({ description: 'Danh sách tên không match được' })
  unmatchedNames: string[];
}

export class MatchedMemberDto {
  @ApiProperty()
  memberId: string;

  @ApiProperty()
  memberName: string;

  @ApiProperty()
  ocrName: string;

  @ApiProperty()
  confidence: number;

  @ApiProperty()
  matchScore: number;

  @ApiProperty()
  position: string;

  @ApiProperty()
  skillLevel: number;
}

export class SaveMappingDto {
  @ApiProperty({ description: 'Tên từ OCR' })
  @IsString()
  ocrName: string;

  @ApiProperty({ description: 'ID của member' })
  @IsString()
  memberId: string;

  @ApiProperty({ description: 'Độ tin cậy (0-1)' })
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;
}

export class BatchSaveMappingsDto {
  @ApiProperty({ type: [SaveMappingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveMappingDto)
  mappings: SaveMappingDto[];
}
