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
  recentSessions: any[];
  recentPayments: any[];
}

export interface MembersPageData {
  members: any[];
  totalCount: number;
  filters: {
    search: string;
    position: string;
    status: string;
  };
}

export interface SessionsPageData {
  sessions: any[];
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
  fees: any[];
  payments: any[];
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
  member: any;
  sessions: any[];
  payments: any[];
  stats: {
    totalSessions: number;
    totalPayments: number;
    attendanceRate: number;
  };
}
