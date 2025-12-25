import { Injectable, Logger } from '@nestjs/common';
import { createWorker, Worker } from 'tesseract.js';
import * as fuzzball from 'fuzzball';
import { PrismaService } from '../prisma/prisma.service';
import * as sharp from 'sharp';

interface OCRResult {
  text: string;
  confidence: number;
}

interface MatchedMember {
  memberId: string;
  memberName: string;
  ocrName: string;
  confidence: number;
  matchScore: number;
  position: string;
  skillLevel: number;
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private worker: Worker | null = null;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Khởi tạo Tesseract worker
    try {
      this.worker = await createWorker('vie+eng');
      this.logger.log('Tesseract worker initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Tesseract worker', error);
    }
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.terminate();
    }
  }

  /**
   * Xử lý ảnh và trích xuất text bằng OCR
   */
  async processImage(imageBuffer: Buffer): Promise<OCRResult[]> {
    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      // Tiền xử lý ảnh để tăng độ chính xác OCR
      const processedImage = await sharp(imageBuffer)
        .greyscale()
        .normalize()
        .sharpen()
        .toBuffer();

      // Chạy OCR
      const {
        data: { text, confidence },
      } = await this.worker.recognize(processedImage);

      // Parse text thành danh sách tên
      const names = this.parseNames(text);

      return names.map(name => ({
        text: name,
        confidence: confidence / 100, // Convert to 0-1
      }));
    } catch (error) {
      this.logger.error('OCR processing failed', error);
      throw new Error('Không thể xử lý ảnh. Vui lòng thử lại.');
    }
  }

  /**
   * Parse text từ OCR thành danh sách tên
   */
  private parseNames(text: string): string[] {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const names: string[] = [];

    for (const line of lines) {
      // Loại bỏ số thứ tự ở đầu (1., 2., etc.)
      let cleanedLine = line.replace(/^\d+[\.\)]\s*/, '');

      // Loại bỏ các ký tự đặc biệt không cần thiết
      cleanedLine = cleanedLine.replace(/[^\p{L}\s]/gu, '').trim();

      // Chỉ giữ lại nếu có ít nhất 2 ký tự
      if (cleanedLine.length >= 2) {
        names.push(cleanedLine);
      }
    }

    return names;
  }

  /**
   * Match tên từ OCR với members trong database
   */
  async matchMembers(ocrNames: string[]): Promise<MatchedMember[]> {
    // Lấy tất cả active members
    const members = await this.prisma.member.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        fullName: true,
        nickname: true,
        position: true,
        memberType: true,
      },
    });

    // Lấy name mappings đã lưu
    const nameMappings = await this.prisma.nameMapping.findMany({
      include: {
        member: {
          select: {
            id: true,
            fullName: true,
            position: true,
            memberType: true,
          },
        },
      },
    });

    const matchedMembers: MatchedMember[] = [];

    for (const ocrName of ocrNames) {
      // Kiểm tra xem có mapping đã lưu không
      const existingMapping = nameMappings.find(
        mapping => this.normalizeString(mapping.ocrName) === this.normalizeString(ocrName),
      );

      if (existingMapping) {
        // Sử dụng mapping đã lưu
        matchedMembers.push({
          memberId: existingMapping.member.id,
          memberName: existingMapping.member.fullName,
          ocrName,
          confidence: existingMapping.confidence,
          matchScore: 100, // Perfect match từ mapping
          position: existingMapping.member.position,
          skillLevel: this.calculateSkillLevel(existingMapping.member),
        });
        continue;
      }

      // Fuzzy matching với members
      let bestMatch: MatchedMember | null = null;
      let bestScore = 0;

      for (const member of members) {
        // So sánh với fullName
        const fullNameScore = fuzzball.token_sort_ratio(
          this.normalizeString(ocrName),
          this.normalizeString(member.fullName),
        );

        // So sánh với nickname nếu có
        const nicknameScore = member.nickname
          ? fuzzball.token_sort_ratio(
              this.normalizeString(ocrName),
              this.normalizeString(member.nickname),
            )
          : 0;

        // Lấy score cao nhất
        const score = Math.max(fullNameScore, nicknameScore);

        if (score > bestScore && score >= 60) {
          // Ngưỡng tối thiểu 60%
          bestScore = score;
          bestMatch = {
            memberId: member.id,
            memberName: member.fullName,
            ocrName,
            confidence: 0.7, // Confidence mặc định cho fuzzy match
            matchScore: score,
            position: member.position,
            skillLevel: this.calculateSkillLevel(member),
          };
        }
      }

      if (bestMatch) {
        matchedMembers.push(bestMatch);
      }
    }

    return matchedMembers;
  }

  /**
   * Lưu name mapping để cải thiện độ chính xác cho lần sau
   */
  async saveNameMapping(ocrName: string, memberId: string, confidence: number): Promise<void> {
    await this.prisma.nameMapping.upsert({
      where: {
        ocrName_memberId: {
          ocrName,
          memberId,
        },
      },
      create: {
        ocrName,
        memberId,
        confidence,
      },
      update: {
        confidence,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Normalize string để so sánh tốt hơn
   */
  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu tiếng Việt
      .replace(/đ/g, 'd')
      .replace(/[^\w\s]/g, '')
      .trim();
  }

  /**
   * Tính skill level dựa trên member type và position
   */
  private calculateSkillLevel(member: { memberType: string; position: string }): number {
    let baseSkill = 3;

    if (member.memberType === 'OFFICIAL') baseSkill += 0.5;
    if (member.memberType === 'TRIAL') baseSkill -= 0.5;
    if (member.position === 'GOALKEEPER') baseSkill += 0.3;

    return Math.max(1, Math.min(5, Math.round(baseSkill * 10) / 10));
  }
}
