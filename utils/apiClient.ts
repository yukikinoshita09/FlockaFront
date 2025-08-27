import { getAuthToken, removeAuthToken, setAuthToken } from './storage';
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
    VerifyEmailRequest,
} from './types';

// API設定
const API_BASE_URL = 'https://api.flocka.net';

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * APIリクエストを実行
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth: boolean = true
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = await getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
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
  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    return apiRequest<ApiResponse<User>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  },

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

  verifyEmail: async (data: VerifyEmailRequest): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    return apiRequest<ApiResponse<User>>('/users/me');
  },

  deleteAccount: async (): Promise<ApiResponse<any>> => {
    const response = await apiRequest<ApiResponse<any>>('/users/me', {
      method: 'DELETE',
    });

    if (response.success) {
      await removeAuthToken();
    }

    return response;
  },

  logout: async (): Promise<void> => {
    await removeAuthToken();
  },
};

// カードAPI
export const cardApi = {
  uploadImage: async (fileUri: string, fileName?: string, type?: string): Promise<ApiResponse<ImageUploadResponse>> => {
    const token = await getAuthToken();
    
    const formData = new FormData();
    const file = {
      uri: fileUri,
      name: fileName || 'image.jpg',
      type: type || 'image/jpeg',
    } as any;
    
    formData.append('file', file);

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

  create: async (data: CreateCardRequest): Promise<ApiResponse<Card>> => {
    // リンクを文字列に変換
    const requestData = {
      ...data,
      links: data.links ? JSON.stringify(data.links) : undefined,
    };

    return apiRequest<ApiResponse<Card>>('/cards', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  getMyCards: async (): Promise<ApiResponse<Card[]>> => {
    const response = await apiRequest<ApiResponse<Card[]>>('/cards');
    
    // 画像URLを追加
    if (response.success && response.data) {
      response.data = response.data.map(card => ({
        ...card,
        imageUrl: card.image_key ? `${API_BASE_URL}/cards/image/${card.image_key}` : undefined,
      }));
    }

    return response;
  },

  update: async (cardId: string, data: UpdateCardRequest): Promise<ApiResponse<Card>> => {
    const requestData = {
      ...data,
      links: data.links ? JSON.stringify(data.links) : undefined,
    };

    const response = await apiRequest<ApiResponse<Card>>(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });

    if (response.success && response.data?.image_key) {
      response.data.imageUrl = `${API_BASE_URL}/cards/image/${response.data.image_key}`;
    }

    return response;
  },

  delete: async (cardId: string): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>(`/cards/${cardId}`, {
      method: 'DELETE',
    });
  },

  getImageUrl: (imageKey: string): string => {
    return `${API_BASE_URL}/cards/image/${imageKey}`;
  },
};

// 交換API
export const exchangeApi = {
  create: async (data: CreateExchangeRequest): Promise<ApiResponse<Exchange>> => {
    return apiRequest<ApiResponse<Exchange>>('/exchanges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyExchanges: async (): Promise<ApiResponse<Exchange[]>> => {
    return apiRequest<ApiResponse<Exchange[]>>('/exchanges');
  },

  getById: async (exchangeId: string): Promise<ApiResponse<Exchange>> => {
    return apiRequest<ApiResponse<Exchange>>(`/exchanges/${exchangeId}`);
  },

  update: async (exchangeId: string, data: UpdateExchangeRequest): Promise<ApiResponse<Exchange>> => {
    return apiRequest<ApiResponse<Exchange>>(`/exchanges/${exchangeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (exchangeId: string): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>(`/exchanges/${exchangeId}`, {
      method: 'DELETE',
    });
  },
};

// ヘルパー関数
export const helpers = {
  isLoggedIn: async (): Promise<boolean> => {
    const token = await getAuthToken();
    return !!token;
  },

  getErrorMessage: (error: unknown): string => {
    if (error instanceof ApiError) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error occurred';
  },

  parseCardLinks: (linksJson?: string): any => {
    if (!linksJson) return [];
    try {
      return JSON.parse(linksJson);
    } catch {
      return [];
    }
  },

  stringifyCardLinks: (links: any): string => {
    return JSON.stringify(links);
  },

  validateImageFile: (fileSize: number, fileType: string): { isValid: boolean; error?: string } => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (fileSize > MAX_SIZE) {
      return { isValid: false, error: 'ファイルサイズが10MBを超えています' };
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      return { isValid: false, error: 'サポートされていないファイル形式です' };
    }

    return { isValid: true };
  },
};
