import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { API_ENDPOINTS } from '@shared/constants/api';
import { ROUTES } from '@shared/constants/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Các route công khai không cần xác thực
  const publicRoutes = [
    ROUTES.HOME,
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.AUTH_SIGNUP,
    ROUTES.AUTH_ERROR,
    ROUTES.OFFLINE,
  ];

  // Các route API công khai
  const publicApiRoutes = [
    API_ENDPOINTS.AUTH.LOGIN,
    API_ENDPOINTS.AUTH.REGISTER,
    API_ENDPOINTS.HEALTH,
  ];

  // Kiểm tra nếu là route công khai
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // Skip middleware cho API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Kiểm tra token từ cookie (set bởi AuthContext)
  const token = request.cookies.get('token')?.value;

  // Nếu không có token và đang truy cập route bảo vệ
  if (!token) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
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
