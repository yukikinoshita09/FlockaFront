import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { apiClient } from "../utils/api";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSignUp = async () => {
    // 入力値チェック
    if (!email.trim() || !password.trim()) {
      if (!email.trim() && !password.trim()) {
        Alert.alert(
          "入力エラー", 
          "すべての項目を入力してください。",
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

    // パスワードの長さチェック
    if (password.length < 8) {
      Alert.alert(
        "入力エラー",
        "パスワードは8文字以上で入力してください。",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    setIsLoading(true);
    try {
      // API接続テスト
      const isConnected = await apiClient.testConnection();
      console.log('API Connection test:', isConnected);

      await apiClient.register(email.trim(), null, password);

      // 登録成功時
      router.replace({
        pathname: '/sign-up-auth',
        params: { email: email.trim() }
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Email already exists') || error.message.includes('already registered')) {
          Alert.alert(
            "登録エラー",
            "このメールアドレスは既に登録されています。\n\n• 別のメールアドレスで登録してください\n• 既にアカウントをお持ちの場合はログイン画面をご利用ください",
            [
              {
                text: "ログイン画面へ",
                onPress: () => router.navigate('/sign-in')
              },
              {
                text: "再入力",
                style: "cancel"
              }
            ]
          );
        } else if (error.message.includes('Invalid email format')) {
          Alert.alert(
            "入力エラー",
            "正しいメールアドレスの形式で入力してください。",
            [{ text: "OK", style: "default" }]
          );
        } else if (error.message.includes('Password must be at least')) {
          Alert.alert(
            "入力エラー",
            "パスワードは8文字以上で入力してください。",
            [{ text: "OK", style: "default" }]
          );
        } else if (error.message.includes('Name is required')) {
          Alert.alert(
            "入力エラー",
            "名前を入力してください。",
            [{ text: "OK", style: "default" }]
          );
        } else if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
          Alert.alert(
            "接続エラー",
            "インターネット接続を確認してから、もう一度お試しください。",
            [
              {
                text: "再試行",
                onPress: () => handleSignUp()
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
                onPress: () => handleSignUp()
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
        } else {
          // その他のエラー
          Alert.alert(
            "登録エラー",
            "アカウントの登録に失敗しました。しばらく時間をおいてから再度お試しください。",
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
    <View className="flex-1 items-center justify-center">
      <View className="items-center">
        <Image
          source={require("../assets/images/flocka-app-icon.png")}
          className="w-28 h-28"
          resizeMode="contain">
        </Image>
        <Text className='text-xl font-extrabold mt-6'>flocka</Text>
      </View>
      <View className="w-full px-16 mt-4">
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
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ padding: 8 }}
            >
              <Ionicons
          name={showPassword ? "eye" : "eye-off"}
          size={28}
          color="gray"
              />
            </TouchableOpacity>
          </View>
        </View>
        <Pressable onPress={() => console.log("click")}>
          <Text className="text-base mt-2 left text-gray-400">半角英数字のみ・8文字以上</Text>
        </Pressable>
      </View>
      <View className='w-full px-16 mt-16'>
        <Pressable 
          onPress={handleSignUp} 
          className={`h-16 items-center justify-center rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-black'}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-xl font-bold text-white">
              新規登録
            </Text>
          )}
        </Pressable>
      </View>
      <View className='w-full px-16'>
        <Pressable onPress={() => router.navigate('/sign-in')} className="h-16 items-center justify-center mt-2">  
          <Text className="text-xl font-bold">
            ログインはこちら
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
