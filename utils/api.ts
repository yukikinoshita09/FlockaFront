import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://api.flocka.net';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    email_verified: boolean;
  };
}

// トークンの保存・取得・削除
export const tokenManager = {
  async save(token: string): Promise<void> {
    await SecureStore.setItemAsync('authToken', token);
  },

  async get(): Promise<string | null> {
    return await SecureStore.getItemAsync('authToken');
  },

  async remove(): Promise<void> {
    await SecureStore.deleteItemAsync('authToken');
  }
};

// API クライアント
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    console.log('API Client initialized with base URL:', this.baseUrl);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = await tokenManager.get();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // skipAuthがfalseで、かつトークンが存在する場合のみAuthorizationヘッダーを追加
    if (!skipAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      console.log(`API Request: ${options.method || 'GET'} ${url}`);
      console.log('Request headers:', headers);
      const response = await fetch(url, config);
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Invalid response format');
      }

      console.log(`API Response: ${response.status}`, data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: API request failed`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // APIの接続テスト
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'OPTIONS',
      });
      console.log('Connection test response:', response.status);
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // ログイン
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, true); // skipAuth = true でログイン時は認証ヘッダーを送信しない

    if (response.success && response.data) {
      // トークンを保存
      await tokenManager.save(response.data.token);
      return response.data;
    }

    throw new Error(response.error || 'Login failed');
  }

  // 新規登録
  async register(email: string, name: string, password: string): Promise<void> {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    }, true); // skipAuth = true

    if (!response.success) {
      throw new Error(response.error || 'Registration failed');
    }
  }

  // ログアウト
  async logout(): Promise<void> {
    await tokenManager.remove();
  }

  // 現在のユーザー情報を取得
  async getCurrentUser() {
    const response = await this.request('/auth/me');
    
    if (response.success) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get user info');
  }

  // トークンの有効性をチェック
  async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  // メールアドレス認証
  async verifyEmail(token: string): Promise<void> {
    const response = await this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }, true); // skipAuth = true

    if (!response.success) {
      throw new Error(response.error || 'Email verification failed');
    }
  }

  // メール認証の再送
  async resendVerificationEmail(email: string): Promise<void> {
    const response = await this.request('/auth/resend-verification-by-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, true); // skipAuth = true

    if (!response.success) {
      throw new Error(response.error || 'Failed to resend verification email');
    }
  }
}

export const apiClient = new ApiClient();
