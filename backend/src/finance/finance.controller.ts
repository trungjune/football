import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateFeeDto, UpdateFeeDto, CreatePaymentDto, FinanceSearchDto } from './dto/finance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole as Role } from '../shared-types';

@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Fee Management
  @ApiOperation({ summary: 'Create a new fee' })
  @ApiResponse({ status: 201, description: 'Fee created successfully' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('fees')
  createFee(@Body() createFeeDto: CreateFeeDto) {
    // Use FC Vui Vẻ team ID from seed data
    const teamId = 'fc-vui-ve';
    return this.financeService.createFee(createFeeDto, teamId);
  }

  @ApiOperation({ summary: 'Get all fees' })
  @ApiResponse({ status: 200, description: 'Fees retrieved successfully' })
  @Get('fees')
  findAllFees(@Query() searchDto: FinanceSearchDto) {
    // Use FC Vui Vẻ team ID from seed data
    const teamId = 'fc-vui-ve';
    return this.financeService.findAllFees(searchDto, teamId);
  }

  @ApiOperation({ summary: 'Get a fee by ID' })
  @ApiResponse({ status: 200, description: 'Fee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Fee not found' })
  @Get('fees/:id')
  findOneFee(@Param('id') id: string) {
    return this.financeService.findOneFee(id);
  }

  @ApiOperation({ summary: 'Update a fee' })
  @ApiResponse({ status: 200, description: 'Fee updated successfully' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('fees/:id')
  updateFee(@Param('id') id: string, @Body() updateFeeDto: UpdateFeeDto) {
    return this.financeService.updateFee(id, updateFeeDto);
  }

  @ApiOperation({ summary: 'Delete a fee' })
  @ApiResponse({ status: 200, description: 'Fee deleted successfully' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('fees/:id')
  removeFee(@Param('id') id: string) {
    return this.financeService.removeFee(id);
  }

  // Payment Management
  @ApiOperation({ summary: 'Record a payment' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('payments')
  createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.financeService.createPayment(createPaymentDto);
  }

  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  @Get('payments')
  findAllPayments(@Query() searchDto: FinanceSearchDto) {
    // Use FC Vui Vẻ team ID from seed data
    const teamId = 'fc-vui-ve';
    return this.financeService.findAllPayments(searchDto, teamId);
  }

  @ApiOperation({ summary: 'Update payment status' })
  @ApiResponse({ status: 200, description: 'Payment status updated successfully' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('payments/:id/status')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body('status') status: 'PENDING' | 'COMPLETED' | 'FAILED',
  ) {
    return this.financeService.updatePaymentStatus(id, status);
  }

  // Financial Reports
  @ApiOperation({ summary: 'Get financial summary' })
  @ApiResponse({ status: 200, description: 'Financial summary retrieved successfully' })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @Get('summary')
  getFinancialSummary(@Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string) {
    // Use FC Vui Vẻ team ID from seed data
    const teamId = 'fc-vui-ve';
    return this.financeService.getFinancialSummary(teamId, dateFrom, dateTo);
  }

  @ApiOperation({ summary: 'Get debt list' })
  @ApiResponse({ status: 200, description: 'Debt list retrieved successfully' })
  @Get('debts')
  getDebtList() {
    // Use FC Vui Vẻ team ID from seed data
    const teamId = 'fc-vui-ve';
    return this.financeService.getDebtList(teamId);
  }

  // Export endpoints
  @ApiOperation({ summary: 'Export financial report as PDF' })
  @ApiResponse({ status: 200, description: 'PDF report generated successfully' })
  @Header('Content-Type', 'application/pdf')
  @Get('reports/export/pdf')
  async exportFinancialReportPdf(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Res() res?: Response,
  ) {
    const teamId = 'fc-vui-ve';
    const pdfBuffer = await this.financeService.exportFinancialReportPdf(teamId, dateFrom, dateTo);

    const filename = `bao-cao-tai-chinh-${new Date().toISOString().split('T')[0]}.pdf`;
    res.set({
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @ApiOperation({ summary: 'Export financial report as Excel' })
  @ApiResponse({ status: 200, description: 'Excel report generated successfully' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Get('reports/export/excel')
  async exportFinancialReportExcel(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Res() res?: Response,
  ) {
    const teamId = 'fc-vui-ve';
    const excelBuffer = await this.financeService.exportFinancialReportExcel(
      teamId,
      dateFrom,
      dateTo,
    );

    const filename = `bao-cao-tai-chinh-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.set({
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': excelBuffer.length,
    });

    res.end(excelBuffer);
  }

  @ApiOperation({ summary: 'Export debt report as PDF' })
  @ApiResponse({ status: 200, description: 'Debt PDF report generated successfully' })
  @Header('Content-Type', 'application/pdf')
  @Get('debts/export/pdf')
  async exportDebtReportPdf(@Res() res?: Response) {
    const teamId = 'fc-vui-ve';
    const pdfBuffer = await this.financeService.exportDebtReportPdf(teamId);

    const filename = `bao-cao-cong-no-${new Date().toISOString().split('T')[0]}.pdf`;
    res.set({
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
