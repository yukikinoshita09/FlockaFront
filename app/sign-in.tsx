import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../utils/api";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login } = useAuth();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      if (!email.trim() && !password.trim()) {
        Alert.alert(
          "入力エラー", 
          "メールアドレスとパスワードを入力してください。",
          [{ text: "OK", style: "default" }]
        );
      } else if (!email.trim()) {
        Alert.alert(
          "入力エラー", 
          "メールアドレスを入力してください。",
          [{ text: "OK", style: "default" }]
        );
      } else {
        Alert.alert(
          "入力エラー", 
          "パスワードを入力してください。",
          [{ text: "OK", style: "default" }]
        );
      }
      return;
    }

    // 簡単なメールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(
        "入力エラー",
        "正しいメールアドレスの形式で入力してください。\n例: user@example.com",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    setIsLoading(true);
    try {
      // API接続テスト
      const isConnected = await apiClient.testConnection();
      console.log('API Connection test:', isConnected);
      
      await login(email.trim(), password);
      
      // ログイン成功時はアラートを表示せずに直接遷移
      // AuthContextが自動的にリダイレクトを処理する
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Please verify your email')) {
          // メール認証が必要な場合は専用ページに遷移
          Alert.alert(
            "メール認証が必要です",
            "ログインにはメールアドレスの認証が必要です。認証を完了してからログインしてください。",
            [
              {
                text: "認証画面へ",
                onPress: () => {
                  router.replace({
                    pathname: '/sign-up-auth',
                    params: { email: email.trim() }
                  });
                }
              },
              {
                text: "キャンセル",
                style: "cancel"
              }
            ]
          );
          return;
        } else if (error.message.includes('Invalid email or password')) {
          Alert.alert(
            "ログイン失敗",
            "メールアドレスまたはパスワードが正しくありません。\n\n• パスワードが間違っている可能性があります\n• 大文字・小文字も正確に入力してください\n• アカウントが存在しない可能性があります",
            [
              {
                text: "パスワードを忘れた場合",
                style: "destructive",
                onPress: () => {
                  Alert.alert(
                    "パスワードリセット",
                    "パスワードリセット機能は現在準備中です。サポートにお問い合わせください。",
                    [{ text: "OK", style: "default" }]
                  );
                }
              },
              {
                text: "再入力",
                style: "default"
              }
            ]
          );
        } else if (error.message.includes('Email and password are required')) {
          Alert.alert(
            "入力エラー",
            "メールアドレスとパスワードを入力してください。",
            [
              {
                text: "OK",
                style: "default"
              }
            ]
          );
        } else if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
          Alert.alert(
            "接続エラー",
            "インターネット接続を確認してから、もう一度お試しください。",
            [
              {
                text: "再試行",
                onPress: () => handleSignIn()
              },
              {
                text: "キャンセル",
                style: "cancel"
              }
            ]
          );
        } else if (error.message.includes('timeout')) {
          Alert.alert(
            "タイムアウトエラー",
            "サーバーへの接続がタイムアウトしました。しばらく時間をおいてから再度お試しください。",
            [
              {
                text: "再試行",
                onPress: () => handleSignIn()
              },
              {
                text: "キャンセル",
                style: "cancel"
              }
            ]
          );
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          Alert.alert(
            "サーバーエラー",
            "サーバーで一時的な問題が発生しています。しばらく時間をおいてから再度お試しください。",
            [
              {
                text: "OK",
                style: "default"
              }
            ]
          );
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          Alert.alert(
            "アクセスエラー",
            "アカウントがロックされているか、アクセスが制限されています。",
            [
              {
                text: "OK",
                style: "default"
              }
            ]
          );
        } else {
          // その他のエラー
          Alert.alert(
            "ログインエラー",
            "ログインできませんでした。しばらく時間をおいてから再度お試しください。",
            [
              {
                text: "OK",
                style: "default"
              }
            ]
          );
        }
      } else {
        // Error型でない場合
        Alert.alert(
          "予期しないエラー",
          "予期しないエラーが発生しました。アプリを再起動してからお試しください。",
          [
            {
              text: "OK",
              style: "default"
            }
          ]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <View className="items-center">
        <Image
          source={require("../assets/images/start-app-icon.png")}
          className="w-32 h-32 mt-14"
          resizeMode="contain">
        </Image>
        <Text className='text-4xl font-extrabold mt-10'>flocka</Text>
      </View>
      <View className="mx-14 mt-4">
        <View>
          <Text className='text-lg font-extrabold mt-16'>メールアドレス</Text>
          <TextInput
            placeholder="sample@example.com"
            className="mt-3 h-14 border border-gray-400 rounded-lg px-4 text-base"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <View className="mt-6">
          <View className="flex-row gap-5 items-center">
            <Text className='text-lg font-extrabold'>パスワード</Text>
            <Text className="text-sm text-gray-500">半角英数字のみ・8文字以上</Text>
          </View>
          <View className="mt-3 h-14 border border-gray-400 rounded-lg px-4 flex-row items-center">
            <TextInput
              placeholder="パスワードを入力"
              className="flex-1 text-base"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
        </View>
        <Pressable onPress={() => console.log("click")}>
          <Text className="text-sm mt-3 text-right text-blue-400">パスワードを忘れた方</Text>
        </Pressable>
      </View>
      <View className='w-full px-16 mt-16'>
        <Pressable 
          onPress={handleSignIn} 
          className={`h-16 items-center justify-center rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-black'}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-xl font-bold text-white">
              ログイン
            </Text>
          )}
        </Pressable>
      </View>
      <View className='w-full px-16'>
        <Pressable onPress={() => router.navigate('/sign-up')} className="h-16 items-center justify-center mt-2">  
          <Text className="text-xl font-bold">
            新規登録はこちら
          </Text>
        </Pressable>
      </View>
    </>
  );
}
