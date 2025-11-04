'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@shared/types/entities/user';

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

      if (storedToken && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        try {
          const parsedUser = JSON.parse(storedUser);

          // Kiểm tra xem parsedUser có hợp lệ không
          if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.email) {
            setToken(storedToken);
            setUser(parsedUser);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('AuthContext: Error parsing user data from localStorage:', error);
          // Xóa dữ liệu không hợp lệ
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        // Clear any invalid data
        if (storedUser === 'undefined' || storedUser === 'null') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
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
    console.log('AuthContext: Login called with:', {
      token: newToken ? 'present' : 'missing',
      user: newUser,
      userType: typeof newUser,
      hasId: newUser?.id ? 'yes' : 'no',
      hasEmail: newUser?.email ? 'yes' : 'no',
    });

    // Kiểm tra dữ liệu đầu vào
    if (!newToken || !newUser || !newUser.id || !newUser.email) {
      console.error('AuthContext: Invalid login data provided:', {
        token: !!newToken,
        user: !!newUser,
        userId: newUser?.id,
        userEmail: newUser?.email,
      });
      return;
    }

    // Xóa dữ liệu cũ trước
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('AuthContext: Cleared old localStorage data');
    } catch (error) {
      console.error('AuthContext: Error clearing localStorage:', error);
    }

    // Cập nhật state trước
    setToken(newToken);
    setUser(newUser);
    console.log('AuthContext: Updated state with new auth data');

    // Lưu dữ liệu mới vào localStorage
    try {
      localStorage.setItem('token', newToken);
      const userString = JSON.stringify(newUser);
      localStorage.setItem('user', userString);

      // Set cookie for middleware (more explicit)
      const cookieValue = `token=${newToken}; path=/; max-age=604800; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;
      document.cookie = cookieValue;
      console.log('AuthContext: Set cookie:', cookieValue);

      // Verify data was saved correctly
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      console.log('AuthContext: Data saved to localStorage:', {
        tokenSaved: savedToken === newToken,
        userSaved: !!savedUser,
        userValue: savedUser,
        canParse: (() => {
          try {
            const parsed = JSON.parse(savedUser || '');
            return !!parsed.id;
          } catch {
            return false;
          }
        })(),
      });
    } catch (error) {
      console.error('AuthContext: Error saving to localStorage:', error);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Also clear cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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
