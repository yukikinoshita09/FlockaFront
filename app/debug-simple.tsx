import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function SimpleDebugScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐛 シンプルデバッグ</Text>
      <Text style={styles.description}>
        APIユーティリティの基本テストページです
      </Text>
      
      <Link href="/(tabs)/debug" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>フルデバッグ画面を開く</Text>
        </TouchableOpacity>
      </Link>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>利用可能な機能:</Text>
        <Text style={styles.infoText}>• 認証 (ユーザー登録・ログイン)</Text>
        <Text style={styles.infoText}>• カード管理 (作成・取得・更新・削除)</Text>
        <Text style={styles.infoText}>• 交換記録 (作成・取得・更新・削除)</Text>
        <Text style={styles.infoText}>• 画像アップロード</Text>
        <Text style={styles.infoText}>• セキュアストレージ</Text>
      </View>

      <View style={styles.statusBox}>
        <Text style={styles.statusTitle}>API設定:</Text>
        <Text style={styles.statusText}>Base URL: https://api.flocka.net</Text>
        <Text style={styles.statusText}>ストレージ: expo-secure-store</Text>
        <Text style={styles.statusText}>認証: JWT Bearer Token</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
    paddingLeft: 10,
  },
  statusBox: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976d2',
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#1565c0',
    fontFamily: 'monospace',
  },
});
