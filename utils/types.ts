// APIレスポンスの基本型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ユーザー関連の型
export interface User {
  id: string;
  email: string;
  name: string;
  email_verified: number;
  created_at: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface VerifyEmailRequest {
  token: string;
}

// カード関連の型
export interface Card {
  id: string;
  user_id: string;
  card_name: string;
  image_key?: string;
  links?: string; // JSON文字列
  created_at: string;
  imageUrl?: string; // フロントエンド用のURL
}

export interface CardLink {
  title: string;
  url: string;
}

export interface CreateCardRequest {
  card_name: string;
  image_key?: string;
  links?: CardLink[];
}

export interface UpdateCardRequest {
  card_name?: string;
  image_key?: string;
  links?: CardLink[];
}

export interface ImageUploadResponse {
  fileKey: string;
  originalName: string;
  size: number;
  type: string;
  uploadedAt: string;
}

// カード交換関連の型
export interface Exchange {
  id: string;
  owner_user_id: string;
  collected_card_id: string;
  memo?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  card?: Card; // populate時のカード情報
}

export interface CreateExchangeRequest {
  collected_card_id: string;
  memo?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateExchangeRequest {
  memo?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
}
