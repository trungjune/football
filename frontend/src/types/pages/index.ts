// Page-specific types
export interface PageProps {
  params: Record<string, string>;
  searchParams: Record<string, string | string[] | undefined>;
}

export interface DashboardPageData {
  stats: {
    totalMembers: number;
    activeSessions: number;
    totalRevenue: number;
    pendingPayments: number;
  };
  recentSessions: Record<string, unknown>[];
  recentPayments: Record<string, unknown>[];
}

export interface MembersPageData {
  members: Record<string, unknown>[];
  totalCount: number;
  filters: {
    search: string;
    position: string;
    status: string;
  };
}

export interface SessionsPageData {
  sessions: Record<string, unknown>[];
  totalCount: number;
  filters: {
    search: string;
    type: string;
    status: string;
    dateFrom: string;
    dateTo: string;
  };
}

export interface FinancePageData {
  fees: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    pendingAmount: number;
  };
  filters: {
    search: string;
    type: string;
    dateFrom: string;
    dateTo: string;
  };
}

export interface MemberProfileData {
  member: Record<string, unknown>;
  sessions: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  stats: {
    totalSessions: number;
    totalPayments: number;
    attendanceRate: number;
  };
}
