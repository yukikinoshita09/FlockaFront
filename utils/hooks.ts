import { useCallback, useEffect, useState } from 'react';
import { authApi } from './authApi';
import { cardApi } from './cardApi';
import { exchangeApi } from './exchangeApi';
import { helpers } from './helpers';
import {
    Card,
    CreateCardRequest,
    CreateExchangeRequest,
    Exchange,
    LoginRequest,
    RegisterRequest,
    User,
} from './types';

/**
 * 認証に関するhook
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const loggedIn = await helpers.isLoggedIn();
        setIsLoggedIn(loggedIn);
        
        if (loggedIn) {
          const response = await authApi.getMe();
          if (response.success && response.data) {
            setUser(response.data);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const response = await authApi.login(credentials);
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsLoggedIn(true);
        return { success: true };
      }
      return { success: false, error: response.error || 'ログインに失敗しました' };
    } catch (error) {
      const errorMessage = helpers.getErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      const response = await authApi.register(userData);
      if (response.success) {
        return { success: true };
      }
      return { success: false, error: response.error || '登録に失敗しました' };
    } catch (error) {
      const errorMessage = helpers.getErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      const response = await authApi.deleteAccount();
      if (response.success) {
        setUser(null);
        setIsLoggedIn(false);
        return { success: true };
      }
      return { success: false, error: response.error || 'アカウント削除に失敗しました' };
    } catch (error) {
      const errorMessage = helpers.getErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    user,
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
    deleteAccount,
  };
};

/**
 * カード管理に関するhook
 */
export const useCards = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await cardApi.getMyCards();
      if (response.success && response.data) {
        setCards(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCard = useCallback(async (cardData: CreateCardRequest) => {
    try {
      const response = await cardApi.create(cardData);
      if (response.success && response.data) {
        setCards(prevCards => [...prevCards, response.data!]);
        return { success: true, card: response.data };
      }
      return { success: false, error: response.error || 'カード作成に失敗しました' };
    } catch (error) {
      const errorMessage = helpers.getErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateCard = useCallback(async (cardId: string, updateData: Partial<CreateCardRequest>) => {
    try {
      const response = await cardApi.update(cardId, updateData);
      if (response.success && response.data) {
        setCards(prevCards => 
          prevCards.map(card => 
            card.id === cardId ? response.data! : card
          )
        );
        return { success: true, card: response.data };
      }
      return { success: false, error: response.error || 'カード更新に失敗しました' };
    } catch (error) {
      const errorMessage = helpers.getErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  }, []);

  const deleteCard = useCallback(async (cardId: string) => {
    try {
      const response = await cardApi.delete(cardId);
      if (response.success) {
        setCards(prevCards => prevCards.filter(card => card.id !== cardId));
        return { success: true };
      }
      return { success: false, error: response.error || 'カード削除に失敗しました' };
    } catch (error) {
      const errorMessage = helpers.getErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  }, []);

  const uploadImage = useCallback(async (fileUri: string, fileName?: string, type?: string) => {
    try {
      const response = await cardApi.uploadImage(fileUri, fileName, type);
      if (response.success && response.data) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error || '画像アップロードに失敗しました' };
    } catch (error) {
      const errorMessage = helpers.getErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    cards,
    isLoading,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
    uploadImage,
  };
};

/**
 * 交換記録に関するhook
 */
export const useExchanges = () => {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchExchanges = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await exchangeApi.getMyExchanges();
      if (response.success && response.data) {
        setExchanges(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch exchanges:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createExchange = useCallback(async (exchangeData: CreateExchangeRequest) => {
    try {
      const response = await exchangeApi.create(exchangeData);
      if (response.success && response.data) {
        setExchanges(prevExchanges => [...prevExchanges, response.data!]);
        return { success: true, exchange: response.data };
      }
      return { success: false, error: response.error || '交換記録の作成に失敗しました' };
    } catch (error) {
      const errorMessage = helpers.getErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateExchange = useCallback(async (exchangeId: string, updateData: Partial<CreateExchangeRequest>) => {
    try {
      const response = await exchangeApi.update(exchangeId, updateData);
      if (response.success && response.data) {
        setExchanges(prevExchanges => 
          prevExchanges.map(exchange => 
            exchange.id === exchangeId ? response.data! : exchange
          )
        );
        return { success: true, exchange: response.data };
      }
      return { success: false, error: response.error || '交換記録の更新に失敗しました' };
    } catch (error) {
      const errorMessage = helpers.getErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  }, []);

  const deleteExchange = useCallback(async (exchangeId: string) => {
    try {
      const response = await exchangeApi.delete(exchangeId);
      if (response.success) {
        setExchanges(prevExchanges => 
          prevExchanges.filter(exchange => exchange.id !== exchangeId)
        );
        return { success: true };
      }
      return { success: false, error: response.error || '交換記録の削除に失敗しました' };
    } catch (error) {
      const errorMessage = helpers.getErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    exchanges,
    isLoading,
    fetchExchanges,
    createExchange,
    updateExchange,
    deleteExchange,
  };
};
