import Entypo from '@expo/vector-icons/Entypo';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";

// 名刺の標準サイズ（91mm × 55mm）
const CARD_WIDTH_MM = 91;
const CARD_HEIGHT_MM = 55;
const CARD_ASPECT_RATIO = CARD_WIDTH_MM / CARD_HEIGHT_MM; // 約1.65:1
const CARD_WIDTH = 910; // 出力幅（ピクセル）- 91mmの10倍
const CARD_HEIGHT = 550; // 出力高（ピクセル）- 55mmの10倍

export default function CardUpload() {
  const [image, setImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // 編集を有効にして強制クロップ
      aspect: [91, 55], // 名刺の実際のサイズ比率（91mm × 55mm）
      quality: 0.8, // 圧縮品質80%
    });

    if (!result.canceled) {
      // さらなる圧縮とリサイズを実行
      try {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [
            { resize: { width: CARD_WIDTH, height: CARD_HEIGHT } }, // 名刺サイズ（910×550px）にリサイズ
          ],
          {
            compress: 0.7, // 70%圧縮
            format: ImageManipulator.SaveFormat.JPEG,
          }
        );
        setImage(manipulatedImage.uri);
        
        // ファイルサイズを取得（概算）
        const response = await fetch(manipulatedImage.uri);
        const blob = await response.blob();
        const sizeInKB = Math.round(blob.size / 1024);
        setImageSize(`${sizeInKB}KB`);
      } catch (error) {
        console.error('Image processing failed:', error);
        // 処理に失敗した場合は元の画像を使用
        setImage(result.assets[0].uri);
        setImageSize(null);
      }
    }
  };

  const handleNext = () => {
    if (!image) {
      Alert.alert("画像が選択されていません", "アップロードする画像を選択してください。");
      return;
    }
    router.push({
      pathname: "/card-upload-flow/input-basic-info",
      params: { imageUri: image },
    });
  };

  return (
    <View className="flex-1 items-center justify-center">
      <View className="text-start mb-10">
        <Text className="text-xl font-bold">名刺を選択</Text>
        <Text className="text-gray-400">名刺サイズ（91×55mm）で切り取り・自動調整されます</Text>
        <Text className="text-gray-400">サポートされている形式: PNG, JPG</Text>
      </View>
      <View className="items-center">
        {image ? (
          <Image
            source={{ uri: image }}
            className="border border-gray-300 rounded-lg"
            style={{
              width: 350, 
              height: Math.round(350 / CARD_ASPECT_RATIO), // 名刺比率を維持（350×212px）
              aspectRatio: CARD_ASPECT_RATIO 
            }}
            resizeMode="cover"
          />
        ) : (
          <Pressable
            onPress={pickImage}
            className="flex-col items-center justify-center bg-white border border-gray-300 border-dashed rounded-lg"
            style={{
              width: 350, 
              height: Math.round(350 / CARD_ASPECT_RATIO), // 名刺比率を維持（350×212px）
              aspectRatio: CARD_ASPECT_RATIO 
            }}
          >
            <Entypo name="image" size={32} color="gray" />
            <Text className="text-lg font-bold text-gray-400 mt-2">名刺を選択</Text>
          </Pressable>
        )}
        <Text className="text-xs text-gray-500 mt-2">
          名刺サイズ（91×55mm、910×550px）{imageSize && ` • ${imageSize}`}
        </Text>
        {image && (
          <Pressable
            onPress={pickImage}
            className="mt-3 px-4 py-2 bg-gray-100 rounded-lg"
          >
            <Text className="text-sm text-gray-700">名刺を変更</Text>
          </Pressable>
        )}
      </View>
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
