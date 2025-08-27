import { API_BASE_URL, ApiConfig, ApiError } from './config';
import { getAuthToken } from './storage';

/**
 * APIリクエストを実行する基本クライアント
 */
export const apiRequest = async <T>(
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
    
    // レスポンスのログ出力（デバッグ用）
    console.log('API Response Status:', response.status);
    
    let data;
    const responseText = await response.text();
    console.log('API Response Text:', responseText);
    
    // JSONパースを試行
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response Text that failed to parse:', responseText);
      
      // JSONパースに失敗した場合のエラー処理
      throw new ApiError(
        response.ok 
          ? 'Invalid JSON response from server'
          : `HTTP ${response.status}: ${responseText}`,
        'PARSE_ERROR',
        response.status
      );
    }

    if (!response.ok) {
      throw new ApiError(
        data?.error || data?.message || `HTTP error! status: ${response.status}`,
        data?.code || 'HTTP_ERROR',
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      'NETWORK_ERROR'
    );
  }
};

/**
 * HTTPクライアントクラス
 */
export class HttpClient {
  private config: Required<ApiConfig>;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || API_BASE_URL,
      timeout: config.timeout || 30000,
    };
  }

  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'GET' }, includeAuth);
  }

  async post<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    return apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, includeAuth);
  }

  async put<T>(endpoint: string, data?: any, includeAuth: boolean = true): Promise<T> {
    return apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, includeAuth);
  }

  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'DELETE' }, includeAuth);
  }

  async uploadFile<T>(
    endpoint: string,
    fileUri: string,
    fileName?: string,
    type?: string
  ): Promise<T> {
    const token = await getAuthToken();
    
    const formData = new FormData();
    const file = {
      uri: fileUri,
      name: fileName || 'file',
      type: type || 'application/octet-stream',
    } as any;
    
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    console.log('Upload Response Status:', response.status);
    
    let data;
    const responseText = await response.text();
    console.log('Upload Response Text:', responseText);
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Upload JSON Parse Error:', parseError);
      console.error('Upload Response Text that failed to parse:', responseText);
      
      throw new ApiError(
        response.ok 
          ? 'Invalid JSON response from upload server'
          : `Upload HTTP ${response.status}: ${responseText}`,
        'UPLOAD_PARSE_ERROR',
        response.status
      );
    }

    if (!response.ok) {
      throw new ApiError(
        data?.error || data?.message || `Upload HTTP error! status: ${response.status}`,
        data?.code || 'UPLOAD_HTTP_ERROR',
        response.status
      );
    }

    return data;
  }
}