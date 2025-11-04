import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { API_ENDPOINTS } from '@shared/constants/api';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Các route công khai không cần xác thực
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/auth/signup',
    '/auth/error',
    '/offline',
    '/test-dashboard',
  ];

  // Các route API công khai
  const publicApiRoutes = [
    API_ENDPOINTS.AUTH.LOGIN,
    API_ENDPOINTS.AUTH.REGISTER,
    API_ENDPOINTS.HEALTH,
  ];

  // Kiểm tra nếu là route công khai
  if (
    publicRoutes.includes(pathname) ||
    publicApiRoutes.some(route => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // Kiểm tra token từ cookie
  const token = request.cookies.get('token')?.value;

  // Skip middleware cho NextAuth routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Nếu không có token và đang truy cập route bảo vệ
  if (!token && !pathname.startsWith('/api/')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cho phép tiếp tục
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|manifest.json|icons).*)',
  ],
};
