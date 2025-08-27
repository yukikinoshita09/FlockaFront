import { router } from 'expo-router';
import { Pressable, Text, View } from "react-native";
import "../global.css";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center ">
      <Pressable onPress={()=>router.navigate('/sign-up')}>
        <Text className="text-xl font-bold">
          新規登録
        </Text>
      </Pressable>
      <Pressable onPress={()=>router.navigate('/sign-in')} className="mt-4">
        <Text className="text-xl font-bold">
          ログイン
        </Text>
      </Pressable>
    </View>
  );
}
