import { apiRequest } from './httpClient';
import {
    ApiResponse,
    CreateExchangeRequest,
    Exchange,
    UpdateExchangeRequest,
} from './types';

/**
 * 交換記録関連のAPI
 */
export const exchangeApi = {
  /**
   * 交換記録作成
   */
  create: async (data: CreateExchangeRequest): Promise<ApiResponse<Exchange>> => {
    return apiRequest<ApiResponse<Exchange>>('/exchanges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * 自分の交換記録一覧取得
   */
  getMyExchanges: async (): Promise<ApiResponse<Exchange[]>> => {
    return apiRequest<ApiResponse<Exchange[]>>('/exchanges');
  },

  /**
   * 交換記録詳細取得
   */
  getById: async (exchangeId: string): Promise<ApiResponse<Exchange>> => {
    return apiRequest<ApiResponse<Exchange>>(`/exchanges/${exchangeId}`);
  },

  /**
   * 交換記録更新
   */
  update: async (exchangeId: string, data: UpdateExchangeRequest): Promise<ApiResponse<Exchange>> => {
    return apiRequest<ApiResponse<Exchange>>(`/exchanges/${exchangeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * 交換記録削除
   */
  delete: async (exchangeId: string): Promise<ApiResponse<any>> => {
    return apiRequest<ApiResponse<any>>(`/exchanges/${exchangeId}`, {
      method: 'DELETE',
    });
  },
};
