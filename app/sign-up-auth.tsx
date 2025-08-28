import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../utils/api";

export default function SignUpAuth() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Cooldown for resend (seconds)
  const COOLDOWN_SECONDS = 60;
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as unknown as number);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as unknown as number);
        intervalRef.current = null;
      }
      return;
    }

    // start interval if not already started
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setCooldownSeconds((s) => {
          if (s <= 1) {
            // will clear in next effect run
            return 0;
          }
          return s - 1;
        });
      }, 1000) as unknown as number;
    }
  }, [cooldownSeconds]);

  const handleResend = async () => {
    if (!user?.email) {
      Alert.alert('ユーザー情報がありません', 'サインアップ画面からメールアドレスを入力してください。', [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'サインアップへ', onPress: () => router.push('/sign-up') }
      ]);
      return;
    }

    if (cooldownSeconds > 0) {
      Alert.alert('お待ちください', `認証メールはあと ${cooldownSeconds} 秒後に再送可能です。`);
      return;
    }

    try {
      setLoading(true);
      await apiClient.resendVerificationEmail(user.email);
      Alert.alert('送信完了', `${user.email} に認証メールを再送しました。メールボックスを確認してください。`);

      // start cooldown
      setCooldownSeconds(COOLDOWN_SECONDS);
    } catch (error) {
      console.error('Resend verification failed:', error);
      Alert.alert('送信失敗', '認証メールの再送に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAndSignup = async () => {
    try {
      setLoggingOut(true);
      await logout();
      router.replace('/sign-up');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('エラー', 'ログアウトに失敗しました。');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ecebeb', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <View style={{ width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>メール認証を完了してください</Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 20, textAlign: 'center' }}>{user?.email ?? '—'}</Text>

        <Pressable
          onPress={handleResend}
          disabled={loading || cooldownSeconds > 0}
          style={{ backgroundColor: '#111827', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12, opacity: (loading || cooldownSeconds > 0) ? 0.7 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              {cooldownSeconds > 0 ? `再送まで待つ（${cooldownSeconds}s）` : '認証メールを再送する'}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleLogoutAndSignup}
          disabled={loggingOut}
          style={{ backgroundColor: '#fff', paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 8, opacity: loggingOut ? 0.7 : 1 }}
        >
          {loggingOut ? (
            <ActivityIndicator color="#111827" />
          ) : (
            <Text style={{ color: '#111827', fontWeight: '600' }}>別のメールで登録し直す（ログアウト）</Text>
          )}
        </Pressable>

        <Pressable onPress={()=>router.replace('/')} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ color: '#374151' }}>ホームへ</Text>
        </Pressable>
      </View>
    </View>
  );
}
