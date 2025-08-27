import * as SecureStore from 'expo-secure-store';

// ストレージキー
const AUTH_TOKEN_KEY = 'flocka_auth_token';

/**
 * React Native専用の認証トークン管理
 * SecureStoreを使用してセキュアに保存
 */

/**
 * 認証トークンを取得
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

/**
 * 認証トークンを保存
 */
export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to set auth token:', error);
    throw error;
  }
};

/**
 * 認証トークンを削除
 */
export const removeAuthToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove auth token:', error);
    throw error;
  }
};

/**
 * ログイン状態をチェック
 */
export const isLoggedIn = async (): Promise<boolean> => {
  const token = await getAuthToken();
  return !!token;
};
