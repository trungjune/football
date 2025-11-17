'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  useEffect(() => {
    // Check for stored auth data on mount
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.email) {
            setToken(storedToken);
            setUser(parsedUser);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('AuthContext: Error parsing user data:', error);
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
        router.push(`${ROUTES.LOGIN}?message=Dữ liệu đăng nhập đã bị xóa`);
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
    if (!newToken || !newUser || !newUser.id || !newUser.email) {
      console.error('AuthContext: Invalid login data', { token: !!newToken, user: !!newUser });
      return;
    }

    console.log('[AuthContext] Logging in user:', newUser.email);
    setToken(newToken);
    setUser(newUser);

    try {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      const maxAge = TOKEN_CONFIG.EXPIRY_DAYS * TOKEN_CONFIG.SECONDS_PER_DAY;
      const cookieValue = `token=${newToken}; path=/; max-age=${maxAge}; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`;
      document.cookie = cookieValue;
      console.log('[AuthContext] Token saved to cookie:', cookieValue.substring(0, 50) + '...');
    } catch (error) {
      console.error('AuthContext: Error saving auth data:', error);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

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
  console.log('[useAuth] Returning context:', { user: !!context.user, loading: context.loading });
  return context;
}
