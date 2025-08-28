import { router } from "expo-router";
import { Pressable, Text, View, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import Entypo from '@expo/vector-icons/Entypo';

export default function CardUpload() {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!image) {
      Alert.alert("画像が選択されていません", "アップロードする画像を選択してください。");
      return;
    }
    router.push({
      pathname: "/card-upload-flow/input-info",
      params: { imageUri: image },
    });
  };

  return (
    <View className="flex-1 items-center justify-center">
      <View className="text-start mb-10">
        <Text className="text-xl font-bold">名刺をアップロード</Text>
        <Text className="text-gray-400">サポートされている形式: PNG, JPG</Text>
      </View>
      {image ? (
        <Image
          source={{ uri: image }}
          className="w-96 h-48 mt-4"
          resizeMode="contain"
        />
      ) : (
        <Pressable
          onPress={pickImage}
          className="flex-col items-center mt-4 px-20 py-20 bg-white border border-gray-300 border-dashed"
        >
          <Entypo name="image" size={24} color="gray" />
          <Text className="text-xl font-bold text-gray-400">名刺をアップロード</Text>
        </Pressable>
      )}
      <View className="flex-row gap-4 mt-10 px-4">
        <Pressable
          onPress={() => router.back()}
          className="flex-1 py-3 rounded bg-white items-center justify-center"
        >
          <Text className="text-xl font-bold">キャンセル</Text>
        </Pressable>
        <Pressable
          onPress={handleNext}
          className="flex-1 py-3 rounded bg-black items-center justify-center"
        >
          <Text className="text-xl font-bold text-white">次へ</Text>
        </Pressable>
      </View>
    </View>
  );
}
