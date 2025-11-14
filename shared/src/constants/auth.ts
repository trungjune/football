// Authentication related constants
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  GUEST: 'GUEST'
} as const;

export const USER_IDS = {
  ADMIN_USER: '1',
  DEFAULT_MEMBER: '2'
} as const;

export const DEFAULT_CREDENTIALS = {
  ADMIN: {
    EMAIL: 'admin@football.com',
    PASSWORD: 'admin123',
    ROLE: USER_ROLES.ADMIN,
    ID: USER_IDS.ADMIN_USER
  },
  MEMBER: {
    EMAIL: 'nguyen.huu.phuc.fcvuive@gmail.com', 
    PASSWORD: 'admin123',
    ROLE: USER_ROLES.MEMBER,
    ID: USER_IDS.DEFAULT_MEMBER
  }
} as const;

export const TOKEN_CONFIG = {
  EXPIRY_DAYS: 7,
  SECONDS_PER_DAY: 24 * 60 * 60
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500
} as const;

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS'
} as const;

export const API_PATHS = {
  AUTH_LOGIN: 'auth/login',
  AUTH_REGISTER: 'auth/register',
  MEMBERS: 'members',
  SESSIONS: 'sessions',
  DASHBOARD_STATS: 'dashboard/stats',
  FINANCE_FEES: 'finance/fees'
} as const;

export const MEMBER_NAMES = {
  DEFAULT_MEMBER_FULL_NAME: 'Nguyễn Hữu Phúc'
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  AUTH_SIGNUP: '/auth/signup',
  AUTH_ERROR: '/auth/error',
  OFFLINE: '/offline'
} as const;
