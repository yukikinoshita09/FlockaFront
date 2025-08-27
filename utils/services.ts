import { ApiConfig, ApiError } from './config';
import { HttpClient } from './httpClient';
import { removeAuthToken, setAuthToken } from './storage';
import {
    ApiResponse,
    Card,
    CardLink,
    CreateCardRequest,
    CreateExchangeRequest,
    Exchange,
    ImageUploadResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    UpdateCardRequest,
    UpdateExchangeRequest,
    User,
    VerifyEmailRequest,
} from './types';

/**
 * 認証サービスクラス
 */
export class AuthService {
  constructor(private httpClient: HttpClient) {}

  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    return this.httpClient.post<ApiResponse<User>>('/auth/register', data, false);
  }

  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.httpClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      data,
      false
    );

    // ログイン成功時はトークンを保存
    if (response.success && response.data?.token) {
      await setAuthToken(response.data.token);
    }

    return response;
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<ApiResponse<any>> {
    return this.httpClient.post<ApiResponse<any>>('/auth/verify-email', data, false);
  }

  async getMe(): Promise<ApiResponse<User>> {
    return this.httpClient.get<ApiResponse<User>>('/users/me');
  }

  async deleteAccount(): Promise<ApiResponse<any>> {
    const response = await this.httpClient.delete<ApiResponse<any>>('/users/me');

    // アカウント削除成功時はトークンを削除
    if (response.success) {
      await removeAuthToken();
    }

    return response;
  }

  async logout(): Promise<void> {
    await removeAuthToken();
  }
}

/**
 * カードサービスクラス
 */
export class CardService {
  constructor(private httpClient: HttpClient) {}

  async uploadImage(
    fileUri: string,
    fileName?: string,
    type?: string
  ): Promise<ApiResponse<ImageUploadResponse>> {
    return this.httpClient.uploadFile<ApiResponse<ImageUploadResponse>>(
      '/cards/upload',
      fileUri,
      fileName,
      type
    );
  }

  async create(data: CreateCardRequest): Promise<ApiResponse<Card>> {
    // リンクデータを文字列に変換
    const requestData = {
      ...data,
      links: data.links ? JSON.stringify(data.links) : undefined,
    };

    return this.httpClient.post<ApiResponse<Card>>('/cards', requestData);
  }

  async getMyCards(): Promise<ApiResponse<Card[]>> {
    const response = await this.httpClient.get<ApiResponse<Card[]>>('/cards');
    
    // 画像URLを追加
    if (response.success && response.data) {
      response.data = response.data.map((card: Card) => ({
        ...card,
        imageUrl: card.image_key ? this.getImageUrl(card.image_key) : undefined,
      }));
    }

    return response;
  }

  async update(cardId: string, data: UpdateCardRequest): Promise<ApiResponse<Card>> {
    // リンクデータを文字列に変換
    const requestData = {
      ...data,
      links: data.links ? JSON.stringify(data.links) : undefined,
    };

    const response = await this.httpClient.put<ApiResponse<Card>>(
      `/cards/${cardId}`,
      requestData
    );

    // 画像URLを追加
    if (response.success && response.data?.image_key) {
      response.data.imageUrl = this.getImageUrl(response.data.image_key);
    }

    return response;
  }

  async delete(cardId: string): Promise<ApiResponse<any>> {
    return this.httpClient.delete<ApiResponse<any>>(`/cards/${cardId}`);
  }

  getImageUrl(imageKey: string): string {
    return `${this.httpClient['config'].baseUrl}/cards/image/${imageKey}`;
  }

  parseLinks(linksJson?: string): CardLink[] {
    if (!linksJson) return [];
    try {
      return JSON.parse(linksJson);
    } catch {
      return [];
    }
  }

  stringifyLinks(links: CardLink[]): string {
    return JSON.stringify(links);
  }
}

/**
 * 交換サービスクラス
 */
export class ExchangeService {
  constructor(private httpClient: HttpClient) {}

  async create(data: CreateExchangeRequest): Promise<ApiResponse<Exchange>> {
    return this.httpClient.post<ApiResponse<Exchange>>('/exchanges', data);
  }

  async getMyExchanges(): Promise<ApiResponse<Exchange[]>> {
    return this.httpClient.get<ApiResponse<Exchange[]>>('/exchanges');
  }

  async getById(exchangeId: string): Promise<ApiResponse<Exchange>> {
    return this.httpClient.get<ApiResponse<Exchange>>(`/exchanges/${exchangeId}`);
  }

  async update(
    exchangeId: string,
    data: UpdateExchangeRequest
  ): Promise<ApiResponse<Exchange>> {
    return this.httpClient.put<ApiResponse<Exchange>>(`/exchanges/${exchangeId}`, data);
  }

  async delete(exchangeId: string): Promise<ApiResponse<any>> {
    return this.httpClient.delete<ApiResponse<any>>(`/exchanges/${exchangeId}`);
  }
}

/**
 * メインAPIクライアントクラス
 */
export class ApiClient {
  private httpClient: HttpClient;
  public auth: AuthService;
  public cards: CardService;
  public exchanges: ExchangeService;

  constructor(config?: Partial<ApiConfig>) {
    this.httpClient = new HttpClient(config);
    this.auth = new AuthService(this.httpClient);
    this.cards = new CardService(this.httpClient);
    this.exchanges = new ExchangeService(this.httpClient);
  }

  /**
   * ヘルパー関数
   */
  static validateImageFile(fileSize: number, fileType: string): { 
    isValid: boolean; 
    error?: string 
  } {
    // 10MB制限
    const MAX_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (fileSize > MAX_SIZE) {
      return { isValid: false, error: 'ファイルサイズが10MBを超えています' };
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      return { isValid: false, error: 'サポートされていないファイル形式です' };
    }

    return { isValid: true };
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error occurred';
  }
}

// デフォルトインスタンス
export const apiClient = new ApiClient();
