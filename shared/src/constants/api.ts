// API-related constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
    CHANGE_PASSWORD: '/api/auth/change-password',
  },
  MEMBERS: {
    LIST: '/api/members',
    CREATE: '/api/members',
    BY_ID: (id: string) => `/api/members/${id}`,
    UPDATE: (id: string) => `/api/members/${id}`,
    DELETE: (id: string) => `/api/members/${id}`,
    PROFILE: (id: string) => `/api/members/profile/${id}`,
  },
  SESSIONS: {
    LIST: '/api/sessions',
    CREATE: '/api/sessions',
    BY_ID: (id: string) => `/api/sessions/${id}`,
    UPDATE: (id: string) => `/api/sessions/${id}`,
    DELETE: (id: string) => `/api/sessions/${id}`,
    REGISTER: (id: string) => `/api/sessions/${id}/register`,
    CANCEL_REGISTRATION: (id: string) => `/api/sessions/${id}/register`,
  },
  FINANCE: {
    FEES: {
      LIST: '/api/finance/fees',
      CREATE: '/api/finance/fees',
      BY_ID: (id: string) => `/api/finance/fees/${id}`,
      UPDATE: (id: string) => `/api/finance/fees/${id}`,
      DELETE: (id: string) => `/api/finance/fees/${id}`,
    },
    PAYMENTS: {
      LIST: '/api/finance/payments',
      CREATE: '/api/finance/payments',
      BY_ID: (id: string) => `/api/finance/payments/${id}`,
      BY_MEMBER: (memberId: string) => `/api/finance/payments/member/${memberId}`,
    },
    REPORTS: {
      SUMMARY: '/api/finance/reports/summary',
      EXPORT: '/api/finance/reports/export',
      DEBT: '/api/finance/reports/debt',
    },
  },
  DASHBOARD: {
    STATS: '/api/dashboard/stats',
  },
  HEALTH: '/api/health',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_FULL: 'SESSION_FULL',
  REGISTRATION_CLOSED: 'REGISTRATION_CLOSED',
  ALREADY_REGISTERED: 'ALREADY_REGISTERED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
} as const;
