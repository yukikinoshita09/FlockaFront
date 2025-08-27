import {
    ApiResponse,
    Card,
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
    VerifyEmailRequest
} from './types';

// API設定
const API_BASE_URL = 'https://api.flocka.net';

// ストレージキー
const AUTH_TOKEN_KEY = 'flocka_auth_token';

/**
 * ローカルストレージから認証トークンを取得
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
};

/**
 * ローカルストレージに認証トークンを保存
 */
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
};

/**
 * ローカルストレージから認証トークンを削除
 */
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

/**
 * APIリクエスト用のヘッダーを作成
 */
const createHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * APIリクエストを実行
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth: boolean = true
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...createHeaders(includeAuth),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || `HTTP error! status: ${response.status}`,
        data.code,
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
};

// 認証API
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
    return apiRequest<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  },

  /**
   * メール認証
   */
  verifyEmail: async (data: VerifyEmailRequest): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  },

  /**
   * 現在のユーザー情報を取得
   */
  getMe: async (): Promise<ApiResponse<User>> => {
    return apiRequest<ApiResponse<User>>('/users/me');
  },

  /**
   * アカウント削除
   */
  deleteAccount: async (): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('/users/me', {
      method: 'DELETE',
    });
  },
};

// カードAPI
export const cardApi = {
  /**
   * 画像をアップロード
   */
  uploadImage: async (file: File): Promise<ApiResponse<ImageUploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/cards/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || `HTTP error! status: ${response.status}`,
        data.code,
        response.status
      );
    }

    return data;
  },

  /**
   * カードを作成
   */
  create: async (data: CreateCardRequest): Promise<ApiResponse<Card>> => {
    return apiRequest<ApiResponse<Card>>('/cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * 自分のカード一覧を取得
   */
  getMyCards: async (): Promise<ApiResponse<Card[]>> => {
    return apiRequest<ApiResponse<Card[]>>('/cards');
  },

  /**
   * カード情報を更新
   */
  update: async (cardId: string, data: UpdateCardRequest): Promise<ApiResponse<Card>> => {
    return apiRequest<ApiResponse<Card>>(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * カードを削除
   */
  delete: async (cardId: string): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>(`/cards/${cardId}`, {
      method: 'DELETE',
    });
  },

  /**
   * 画像URLを生成
   */
  getImageUrl: (imageKey: string): string => {
    return `${API_BASE_URL}/cards/image/${imageKey}`;
  },
};

// 交換API
export const exchangeApi = {
  /**
   * カード交換を記録
   */
  create: async (data: CreateExchangeRequest): Promise<ApiResponse<Exchange>> => {
    return apiRequest<ApiResponse<Exchange>>('/exchanges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * コレクション一覧を取得
   */
  getMyExchanges: async (): Promise<ApiResponse<Exchange[]>> => {
    return apiRequest<ApiResponse<Exchange[]>>('/exchanges');
  },

  /**
   * 交換記録詳細を取得
   */
  getById: async (exchangeId: string): Promise<ApiResponse<Exchange>> => {
    return apiRequest<ApiResponse<Exchange>>(`/exchanges/${exchangeId}`);
  },

  /**
   * 交換記録を更新
   */
  update: async (exchangeId: string, data: UpdateExchangeRequest): Promise<ApiResponse<Exchange>> => {
    return apiRequest<ApiResponse<Exchange>>(`/exchanges/${exchangeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * 交換記録を削除
   */
  delete: async (exchangeId: string): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>(`/exchanges/${exchangeId}`, {
      method: 'DELETE',
    });
  },
};

// ApiErrorクラス
class ApiError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

// ヘルパー関数
export const helpers = {
  /**
   * ログイン状態をチェック
   */
  isLoggedIn: (): boolean => {
    return !!getAuthToken();
  },

  /**
   * ログアウト
   */
  logout: (): void => {
    removeAuthToken();
  },

  /**
   * エラーメッセージを取得
   */
  getErrorMessage: (error: unknown): string => {
    if (error instanceof ApiError) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error occurred';
  },

  /**
   * カードのリンク情報をパース
   */
  parseCardLinks: (linksJson: string): any => {
    try {
      return JSON.parse(linksJson);
    } catch {
      return {};
    }
  },

  /**
   * カードのリンク情報を文字列化
   */
  stringifyCardLinks: (links: any): string => {
    return JSON.stringify(links);
  },
};

export { ApiError };
