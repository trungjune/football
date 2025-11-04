// Fee and Payment entity types
export interface Fee {
  id: string;
  title: string;
  description?: string;
  amount: number;
  type: FeeType;
  dueDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  payments?: Payment[];
}

export enum FeeType {
  MONTHLY = 'MONTHLY',
  SESSION = 'SESSION',
  EQUIPMENT = 'EQUIPMENT',
  TOURNAMENT = 'TOURNAMENT',
  OTHER = 'OTHER',
}

export interface Payment {
  id: string;
  feeId: string;
  memberId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: Date;
  note?: string;
  fee?: Fee;
  member?: Member;
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOMO = 'MOMO',
  ZALO_PAY = 'ZALO_PAY',
  OTHER = 'OTHER',
}

// Import Member type
import type { Member } from './member';
