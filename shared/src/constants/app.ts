// Application-wide constants
export const APP_CONFIG = {
  NAME: 'Football Team Manager',
  SHORT_NAME: 'FC Manager',
  DESCRIPTION: 'Quản lý đội bóng FC Vui Vẻ',
  VERSION: '1.0.0',
  TEAM_NAME: 'FC VUI VẺ',
  MAX_PLAYERS_PER_SESSION: 14,
  DEFAULT_SESSION_COST: 50000, // VND
  DEFAULT_SKILL_LEVEL: 5,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const DATE_FORMATS = {
  DATE_ONLY: 'dd/MM/yyyy',
  DATE_TIME: 'dd/MM/yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
  FULL_DATE: 'EEEE, dd/MM/yyyy',
} as const;

export const CURRENCY = {
  CODE: 'VND',
  SYMBOL: '₫',
  LOCALE: 'vi-VN',
} as const;

export const WEBSOCKET_EVENTS = {
  SESSION_UPDATED: 'session:updated',
  MEMBER_REGISTERED: 'member:registered',
  MEMBER_CANCELLED: 'member:cancelled',
  PAYMENT_RECEIVED: 'payment:received',
  NOTIFICATION: 'notification',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;
