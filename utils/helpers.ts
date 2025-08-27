import { ApiError } from './config';
import { getAuthToken } from './storage';
import { CardLink } from './types';

/**
 * ユーティリティ関数集
 */
export const helpers = {
  /**
   * ログイン状態チェック
   */
  isLoggedIn: async (): Promise<boolean> => {
    const token = await getAuthToken();
    return !!token;
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
   * ユーザーフレンドリーなエラーメッセージを取得
   */
  getUserFriendlyErrorMessage: (error: unknown): string => {
    if (error instanceof ApiError) {
      return error.getUserFriendlyMessage();
    }
    if (error instanceof Error) {
      return error.message;
    }
    return '予期しないエラーが発生しました。';
  },

  /**
   * エラーの詳細情報を取得
   */
  getErrorDetails: (error: unknown) => {
    if (error instanceof ApiError) {
      return error.getDetails();
    }
    return {
      message: error instanceof Error ? error.message : 'Unknown error',
      isNetworkError: false,
      isServerError: false,
      isClientError: false,
    };
  },

  /**
   * カードリンクをパース
   */
  parseCardLinks: (linksJson?: string): CardLink[] => {
    if (!linksJson) return [];
    try {
      return JSON.parse(linksJson);
    } catch {
      return [];
    }
  },

  /**
   * カードリンクを文字列化
   */
  stringifyCardLinks: (links: CardLink[]): string => {
    return JSON.stringify(links);
  },

  /**
   * 画像ファイルのバリデーション
   */
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
