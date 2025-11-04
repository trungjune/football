// LocalStorage and SessionStorage keys
export const STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',

  // User preferences
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',

  // App state
  LAST_VISITED_PAGE: 'last_visited_page',
  SEARCH_HISTORY: 'search_history',
  FILTER_PREFERENCES: 'filter_preferences',

  // Form data
  DRAFT_SESSION: 'draft_session',
  DRAFT_MEMBER: 'draft_member',
  DRAFT_FEE: 'draft_fee',

  // Cache
  MEMBERS_CACHE: 'members_cache',
  SESSIONS_CACHE: 'sessions_cache',
  STATS_CACHE: 'stats_cache',

  // PWA
  PWA_INSTALL_PROMPT: 'pwa_install_prompt',
  OFFLINE_QUEUE: 'offline_queue',
} as const;

export const COOKIE_NAMES = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;
