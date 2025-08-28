import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import "../global.css";

export default function HomeScreen() {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        if (user.email_verified) {
          // メール認証済みの場合はホーム画面へ
          router.replace('/(tabs)/home');
        } else {
          // メール認証が未完了の場合は認証画面へ
          router.replace('/sign-up-auth');
        }
      }
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#000000" />
        <Text className="mt-4 text-lg">読み込み中...</Text>
      </View>
    );
  }

  // 未認証の場合はスタート画面を表示
  return (
    <View className="flex-1 items-center justify-center ">
      <Image source={require("../assets/images/flocka-app-icon.png")}
      className='w-28 h-28 mb-12'
      resizeMode='contain'/>
      <Text className='text-xl font-extrabold mb-48'>flocka</Text>
      <View className='w-full px-16'>
        <Pressable onPress={()=>router.navigate('/sign-up')} className='bg-black h-16 items-center justify-center rounded-lg'>
          <Text className="text-xl font-bold text-white">
            新規登録
          </Text>
        </Pressable>
      </View>
      <View className='w-full px-16 '>
        <Pressable onPress={()=>router.navigate('/sign-in')} className="h-16 items-center justify-center border border-gray-400 mt-12 rounded-lg">
          <Text className="text-xl font-bold">
            ログイン
          </Text>
        </Pressable>
      </View>
      <View className='flex-row mt-8'>
        <Pressable onPress={() => console.log("click")}>
          <Text className='text-xs underline'>利用規約</Text>
        </Pressable>
        <Text className="text-xs"> と </Text>
        <Pressable onPress={() => console.log("click")}>
          <Text className='text-xs underline'>プライバシーポリシー</Text>
        </Pressable>
        <Text className="text-xs">に同意してflockaを利用します。</Text>
      </View>
      </View>
  );
}
