import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";

export default function InputBasicInfo() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [name, setName] = useState<string>("");
  const [bio, setBio] = useState<string>("");

  // 名刺の標準サイズ（91mm × 55mm）
  const CARD_ASPECT_RATIO = 91 / 55; // 約1.65:1

  const handleNext = () => {
    if (!name.trim()) {
      Alert.alert("入力エラー", "名前を入力してください。");
      return;
    }
    
    // 次のページ（SNSリンク設定）に移動
    router.push({
      pathname: "/card-upload-flow/input-links",
      params: { 
        imageUri,
        name: name.trim(),
        bio: bio.trim()
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
      enabled={true}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView 
          className="flex-1 bg-gray-50" 
          keyboardShouldPersistTaps="handled" 
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingBottom: Platform.OS === 'ios' ? 20 : 0 
          }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          contentInsetAdjustmentBehavior={Platform.OS === 'ios' ? 'automatic' : undefined}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios' ? true : false}
        >
          <View className="p-4">
        {/* 名刺プレビュー */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">名刺プレビュー</Text>
          <View className="items-center">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="border border-gray-300 rounded-lg shadow-sm"
                style={{ 
                  width: 280, 
                  height: Math.round(280 / CARD_ASPECT_RATIO), // 名刺比率を維持
                  aspectRatio: CARD_ASPECT_RATIO 
                }}
                resizeMode="cover"
              />
            ) : (
              <View 
                className="bg-gray-100 border border-gray-300 rounded-lg items-center justify-center"
                style={{ 
                  width: 280, 
                  height: Math.round(280 / CARD_ASPECT_RATIO),
                }}
              >
                <Text className="text-gray-400">名刺画像</Text>
              </View>
            )}
          </View>
        </View>

        {/* 名刺情報入力 */}
        <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <Text className="text-lg font-semibold mb-4">基本情報</Text>
          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">名前 *</Text>
              <TextInput
                placeholder="趣味の名刺"
                value={name}
                onChangeText={setName}
                className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white"
                maxLength={50}
              />
            </View>
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                自己紹介 ({bio.length}/80)
              </Text>
              <TextInput
                placeholder="簡単な自己紹介やプロフィールを入力"
                value={bio}
                onChangeText={setBio}
                className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white"
                multiline
                numberOfLines={3}
                maxLength={80}
                textAlignVertical="top"
              />
              <Text className="text-xs text-gray-500 mt-1">趣味や一言メッセージなど</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ナビゲーションボタン */}
      <View className="flex-row gap-4 p-4 pb-8">
        <Pressable
          onPress={() => router.back()}
          className="flex-1 py-3 rounded-lg bg-white border border-gray-300 items-center justify-center"
        >
          <Text className="text-lg font-medium text-gray-700">戻る</Text>
        </Pressable>
        <Pressable
          onPress={handleNext}
          className="flex-1 py-3 rounded-lg bg-black items-center justify-center"
          disabled={!name.trim()}
          style={{
            opacity: !name.trim() ? 0.5 : 1
          }}
        >
          <Text className="text-lg font-bold text-white">次へ</Text>
        </Pressable>
      </View>
      
      {!name.trim() && (
        <Text className="text-xs text-gray-500 text-center pb-4">
          ※ 名前の入力が必要です
        </Text>
      )}
    </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
