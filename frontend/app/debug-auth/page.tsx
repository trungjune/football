'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function DebugAuthPage() {
  const { user, token } = useAuth();
  const [cookieInfo, setCookieInfo] = useState<string>('');
  const [localStorageInfo, setLocalStorageInfo] = useState<{token: string | null, user: string | null}>({token: null, user: null});

  useEffect(() => {
    // Check cookies
    setCookieInfo(document.cookie);
    
    // Check localStorage
    setLocalStorageInfo({
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
    });
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Authentication</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">AuthContext State:</h2>
          <pre className="text-sm">
            {JSON.stringify({ user, token: token ? 'present' : 'missing' }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">LocalStorage:</h2>
          <pre className="text-sm">
            {JSON.stringify(localStorageInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Cookies:</h2>
          <pre className="text-sm whitespace-pre-wrap">
            {cookieInfo || 'No cookies found'}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Actions:</h2>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Reload Page
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                window.location.reload();
              }}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Clear All Auth Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
