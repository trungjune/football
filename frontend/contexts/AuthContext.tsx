'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TOKEN_CONFIG, ROUTES } from '@shared/constants/auth';
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
  const hasInitialized = useRef(false);

  // Kiểm tra token có hết hạn không
  const isTokenExpired = useCallback((tokenTimestamp: string | null): boolean => {
    if (!tokenTimestamp) return true;
    
    const loginTime = parseInt(tokenTimestamp, 10);
    if (isNaN(loginTime)) return true;
    
    const currentTime = Date.now();
    const expiryTime = loginTime + (TOKEN_CONFIG.EXPIRY_DAYS * TOKEN_CONFIG.SECONDS_PER_DAY * 1000);
    
    return currentTime > expiryTime;
  }, []);

  useEffect(() => {
    // Check for stored auth data on mount (only once)
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const tokenTimestamp = localStorage.getItem('tokenTimestamp');

      // Kiểm tra token hết hạn
      if (isTokenExpired(tokenTimestamp)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenTimestamp');
        setLoading(false);
        return;
      }

      if (storedToken && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.email) {
            setToken(storedToken);
            setUser(parsedUser);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenTimestamp');
          }
        } catch (error) {
          console.error('AuthContext: Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('tokenTimestamp');
        }
      } else {
        // Clear any invalid data
        if (storedUser === 'undefined' || storedUser === 'null') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('tokenTimestamp');
        }
      }
    } catch (error) {
      console.error('AuthContext: Error accessing localStorage:', error);
    }

    setLoading(false);
  }, [isTokenExpired]);

  // Kiểm tra token expiry định kỳ (mỗi phút)
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiry = () => {
      const tokenTimestamp = localStorage.getItem('tokenTimestamp');
      if (isTokenExpired(tokenTimestamp)) {
        // Clear auth state
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenTimestamp');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        router.push(`${ROUTES.LOGIN}?message=Phiên đăng nhập đã hết hạn`);
      }
    };

    // Kiểm tra mỗi phút
    const interval = setInterval(checkTokenExpiry, 60000);

    return () => clearInterval(interval);
  }, [token, router, isTokenExpired]);

  // Listen for storage events (when localStorage is changed in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Chỉ xử lý khi có thay đổi từ tab khác
      if (e.key === 'token' || e.key === 'user') {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        // Nếu token hoặc user bị xóa từ tab khác
        if (!storedToken || !storedUser || storedUser === 'undefined' || storedUser === 'null') {
          setToken(null);
          setUser(null);
          router.push(`${ROUTES.LOGIN}?message=Phiên đăng nhập đã hết hạn`);
        }
      }
    };

    // Storage event chỉ trigger khi localStorage thay đổi từ tab khác
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  const login = (newToken: string, newUser: User) => {
    if (!newToken || !newUser || !newUser.id || !newUser.email) {
      console.error('AuthContext: Invalid login data', { token: !!newToken, user: !!newUser });
      return;
    }

    setToken(newToken);
    setUser(newUser);

    try {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('tokenTimestamp', Date.now().toString());
      
      const maxAge = TOKEN_CONFIG.EXPIRY_DAYS * TOKEN_CONFIG.SECONDS_PER_DAY;
      const cookieValue = `token=${newToken}; path=/; max-age=${maxAge}; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;
      document.cookie = cookieValue;
    } catch (error) {
      console.error('AuthContext: Error saving auth data:', error);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenTimestamp');

    // Also clear cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push(ROUTES.LOGIN);
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
