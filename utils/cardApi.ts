import { API_BASE_URL, ApiError } from './config';
import { apiRequest } from './httpClient';
import { getAuthToken } from './storage';
import {
    ApiResponse,
    Card,
    CreateCardRequest,
    ImageUploadResponse,
    UpdateCardRequest,
} from './types';

/**
 * カード関連のAPI
 */
export const cardApi = {
  /**
   * 画像アップロード
   */
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

  /**
   * カード作成
   */
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

  /**
   * 自分のカード一覧取得
   */
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

  /**
   * カード更新
   */
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

  /**
   * カード削除
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
