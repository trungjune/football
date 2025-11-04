// Route constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  MEMBERS: '/members',
  MEMBER_PROFILE: (id: string) => `/member/${id}`,
  SESSIONS: '/sessions',
  SESSION_DETAIL: (id: string) => `/sessions/${id}`,
  FINANCE: '/finance',
  TEAM_DIVISION: '/team-division',
  OFFLINE: '/offline',
  AUTH: {
    SIGNUP: '/auth/signup',
    ERROR: '/auth/error',
  },
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.AUTH.SIGNUP,
  ROUTES.AUTH.ERROR,
  ROUTES.OFFLINE,
] as const;

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.MEMBERS,
  ROUTES.SESSIONS,
  ROUTES.FINANCE,
  ROUTES.TEAM_DIVISION,
] as const;
