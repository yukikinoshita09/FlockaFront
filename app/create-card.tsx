import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function CreateCard() {
  return (
    <View className="flex-1 items-center justify-center ">
      <Text className="text-xl font-bold">
        名刺作成
      </Text>
      <Pressable onPress={() => console.log('click')} className="mt-4 p-2 bg-white border border-gray-100">
        <Text className="text-xl font-bold">
          テンプレートから作成
        </Text>
      </Pressable>
      <Pressable onPress={() => router.navigate('/card-upload')} className="mt-4 p-2 bg-white border border-gray-100">
        <Text className="text-xl font-bold">
          名刺をアップロード
        </Text>
      </Pressable>
    </View>
  );
}
