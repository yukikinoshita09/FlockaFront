import { useCallback, useEffect, useState } from 'react';
import { apiClient, Card } from '../utils/api';

interface QRExchangeLog {
  id: string;
  scannerUser: {
    id: string;
    name: string;
  };
  scannerCard: Card;
  memo?: string;
  created_at: string;
}

export const useQRExchangeNotifications = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [newExchangeLog, setNewExchangeLog] = useState<QRExchangeLog | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);

  const checkForNewExchanges = useCallback(async () => {
    if (isChecking) return;

    // 前回チェックから10秒未満の場合はスキップ
    const now = Date.now();
    if (now - lastCheckTime < 10000) {
      return;
    }

    try {
      setIsChecking(true);
      setLastCheckTime(now);
      const data = await apiClient.getQRExchangeLogs();
      
      // 新しい交換ログがある場合
      if (data.newLogs > 0 && data.logs.length > 0) {
        const latestLog = data.logs[0]; // 最新のログ
        setNewExchangeLog(latestLog);
        setShowPreview(true);
      }
    } catch {
      // サイレントエラー - QR交換ログは必須機能ではないため、エラーを無視
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, lastCheckTime]);

  // 定期的にチェック（10秒間隔）
  useEffect(() => {
    const interval = setInterval(checkForNewExchanges, 10000); // 10秒 = 10000ms

    // 初回チェック
    checkForNewExchanges();
    
    return () => clearInterval(interval);
  }, [checkForNewExchanges]);

  const closePreview = () => {
    setShowPreview(false);
    setNewExchangeLog(null);
  };

  return {
    checkForNewExchanges,
    isChecking,
    newExchangeLog,
    showPreview,
    closePreview
  };
};
