'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLogin } from '@/hooks/use-auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLogin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('LoginPage: Form submitted with:', { email, password });
    console.log('LoginPage: loginMutation status:', loginMutation.status);
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">⚽ FC Manager</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Đăng nhập vào hệ thống quản lý đội bóng
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {loginMutation.error && (
            <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {(loginMutation.error as any)?.response?.data?.message || 'Đăng nhập thất bại'}
            </div>
          )}

          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Email"
                disabled={loginMutation.isPending}
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Mật khẩu"
                disabled={loginMutation.isPending}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center">
                  <svg
                    className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang đăng nhập...
                </div>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Đăng ký ngay
              </Link>
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              <strong>Tài khoản demo:</strong>
              <br />
              Admin: admin@football.com / admin123
              <br />
              Member: nguyen.huu.phuc.fcvuive@gmail.com / admin123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
