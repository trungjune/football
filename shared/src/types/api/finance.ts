// Finance API types
import type { Fee, Payment, FeeType, PaymentMethod } from '../entities/fee';
import type { PaginationParams } from './common';

export interface CreateFeeRequest {
  title: string;
  description?: string;
  amount: number;
  type: FeeType;
  dueDate?: Date;
}

export interface UpdateFeeRequest extends Partial<CreateFeeRequest> {
  isActive?: boolean;
}

export interface FeeSearchParams extends PaginationParams {
  type?: FeeType;
  isActive?: boolean;
  dueDateFrom?: Date;
  dueDateTo?: Date;
}

export interface CreatePaymentRequest {
  feeId: string;
  memberId: string;
  amount: number;
  method: PaymentMethod;
  note?: string;
}

export interface PaymentSearchParams extends PaginationParams {
  feeId?: string;
  memberId?: string;
  method?: PaymentMethod;
  paidDateFrom?: Date;
  paidDateTo?: Date;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  pendingPayments: number;
  totalMembers: number;
  activeFees: number;
}
