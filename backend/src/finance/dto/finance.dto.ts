import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Min,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
// Finance enums replaced with string literals

export class CreateFeeDto {
  @ApiProperty({ example: 'Phí tháng 12/2024' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @ApiProperty({ example: 'Phí thành viên tháng 12', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 200000 })
  @IsNumber({}, { message: 'Số tiền phải là số' })
  @Min(0, { message: 'Số tiền phải lớn hơn hoặc bằng 0' })
  amount: number;

  @ApiProperty({ enum: ['MONTHLY', 'SPECIAL'], example: 'MONTHLY' })
  @IsEnum(['MONTHLY', 'SPECIAL'], { message: 'Loại phí không hợp lệ' })
  type: 'MONTHLY' | 'SPECIAL';

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Hạn thanh toán không hợp lệ' })
  dueDate?: string;
}

export class UpdateFeeDto extends PartialType(CreateFeeDto) {}

export class CreatePaymentDto {
  @ApiProperty({ example: 'fee-uuid' })
  @IsString()
  @IsUUID('4', { message: 'ID khoản phí không hợp lệ' })
  feeId: string;

  @ApiProperty({ example: 'member-uuid' })
  @IsString()
  @IsUUID('4', { message: 'ID thành viên không hợp lệ' })
  memberId: string;

  @ApiProperty({ example: 200000 })
  @IsNumber({}, { message: 'Số tiền phải là số' })
  @Min(0, { message: 'Số tiền phải lớn hơn 0' })
  amount: number;

  @ApiProperty({ enum: ['CASH', 'BANK_TRANSFER'], example: 'CASH' })
  @IsEnum(['CASH', 'BANK_TRANSFER'], { message: 'Phương thức thanh toán không hợp lệ' })
  method: 'CASH' | 'BANK_TRANSFER';
}

export class FinanceSearchDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: ['MONTHLY', 'SPECIAL'], required: false })
  @IsOptional()
  @IsEnum(['MONTHLY', 'SPECIAL'])
  type?: 'MONTHLY' | 'SPECIAL';

  @ApiProperty({ enum: ['PENDING', 'COMPLETED', 'FAILED'], required: false })
  @IsOptional()
  @IsEnum(['PENDING', 'COMPLETED', 'FAILED'])
  status?: 'PENDING' | 'COMPLETED' | 'FAILED';

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
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ example: 'createdAt', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({ enum: ['asc', 'desc'], example: 'desc', required: false })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class FeeStatsDto {
  @ApiProperty({ example: 10 })
  totalPayments: number;

  @ApiProperty({ example: 8 })
  completedPayments: number;

  @ApiProperty({ example: 2 })
  pendingPayments: number;

  @ApiProperty({ example: 1600000 })
  totalAmount: number;

  @ApiProperty({ example: 80 })
  completionRate: number;
}

export class FinancialSummaryDto {
  @ApiProperty({ example: 2000000 })
  totalExpectedRevenue: number;

  @ApiProperty({ example: 1600000 })
  totalActualRevenue: number;

  @ApiProperty({ example: 400000 })
  totalOutstanding: number;

  @ApiProperty({ example: 80 })
  collectionRate: number;
}

export class DebtItemDto {
  @ApiProperty({ example: 'fee-uuid' })
  id: string;

  @ApiProperty({ example: 'Phí tháng 12/2024' })
  title: string;

  @ApiProperty({ example: 200000 })
  amount: number;

  @ApiProperty({ example: '2024-12-31T23:59:59Z' })
  dueDate?: string;

  @ApiProperty({ enum: ['MONTHLY', 'SPECIAL'], example: 'MONTHLY' })
  type: 'MONTHLY' | 'SPECIAL';
}

export class DebtListItemDto {
  @ApiProperty({
    example: {
      id: 'member-uuid',
      fullName: 'Nguyễn Văn A',
      email: 'member@example.com',
    },
  })
  member: {
    id: string;
    fullName: string;
    email: string;
  };

  @ApiProperty({ example: 400000 })
  totalDebt: number;

  @ApiProperty({ type: [DebtItemDto] })
  unpaidFees: DebtItemDto[];
}

export class CreateMonthlyFeeDto {
  @ApiProperty({ example: 'Phí tháng 12/2024' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @ApiProperty({ example: 'Phí thành viên tháng 12/2024' })
  @IsString()
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  description: string;

  @ApiProperty({ example: 12 })
  @IsNumber({}, { message: 'Tháng phải là số' })
  @Min(1, { message: 'Tháng phải từ 1-12' })
  @Type(() => Number)
  month: number;

  @ApiProperty({ example: 2024 })
  @IsNumber({}, { message: 'Năm phải là số' })
  @Min(2020, { message: 'Năm không hợp lệ' })
  @Type(() => Number)
  year: number;
}

export class ImportPaymentsDto {
  @ApiProperty({
    example: [
      {
        name: 'Nguyễn Văn A',
        month_1: 200000,
        month_2: 200000,
        month_3: 0,
      },
    ],
  })
  csvData: any[];
}
