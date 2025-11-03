import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, LoginRequest, RegisterRequest } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Login mutation
export function useLogin() {
  const { login } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: data => {
      login(data.access_token, data.user);
      router.push('/dashboard');
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
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
    onError: (error: any) => {
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
