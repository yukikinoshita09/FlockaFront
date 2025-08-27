import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { authApi, cardApi, exchangeApi, helpers, useAuth, useCards, useExchanges } from '../../utils';

export default function DebugScreen() {
  const [result, setResult] = useState<string>('');
  const [email, setEmail] = useState('kazu3jp.purin@outlook.jp'); //自分の入れても動きます。メール認証くるけど。
  const [password, setPassword] = useState('123qwecc');
  const [name, setName] = useState('testuser');  //なしでも動くはず。

  // Hooks
  const { user, isLoggedIn, login, register, logout } = useAuth();
  const { cards, fetchCards, createCard } = useCards();
  const { exchanges, fetchExchanges } = useExchanges();

  const addResult = (title: string, data: any) => {
    const timestamp = new Date().toLocaleTimeString();
    let resultText;
    
    if (data instanceof Error) {
      const errorDetails = helpers.getErrorDetails(data);
      resultText = `[${timestamp}] ❌ ${title}\nエラータイプ: ${data.constructor.name}\nメッセージ: ${data.message}\nユーザー向けメッセージ: ${helpers.getUserFriendlyErrorMessage(data)}\n詳細: ${JSON.stringify(errorDetails, null, 2)}\n\n`;
    } else {
      resultText = `[${timestamp}] ✅ ${title}\n${JSON.stringify(data, null, 2)}\n\n`;
    }
    
    setResult(prev => resultText + prev);
  };

  const clearResults = () => setResult('');

  // 認証テスト
  const testRegister = async () => {
    try {
      const result = await register({ name, email, password });
      addResult('Register (Hook)', result);
    } catch (error) {
      addResult('Register Error', error);
    }
  };

  const testLogin = async () => {
    try {
      const result = await login({ email, password });
      addResult('Login (Hook)', result);
    } catch (error) {
      addResult('Login Error', error);
    }
  };

  const testDirectAuth = async () => {
    try {
      const result = await authApi.login({ email, password });
      addResult('Direct Auth API', result);
    } catch (error) {
      addResult('Direct Auth Error', error);
    }
  };

  const testGetMe = async () => {
    try {
      const result = await authApi.getMe();
      addResult('Get Me', result);
    } catch (error) {
      addResult('Get Me Error', error);
    }
  };

  // カードテスト
  const testCreateCard = async () => {
    try {
      const result = await createCard({
        card_name: 'Debug Card',
        links: [
          { title: 'Twitter', url: 'https://twitter.com/test' }
        ]
      });
      addResult('Create Card (Hook)', result);
    } catch (error) {
      addResult('Create Card Error', error);
    }
  };

  const testDirectCardAPI = async () => {
    try {
      const result = await cardApi.create({
        card_name: 'Direct API Card'
      });
      addResult('Direct Card API', result);
    } catch (error) {
      addResult('Direct Card Error', error);
    }
  };

  const testFetchCards = async () => {
    try {
      await fetchCards();
      addResult('Fetch Cards (Hook)', { count: cards.length, cards });
    } catch (error) {
      addResult('Fetch Cards Error', error);
    }
  };

  // 交換テスト
  const testCreateExchange = async () => {
    if (cards.length < 1) {
      Alert.alert('エラー', 'カードが1枚以上必要です');
      return;
    }
    
    try {
      const result = await exchangeApi.create({
        collected_card_id: cards[0].id,
        memo: 'デバッグ用交換記録'
      });
      addResult('Create Exchange', result);
    } catch (error) {
      addResult('Create Exchange Error', error);
    }
  };

  // ストレージテスト
  const testStorageStatus = async () => {
    try {
      const isLoggedInStatus = await helpers.isLoggedIn();
      addResult('Storage Status', { isLoggedIn: isLoggedInStatus });
    } catch (error) {
      addResult('Storage Error', error);
    }
  };

  // API接続テスト
  const testAPIConnection = async () => {
    try {
      const response = await fetch('https://api.flocka.net/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Health Check Status:', response.status);
      const responseText = await response.text();
      console.log('Health Check Response:', responseText);
      
      addResult('API Connection Test', {
        status: response.status,
        statusText: response.statusText,
        responseText: responseText,
        headers: Object.fromEntries(response.headers.entries()),
      });
    } catch (error) {
      addResult('API Connection Error', error);
    }
  };

  const TestButton = ({ title, onPress, color = '#007AFF' }: {
    title: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>🐛 Utils Debug Screen</Text>
        
        {/* ユーザー状態 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>現在の状態</Text>
          <Text style={styles.statusText}>
            ログイン状態: {isLoggedIn ? '✅ ログイン中' : '❌ 未ログイン'}
          </Text>
          {user && (
            <Text style={styles.statusText}>
              ユーザー: {user.name} ({user.email})
            </Text>
          )}
          <Text style={styles.statusText}>
            カード数: {cards.length}
          </Text>
          <Text style={styles.statusText}>
            交換記録数: {exchanges.length}
          </Text>
        </View>

        {/* 入力フィールド */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>テスト用入力</Text>
          <TextInput
            style={styles.input}
            placeholder="ユーザー名"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="メールアドレス"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="パスワード"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* 認証テスト */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>認証テスト</Text>
          <TestButton title="ユーザー登録 (Hook)" onPress={testRegister} />
          <TestButton title="ログイン (Hook)" onPress={testLogin} />
          <TestButton title="ログイン (Direct API)" onPress={testDirectAuth} />
          <TestButton title="ユーザー情報取得" onPress={testGetMe} />
          <TestButton title="ログアウト" onPress={logout} color="#FF3B30" />
        </View>

        {/* カードテスト */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>カードテスト</Text>
          <TestButton title="カード作成 (Hook)" onPress={testCreateCard} />
          <TestButton title="カード作成 (Direct API)" onPress={testDirectCardAPI} />
          <TestButton title="カード一覧取得" onPress={testFetchCards} />
        </View>

        {/* 交換テスト */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>交換テスト</Text>
          <TestButton title="交換記録作成" onPress={testCreateExchange} />
          <TestButton title="交換記録取得" onPress={fetchExchanges} />
        </View>

        {/* その他のテスト */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>その他</Text>
          <TestButton title="API接続テスト" onPress={testAPIConnection} />
          <TestButton title="ストレージ状態確認" onPress={testStorageStatus} />
          <TestButton title="結果をクリア" onPress={clearResults} color="#FF9500" />
        </View>

        {/* 結果表示 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>実行結果</Text>
          <ScrollView style={styles.resultContainer} nestedScrollEnabled>
            <Text style={styles.resultText}>{result || 'まだ実行されていません'}</Text>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
});
