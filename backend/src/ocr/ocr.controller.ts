import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { OcrService } from './ocr.service';
import { ProcessImageResponseDto, BatchSaveMappingsDto } from './dto/ocr.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('OCR')
@Controller('ocr')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @ApiOperation({ summary: 'Upload ảnh điểm danh Zalo và nhận dạng tên' })
  @ApiResponse({ status: 200, description: 'Xử lý ảnh thành công', type: ProcessImageResponseDto })
  @ApiResponse({ status: 400, description: 'File không hợp lệ' })
  @ApiConsumes('multipart/form-data')
  @Post('process-image')
  @UseInterceptors(FileInterceptor('image'))
  async processImage(@UploadedFile() file: Express.Multer.File): Promise<ProcessImageResponseDto> {
    if (!file) {
      throw new BadRequestException('Vui lòng upload ảnh');
    }

    // Kiểm tra file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP)');
    }

    // Kiểm tra file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('Kích thước ảnh không được vượt quá 10MB');
    }

    // Xử lý OCR
    const ocrResults = await this.ocrService.processImage(file.buffer);
    const ocrNames = ocrResults.map(r => r.text);

    // Match với members
    const matchedMembers = await this.ocrService.matchMembers(ocrNames);

    // Tìm các tên không match được
    const matchedOcrNames = new Set(matchedMembers.map(m => m.ocrName));
    const unmatchedNames = ocrNames.filter(name => !matchedOcrNames.has(name));

    return {
      ocrNames,
      matchedMembers,
      unmatchedNames,
    };
  }

  @ApiOperation({ summary: 'Lưu name mappings để cải thiện độ chính xác' })
  @ApiResponse({ status: 200, description: 'Lưu mappings thành công' })
  @Post('save-mappings')
  async saveMappings(@Body() dto: BatchSaveMappingsDto) {
    for (const mapping of dto.mappings) {
      await this.ocrService.saveNameMapping(mapping.ocrName, mapping.memberId, mapping.confidence);
    }

    return {
      success: true,
      message: 'Đã lưu name mappings thành công',
    };
  }
}
