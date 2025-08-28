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

export interface Card {
  id: string;
  card_name: string;
  image_key?: string;
  image_url?: string;
  bio?: string;
  links: {
    title: string;
    url: string;
  }[];
  created_at?: string;
  owner_name?: string;
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
  async register(email: string, name: string | null, password: string): Promise<void> {
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

  // 自分のカード一覧を取得
  async getMyCards(): Promise<Card[]> {
    const response = await this.request<Card[]>('/cards');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get cards');
  }

  // カード画像のURLを生成
  getCardImageUrl(imageKey: string): string {
    return `${this.baseUrl}/cards/image/${imageKey}`;
  }

  // APIのベースURLを取得
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // QRコード交換用データを生成（v1.3.0対応）
  async generateQRCode(cardId: string, expiresIn: number = 3600): Promise<{
    qrData: string;
    token: string;
    cardName: string;
    expiresAt: string;
  }> {
    const response = await this.request<{
      qrData: string;
      token: string;
      cardName: string;
      expiresAt: string;
    }>('/exchanges/qr/generate', {
      method: 'POST',
      body: JSON.stringify({ 
        cardId,
        expiresIn 
      })
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to generate QR code');
  }

  // QRコードを使った即時カード交換（v1.3.0対応）
  async exchangeWithQRCode(qrData: string, myCardId: string, memo?: string, locationName?: string, latitude?: number, longitude?: number): Promise<{
    success: boolean;
    exchangeLogId: string;
    exchangedCards: {
      yourNewCard: Card;
      yourCardSent: Card;
    };
    message: string;
  }> {
    const response = await this.request<{
      exchangeLogId: string;
      exchangedCards: {
        yourNewCard: Card;
        yourCardSent: Card;
      };
      message: string;
    }>('/exchanges/qr', {
      method: 'POST',
      body: JSON.stringify({
        qrData,
        myCardId,
        memo,
        location_name: locationName,
        latitude,
        longitude
      })
    });
    
    if (response.success && response.data) {
      return {
        success: true,
        exchangeLogId: response.data.exchangeLogId,
        exchangedCards: response.data.exchangedCards,
        message: response.data.message || 'QR交換が完了しました'
      };
    }
    
    throw new Error(response.error || 'Failed to exchange cards');
  }

  // QRトークンの情報を取得
  async getQRTokenInfo(qrData: string): Promise<{
    cardId: string;
    cardName: string;
    card: Card & {
      user?: {
        name: string;
        email: string;
      };
    };
    ownerName?: string;
    expiresAt: string;
  }> {
    // QRデータがJSONの場合はパースしてトークンとカードIDを取得
    let cardId: string;
    try {
      const qrObj = JSON.parse(qrData);
      if (qrObj.cardId) {
        cardId = qrObj.cardId;
      } else {
        throw new Error('Invalid QR data format');
      }
    } catch {
      throw new Error('Invalid QR data format');
    }

    // 公開カード情報を取得
    const response = await this.request<Card & {
      user?: {
        name: string;
        email: string;
      };
    }>(`/cards/public/${cardId}`);
    
    if (response.success && response.data) {
      const cardData = response.data;
      return {
        cardId: cardData.id,
        cardName: cardData.card_name,
        card: cardData,
        ownerName: cardData.user?.name,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30分後
      };
    }
    
    throw new Error(response.error || 'Failed to get QR token info');
  }

  // QR交換ログを取得（読み取られた側の通知用）
  async getQRExchangeLogs(): Promise<{
    logs: {
      id: string;
      scannerUser: {
        id: string;
        name: string;
      };
      scannerCard: Card;
      memo?: string;
      created_at: string;
    }[];
    total: number;
    newLogs: number;
  }> {
    const response = await this.request<{
      logs: {
        id: string;
        scannerUser: {
          id: string;
          name: string;
        };
        scannerCard: Card;
        memo?: string;
        created_at: string;
      }[];
      total: number;
      newLogs: number;
    }>('/exchanges/qr-logs');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get QR exchange logs');
  }

  // コレクション一覧を取得
  async getCollection(): Promise<{
    id: string;
    card: Card;
    memo?: string;
    location_name?: string;
    created_at: string;
  }[]> {
    const response = await this.request<{
      collections: {
        id: string;
        card: Card;
        memo?: string;
        location: string | null;
        collected_at: string;
      }[];
      total: number;
    }>('/exchanges');
    
    if (response.success && response.data) {
      // APIレスポンス構造に合わせて変換
      return response.data.collections.map(item => ({
        id: item.id,
        card: item.card,
        memo: item.memo,
        location_name: item.location || undefined,
        created_at: item.collected_at
      }));
    }
    
    throw new Error(response.error || 'Failed to get collection');
  }

  // コレクション詳細を取得
  // 注意: このエンドポイントは現在404を返すため使用していません
  async getExchangeDetail(exchangeId: string): Promise<{
    id: string;
    card: Card;
    memo?: string;
    location_name?: string;
    created_at: string;
  }> {
    const response = await this.request<{
      id: string;
      card: Card;
      memo?: string;
      location_name?: string;
      created_at: string;
    }>(`/exchanges/${exchangeId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to get exchange detail');
  }

  // コレクションのメモを更新
  // 注意: このエンドポイントは現在404を返す可能性があります
  async updateExchangeMemo(exchangeId: string, memo: string): Promise<void> {
    const response = await this.request(`/exchanges/${exchangeId}`, {
      method: 'PUT',
      body: JSON.stringify({ memo })
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update memo');
    }
  }
}

export const apiClient = new ApiClient();
