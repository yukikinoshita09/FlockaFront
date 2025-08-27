import { apiRequest } from './httpClient';
import { removeAuthToken, setAuthToken } from './storage';
import {
    ApiResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    User,
    VerifyEmailRequest,
} from './types';

/**
 * 認証関連のAPI
 */
export const authApi = {
  /**
   * ユーザー登録
   */
  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    return apiRequest<ApiResponse<User>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  },

  /**
   * ログイン
   */
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiRequest<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);

    if (response.success && response.data?.token) {
      await setAuthToken(response.data.token);
    }

    return response;
  },

  /**
   * メールアドレス認証
   */
  verifyEmail: async (data: VerifyEmailRequest): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  },

  /**
   * 現在のユーザー情報取得
   */
  getMe: async (): Promise<ApiResponse<User>> => {
    return apiRequest<ApiResponse<User>>('/users/me');
  },

  /**
   * アカウント削除
   */
  deleteAccount: async (): Promise<ApiResponse<any>> => {
    const response = await apiRequest<ApiResponse<any>>('/users/me', {
      method: 'DELETE',
    });

    if (response.success) {
      await removeAuthToken();
    }

    return response;
  },

  /**
   * ログアウト
   */
  logout: async (): Promise<void> => {
    await removeAuthToken();
  },
};
