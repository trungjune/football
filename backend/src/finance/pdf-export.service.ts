import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as ExcelJS from 'exceljs';

@Injectable()
export class PdfExportService {
  async generateFinancialReportPdf(financialData: any): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      const htmlContent = this.generateFinancialReportHtml(financialData);

      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  async generateDebtReportPdf(debtData: any[]): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      const htmlContent = this.generateDebtReportHtml(debtData);

      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  async generateFinancialReportExcel(financialData: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Tạo worksheet tổng quan
    const summarySheet = workbook.addWorksheet('Tổng quan tài chính');

    // Header
    summarySheet.addRow(['BÁO CÁO TÀI CHÍNH FC VUI VẺ']);
    summarySheet.addRow([`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`]);
    summarySheet.addRow([]);

    // Tổng quan
    summarySheet.addRow(['TỔNG QUAN']);
    summarySheet.addRow([
      'Tổng thu dự kiến:',
      this.formatCurrency(financialData.summary.totalExpectedRevenue),
    ]);
    summarySheet.addRow([
      'Tổng thu thực tế:',
      this.formatCurrency(financialData.summary.totalActualRevenue),
    ]);
    summarySheet.addRow([
      'Tổng công nợ:',
      this.formatCurrency(financialData.summary.totalOutstanding),
    ]);
    summarySheet.addRow(['Tỷ lệ thu:', `${financialData.summary.collectionRate.toFixed(1)}%`]);
    summarySheet.addRow([]);

    // Phân tích theo loại phí
    summarySheet.addRow(['PHÂN TÍCH THEO LOẠI PHÍ']);
    summarySheet.addRow(['Loại phí', 'Số lượng', 'Dự kiến', 'Thực tế']);

    Object.entries(financialData.feeTypeBreakdown).forEach(([type, data]: [string, any]) => {
      summarySheet.addRow([
        this.translateFeeType(type),
        data.count,
        this.formatCurrency(data.expectedAmount),
        this.formatCurrency(data.actualAmount),
      ]);
    });

    summarySheet.addRow([]);

    // Phân tích theo phương thức thanh toán
    summarySheet.addRow(['PHÂN TÍCH THEO PHƯƠNG THỨC THANH TOÁN']);
    summarySheet.addRow(['Phương thức', 'Số lượng', 'Tổng tiền']);

    Object.entries(financialData.paymentMethodBreakdown).forEach(
      ([method, data]: [string, any]) => {
        summarySheet.addRow([
          this.translatePaymentMethod(method),
          data.count,
          this.formatCurrency(data.amount),
        ]);
      },
    );

    // Style the worksheet
    this.styleExcelWorksheet(summarySheet);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private generateFinancialReportHtml(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Báo cáo tài chính FC Vui Vẻ</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .summary {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .summary-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
          }
          .summary-card h3 {
            margin: 0 0 10px 0;
            color: #2563eb;
          }
          .summary-card .amount {
            font-size: 20px;
            font-weight: bold;
            color: #059669;
          }
          .breakdown {
            margin-bottom: 30px;
          }
          .breakdown h3 {
            color: #2563eb;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          th {
            background-color: #f1f5f9;
            font-weight: bold;
            color: #374151;
          }
          .text-right {
            text-align: right;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BÁO CÁO TÀI CHÍNH</h1>
          <p><strong>FC VUI VẺ - ĐỘI BÓNG SÂN 7</strong></p>
          <p>Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}</p>
        </div>

        <div class="summary">
          <div class="summary-card">
            <h3>Tổng thu dự kiến</h3>
            <div class="amount">${this.formatCurrency(data.summary.totalExpectedRevenue)}</div>
          </div>
          <div class="summary-card">
            <h3>Tổng thu thực tế</h3>
            <div class="amount">${this.formatCurrency(data.summary.totalActualRevenue)}</div>
          </div>
          <div class="summary-card">
            <h3>Tổng công nợ</h3>
            <div class="amount">${this.formatCurrency(data.summary.totalOutstanding)}</div>
          </div>
          <div class="summary-card">
            <h3>Tỷ lệ thu</h3>
            <div class="amount">${data.summary.collectionRate.toFixed(1)}%</div>
          </div>
        </div>

        <div class="breakdown">
          <h3>Phân tích theo loại phí</h3>
          <table>
            <thead>
              <tr>
                <th>Loại phí</th>
                <th>Số lượng</th>
                <th class="text-right">Dự kiến</th>
                <th class="text-right">Thực tế</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(data.feeTypeBreakdown)
                .map(
                  ([type, breakdown]: [string, any]) => `
                <tr>
                  <td>${this.translateFeeType(type)}</td>
                  <td>${breakdown.count}</td>
                  <td class="text-right">${this.formatCurrency(breakdown.expectedAmount)}</td>
                  <td class="text-right">${this.formatCurrency(breakdown.actualAmount)}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <div class="breakdown">
          <h3>Phân tích theo phương thức thanh toán</h3>
          <table>
            <thead>
              <tr>
                <th>Phương thức</th>
                <th>Số lượng</th>
                <th class="text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(data.paymentMethodBreakdown)
                .map(
                  ([method, breakdown]: [string, any]) => `
                <tr>
                  <td>${this.translatePaymentMethod(method)}</td>
                  <td>${breakdown.count}</td>
                  <td class="text-right">${this.formatCurrency(breakdown.amount)}</td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Báo cáo được tạo tự động bởi hệ thống quản lý FC Vui Vẻ</p>
          <p>Liên hệ: Thu quỹ Vũ Minh Hoàng - STK: 3863128848 - Techcombank</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateDebtReportHtml(debtData: any[]): string {
    const totalDebt = debtData.reduce((sum, item) => sum + item.totalDebt, 0);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Báo cáo công nợ FC Vui Vẻ</title>
        <style>
          body {
            font-family: 'Times New Roman', serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #dc2626;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #dc2626;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .summary {
            background: #fef2f2;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #dc2626;
            margin-bottom: 30px;
          }
          .summary h3 {
            margin: 0 0 10px 0;
            color: #dc2626;
          }
          .summary .amount {
            font-size: 20px;
            font-weight: bold;
            color: #dc2626;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          th {
            background-color: #f1f5f9;
            font-weight: bold;
            color: #374151;
          }
          .text-right {
            text-align: right;
          }
          .debt-high {
            background-color: #fef2f2;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BÁO CÁO CÔNG NỢ</h1>
          <p><strong>FC VUI VẺ - ĐỘI BÓNG SÂN 7</strong></p>
          <p>Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}</p>
        </div>

        <div class="summary">
          <h3>Tổng công nợ</h3>
          <div class="amount">${this.formatCurrency(totalDebt)}</div>
          <p>Số thành viên có nợ: ${debtData.length}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Thành viên</th>
              <th>Email</th>
              <th class="text-right">Tổng nợ</th>
              <th>Số khoản chưa đóng</th>
            </tr>
          </thead>
          <tbody>
            ${debtData
              .map(
                item => `
              <tr class="${item.totalDebt > 500000 ? 'debt-high' : ''}">
                <td>${item.member.fullName}</td>
                <td>${item.member.email}</td>
                <td class="text-right">${this.formatCurrency(item.totalDebt)}</td>
                <td>${item.unpaidFees.length}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Báo cáo được tạo tự động bởi hệ thống quản lý FC Vui Vẻ</p>
          <p>Liên hệ: Thu quỹ Vũ Minh Hoàng - STK: 3863128848 - Techcombank</p>
          <p>Thời gian đóng: ngày 5-15 hàng tháng</p>
        </div>
      </body>
      </html>
    `;
  }

  private styleExcelWorksheet(worksheet: ExcelJS.Worksheet) {
    // Style header
    worksheet.getRow(1).font = { bold: true, size: 16 };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 20;
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  private translateFeeType(type: string): string {
    const translations = {
      MONTHLY: 'Phí hàng tháng',
      PER_SESSION: 'Phí theo buổi',
      SPECIAL: 'Phí đặc biệt',
    };
    return translations[type] || type;
  }

  private translatePaymentMethod(method: string): string {
    const translations = {
      CASH: 'Tiền mặt',
      BANK_TRANSFER: 'Chuyển khoản',
    };
    return translations[method] || method;
  }
}
