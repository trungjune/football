'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored auth data on mount
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      console.log('AuthContext: Checking localStorage', {
        hasToken: !!storedToken,
        hasUser: !!storedUser,
        userValue: storedUser,
      });

      if (storedToken && storedUser && storedUser !== 'undefined') {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('AuthContext: Setting user from localStorage', parsedUser);
          setToken(storedToken);
          setUser(parsedUser);
        } catch (error) {
          console.error('Lỗi parse dữ liệu user từ localStorage:', error);
          // Xóa dữ liệu không hợp lệ
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        console.log('AuthContext: No valid auth data in localStorage');
      }
    } catch (error) {
      console.error('AuthContext: Error accessing localStorage:', error);
    }

    setLoading(false);
  }, []);

  // Listen for localStorage changes (when user clears site data)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      // If user was logged in but localStorage is cleared or invalid
      if ((user || token) && (!storedToken || !storedUser || storedUser === 'undefined')) {
        console.log('localStorage cleared or invalid, logging out user');
        setToken(null);
        setUser(null);
        router.push('/login?message=Dữ liệu đăng nhập đã bị xóa');
      }
    };

    // Check every 1 second for localStorage changes
    const interval = setInterval(handleStorageChange, 1000);

    // Also listen for storage events (when localStorage is changed in another tab)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, token, router]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
