import { router } from "expo-router";
import { Pressable, Text, View, Image } from "react-native";

export default function CreateCard() {
  return (
    <View className="flex-1 items-center justify-center ">
      <Text className="text-2xl font-bold">
        名刺作成
      </Text>
      <View className="flex-col gap-6 mt-10">
        <Pressable onPress={() => console.log('click')} className="flex-col items-center p-4 bg-white border border-gray-100 shadow shadow-gray-200 rounded">
          <Image
            source={require('../assets/images/create-template-sample.png')}
            className="w-80 h-48"
            resizeMode="contain"
          />
          <Text className="text-xl font-bold">
            テンプレートから作成
          </Text>
        </Pressable>
        <Pressable onPress={() => router.navigate('/card-upload')} className="flex-col items-center p-4 bg-white border border-gray-100 shadow shadow-gray-200 rounded">
          <Image
            source={require('../assets/images/upload-card-sample.png')}
            className="w-80 h-48"
            resizeMode="contain"
          />
          <Text className="text-xl font-bold">
            名刺をアップロード
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
