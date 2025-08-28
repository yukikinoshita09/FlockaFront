import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { apiClient } from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed || !emailRegex.test(trimmed)) {
      Alert.alert('入力エラー', '有効なメールアドレスを入力してください。');
      return;
    }

    try {
      setLoading(true);
      await apiClient.forgotPassword(trimmed);
      Alert.alert('送信完了', 'パスワードリセット用のメールを送信しました。メールを確認してください。', [
        { text: 'ログインへ', onPress: () => router.replace('/sign-in') }
      ]);
    } catch (error) {
      console.error('Forgot password failed:', error);
      Alert.alert('送信失敗', 'パスワードリセットの送信に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ecebeb', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <View style={{ width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>パスワードをリセットする</Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 12, textAlign: 'center' }}>登録済みメールアドレスを入力してください。リセット用のメールを送信します。</Text>

        <TextInput
          placeholder="sample@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{ height: 48, borderColor: '#D1D5DB', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12 }}
        />

        <Pressable onPress={handleRequest} disabled={loading} style={{ backgroundColor: '#111827', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8, opacity: loading ? 0.7 : 1 }}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>リセットメールを送信する</Text>}
        </Pressable>

        <Pressable onPress={() => router.replace('/sign-in')} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ color: '#374151' }}>ログインへ戻る</Text>
        </Pressable>
      </View>
    </View>
  );
}
