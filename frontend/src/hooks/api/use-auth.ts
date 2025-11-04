import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, LoginRequest } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ApiError {
  response?: {
    data?: unknown;
    status?: number;
  };
  message?: string;
}

// Login mutation
export function useLogin() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => {
      return authApi.login(data);
    },
    onSuccess: data => {
      login(data.access_token, data.user);

      // Đợi một chút để đảm bảo state được cập nhật
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    },
    onError: (error: ApiError) => {
      console.error('useLogin: Login failed with error:', error);
    },
  });
}

// Register mutation
export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      router.push('/login?message=Đăng ký thành công! Vui lòng đăng nhập.');
    },
    onError: (error: ApiError) => {
      console.error('Register failed:', error);
    },
  });
}

// Get profile query
export function useProfile() {
  const { user, token } = useAuth();

  return useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: !!token && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: data => {
      // Update cache
      queryClient.setQueryData(['profile'], data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Logout mutation
export function useLogout() {
  const { logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all data
      logout();
      queryClient.clear();
      router.push('/login');
    },
    onError: (error: ApiError) => {
      console.error('Logout failed:', error);
      // Even if API call fails, clear local data
      logout();
      queryClient.clear();
      router.push('/login');
    },
  });
}
