import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native';
import { apiClient } from '../utils/api';

export default function ResetPassword() {
  const params = useLocalSearchParams();
  const initialToken = typeof params.token === 'string' ? params.token : '';

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!token.trim()) {
      Alert.alert('入力エラー', 'メールに記載されたトークンを入力してください。');
      return;
    }
    if (password.length < 8) {
      Alert.alert('入力エラー', 'パスワードは8文字以上で設定してください。');
      return;
    }
    if (password !== confirm) {
      Alert.alert('入力エラー', 'パスワードが一致しません。');
      return;
    }

    try {
      setLoading(true);
      await apiClient.resetPassword(token.trim(), password);
      Alert.alert('完了', 'パスワードを更新しました。ログインしてください。', [
        { text: 'ログインへ', onPress: () => router.replace('/sign-in') }
      ]);
    } catch (error) {
      console.error('Reset password failed:', error);
      Alert.alert('失敗', 'パスワードのリセットに失敗しました。トークンの有効期限を確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#ecebeb', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <View style={{ width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>パスワードを再設定する</Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 12, textAlign: 'center' }}>メールに記載されたトークンと新しいパスワードを入力してください。</Text>

        <TextInput
          placeholder="メールのトークン"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          style={{ height: 48, borderColor: '#D1D5DB', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12 }}
        />

        <TextInput
          placeholder="新しいパスワード (8文字以上)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ height: 48, borderColor: '#D1D5DB', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12 }}
        />

        <TextInput
          placeholder="確認のため再入力"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          style={{ height: 48, borderColor: '#D1D5DB', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12 }}
        />

        <Pressable onPress={handleReset} disabled={loading} style={{ backgroundColor: '#111827', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8, opacity: loading ? 0.7 : 1 }}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>パスワードを更新する</Text>}
        </Pressable>

        <Pressable onPress={() => router.replace('/sign-in')} style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Text style={{ color: '#374151' }}>ログインへ戻る</Text>
        </Pressable>
      </View>
    </View>
  );
}
