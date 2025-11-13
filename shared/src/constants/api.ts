// API-related constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  MEMBERS: {
    LIST: '/members',
    CREATE: '/members',
    BY_ID: (id: string) => `/members/${id}`,
    UPDATE: (id: string) => `/members/${id}`,
    DELETE: (id: string) => `/members/${id}`,
    PROFILE: (id: string) => `/members/profile/${id}`,
  },
  SESSIONS: {
    LIST: '/sessions',
    CREATE: '/sessions',
    BY_ID: (id: string) => `/sessions/${id}`,
    UPDATE: (id: string) => `/sessions/${id}`,
    DELETE: (id: string) => `/sessions/${id}`,
    REGISTER: (id: string) => `/sessions/${id}/register`,
    CANCEL_REGISTRATION: (id: string) => `/sessions/${id}/register`,
  },
  FINANCE: {
    FEES: {
      LIST: '/finance/fees',
      CREATE: '/finance/fees',
      BY_ID: (id: string) => `/finance/fees/${id}`,
      UPDATE: (id: string) => `/finance/fees/${id}`,
      DELETE: (id: string) => `/finance/fees/${id}`,
    },
    PAYMENTS: {
      LIST: '/finance/payments',
      CREATE: '/finance/payments',
      BY_ID: (id: string) => `/finance/payments/${id}`,
      BY_MEMBER: (memberId: string) => `/finance/payments/member/${memberId}`,
    },
    REPORTS: {
      SUMMARY: '/finance/reports/summary',
      EXPORT: '/finance/reports/export',
      DEBT: '/finance/reports/debt',
    },
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
  },
  HEALTH: '/health',
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
