import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://api.flocka.net';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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
      console.log('API Error:', error);
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

  // パスワードリセット申請（メール送信）
  async forgotPassword(email: string): Promise<void> {
    const response = await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, true);

    if (!response.success) {
      throw new Error(response.error || 'Failed to request password reset');
    }
  }

  // パスワードリセット実行（トークン + 新パスワード）
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }, true);

    if (!response.success) {
      throw new Error(response.error || 'Failed to reset password');
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

  // 新しいカードを作成
  async createCard(cardData: {
    card_name: string;
    bio?: string;
    image_key?: string;
    links: {
      title: string;
      url: string;
    }[];
  }): Promise<Card> {
    const response = await this.request<Card>('/cards', {
      method: 'POST',
      body: JSON.stringify(cardData)
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to create card');
  }

  // カード情報を更新
  async updateCard(cardId: string, cardData: {
    card_name: string;
    bio?: string;
    image_key?: string;
    links: {
      title: string;
      url: string;
    }[];
  }): Promise<Card> {
    const response = await this.request<Card>(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(cardData)
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to update card');
  }

  // カードを削除
  async deleteCard(cardId: string): Promise<void> {
    const response = await this.request(`/cards/${cardId}`, {
      method: 'DELETE'
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete card');
    }
  }

  // コレクションを削除
  async deleteCollection(cardId: string): Promise<void> {
    const response = await this.request(`/exchanges/${cardId}`, {
      method: 'DELETE'
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete collection');
    }
  }

  // 画像ファイルを直接アップロード
  async uploadImage(imageUri: string): Promise<{ imageKey: string; imageUrl: string }> {
    try {
      console.log('Starting image upload for URI:', imageUri);
      
      // ネットワーク接続確認
      const connectionTest = await this.testConnection();
      if (!connectionTest) {
        throw new Error('APIサーバーに接続できません');
      }

      // 直接アップロード方式（正しいエンドポイント使用）
      return await this.uploadImageDirect(imageUri);
      
    } catch (error) {
      console.error('Image upload error:', error);
      
      // より詳細なエラーメッセージを提供
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('アップロードがタイムアウトしました。ネットワーク接続を確認してください。');
      } else if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('ネットワーク接続に問題があります。インターネット接続を確認してください。');
      } else if (error instanceof Error) {
        throw new Error(`画像アップロードエラー: ${error.message}`);
      } else {
        throw new Error('画像のアップロードに失敗しました');
      }
    }
  }

  // 直接アップロード（正しいエンドポイント /cards/upload）
  private async uploadImageDirect(imageUri: string): Promise<{ imageKey: string; imageUrl: string }> {
    console.log('Uploading image directly to /cards/upload');
    
    // React Nativeでは画像URIを直接FormDataに追加できる
    const formData = new FormData();
    
    // ファイル名を生成
    const fileName = `card-${Date.now()}.jpg`;
    
    // React Nativeの場合、URIを直接使用
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: fileName,
    } as any);

    console.log('FormData created, uploading to:', `${this.baseUrl}/cards/upload`);

    // APIに送信（タイムアウト制御付き）
    const token = await tokenManager.get();
    console.log('Token retrieved, making upload request...');
    
    // タイムアウト制御付きのfetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒タイムアウト
    
    const uploadResponse = await fetch(`${this.baseUrl}/cards/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Content-Typeは自動設定されるため削除
      },
      body: formData,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    console.log('Upload response status:', uploadResponse.status);
    
    const result = await uploadResponse.json();
    console.log('Upload response data:', result);
    
    if (!uploadResponse.ok || !result.success) {
      throw new Error(result.error || `Upload failed with status ${uploadResponse.status}`);
    }

    // APIのレスポンス形式に合わせて変換
    return {
      imageKey: result.data.fileKey,
      imageUrl: `/cards/image/${result.data.fileKey}`
    };
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
    try {
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
      
      // レコードが見つからない場合（404またはnot found）は空のデータを返す
      if (response.error?.toLowerCase().includes('not found') || 
          response.error?.includes('404')) {
        return {
          logs: [],
          total: 0,
          newLogs: 0
        };
      }
      
      // その他のエラーも空のデータを返す（QRログが無いのは正常）
      return {
        logs: [],
        total: 0,
        newLogs: 0
      };
    } catch (error) {
      // ネットワークエラーなどの場合も空のデータを返す
      console.warn('QR exchange logs request failed, returning empty data:', error);
      return {
        logs: [],
        total: 0,
        newLogs: 0
      };
    }
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
    
    // レコードが見つからない場合（404）は空の配列を返す
    if (response.error?.includes('not found') || response.error?.includes('404')) {
      return [];
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
    
    // レコードが見つからない場合（404）は専用のエラーを投げる
    if (response.error?.includes('not found') || response.error?.includes('404')) {
      throw new Error('Exchange record not found');
    }
    
    throw new Error(response.error || 'Failed to get exchange detail');
  }

  // コレクションのメモを更新
  async updateExchangeMemo(exchangeId: string, memo: string): Promise<void> {
    // memo が undefined の場合、空文字列をデフォルト値として設定
    const sanitizedMemo = memo ?? '';

    // デバッグ用ログを追加
    console.log('Updating exchange memo:', { exchangeId, memo: sanitizedMemo });

    const response = await this.request(`/exchanges/${exchangeId}`, {
      method: 'PUT',
      body: JSON.stringify({ memo: sanitizedMemo })
    });
    
    if (!response.success) {
      // レコードが見つからない場合（404）はエラーとして扱う
      throw new Error(response.error || 'Failed to update memo');
    }
  }

  // コレクションから交換記録を削除
  async deleteExchange(exchangeId: string): Promise<void> {
    const response = await this.request(`/exchanges/${exchangeId}`, {
      method: 'DELETE'
    });
    
    // レコードが見つからない場合（404）は既に削除済みとして成功扱い
    if (!response.success) {
      // 404エラーの場合は無視（既に削除済み）
      if (response.error?.includes('not found') || response.error?.includes('404')) {
        return;
      }
      throw new Error(response.error || 'Failed to delete exchange');
    }
  }
}

export const apiClient = new ApiClient();
