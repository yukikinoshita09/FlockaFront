/**
 * API基本設定とエラークラス
 */

export const API_BASE_URL = 'https://api.flocka.net';

/**
 * API設定インターフェース
 */
export interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
}

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  code?: string;
  status?: number;
  originalResponse?: string;

  constructor(message: string, code?: string, status?: number, originalResponse?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.originalResponse = originalResponse;
  }

  /**
   * エラーの詳細情報を取得
   */
  getDetails(): { 
    message: string; 
    code?: string; 
    status?: number; 
    originalResponse?: string;
    isNetworkError: boolean;
    isServerError: boolean;
    isClientError: boolean;
  } {
    return {
      message: this.message,
      code: this.code,
      status: this.status,
      originalResponse: this.originalResponse,
      isNetworkError: !this.status,
      isServerError: this.status ? this.status >= 500 : false,
      isClientError: this.status ? this.status >= 400 && this.status < 500 : false,
    };
  }

  /**
   * ユーザーフレンドリーなエラーメッセージを取得
   */
  getUserFriendlyMessage(): string {
    if (!this.status) {
      return 'ネットワークに接続できません。インターネット接続を確認してください。';
    }

    switch (this.status) {
      case 400:
        return 'リクエストに問題があります。入力内容を確認してください。';
      case 401:
        return 'ログインが必要です。再度ログインしてください。';
      case 403:
        return 'この操作を実行する権限がありません。';
      case 404:
        return 'リクエストされた情報が見つかりません。';
      case 422:
        return '入力内容に問題があります。内容を確認してください。';
      case 429:
        return 'リクエストが多すぎます。しばらく待ってから再試行してください。';
      case 500:
        return 'サーバーでエラーが発生しました。時間をおいて再試行してください。';
      case 502:
      case 503:
        return 'サーバーが一時的に利用できません。しばらく待ってから再試行してください。';
      case 504:
        return 'サーバーの応答が遅れています。時間をおいて再試行してください。';
      default:
        return this.message || '予期しないエラーが発生しました。';
    }
  }
}