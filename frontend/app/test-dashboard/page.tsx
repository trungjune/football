'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function TestDashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">Không có user</h1>
          <p>User: {JSON.stringify(user)}</p>
          <p>Loading: {loading.toString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">Test Dashboard</h1>

        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Thông tin User</h2>
          <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">Auth State</h2>
          <p>
            <strong>Loading:</strong> {loading.toString()}
          </p>
          <p>
            <strong>User exists:</strong> {!!user ? 'Yes' : 'No'}
          </p>
          <p>
            <strong>Token exists:</strong> {!!localStorage.getItem('token') ? 'Yes' : 'No'}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">LocalStorage Data</h2>
          <div className="space-y-2">
            <p>
              <strong>Token:</strong> {localStorage.getItem('token')?.substring(0, 50)}...
            </p>
            <p>
              <strong>User:</strong> {localStorage.getItem('user')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
