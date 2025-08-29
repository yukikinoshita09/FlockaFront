import { apiClient } from '@/utils/api';
import Entypo from '@expo/vector-icons/Entypo';
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";

type InputData = {
  sns: string;
  link: string;
};

export default function InputLinks() {
  const { imageUri, name, bio } = useLocalSearchParams<{ 
    imageUri: string;
    name: string;
    bio: string;
  }>();
  const [sns, setSns] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [datas, setDatas] = useState<InputData[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // 名刺の標準サイズ（91mm × 55mm）
  const CARD_ASPECT_RATIO = 91 / 55; // 約1.65:1

  // URL入力のハンドラー - 入力中は https:// を強制しない
  const handleLinkChange = (text: string) => {
    // http:// を https:// に置換するだけ、それ以外はそのまま受け取る
    if (text.startsWith('http://')) {
      setLink('https://' + text.substring(7));
    } else {
      setLink(text);
    }
  };

  // URL初期化時にhttps://を設定（何も入力されていない場合のみ）
  const initializeLink = () => {
    if (link === '') {
      setLink('https://');
    }
  };

  const handleSetValue = () => {
    if (datas.length >= 4) {
      Alert.alert("制限エラー", "リンクは最大4つまでです。");
      return;
    }
    if (!sns.trim() || !link.trim()) {
      Alert.alert("入力エラー", "SNS名とURLの両方を入力してください。");
      return;
    }
    
    // 追加時にスキームがなければ https:// を自動付与する
    let finalLink = link.trim();
    if (!finalLink.startsWith('http://') && !finalLink.startsWith('https://')) {
      finalLink = 'https://' + finalLink;
    }

    // https:// または http:// で始まっているかチェック
    if (!finalLink.startsWith('https://') && !finalLink.startsWith('http://')) {
      Alert.alert("URLエラー", "URLはhttps://またはhttp://で始まる必要があります。");
      return;
    }
    
    // https:// のあとに実際のURLがあるかチェック
    if (finalLink === 'https://' || finalLink === 'http://' || finalLink.length <= 8) {
      Alert.alert("URLエラー", "有効なURLを入力してください。");
      return;
    }
    
    const newDatas = [...datas, { sns, link: finalLink }];
    setDatas(newDatas);
    console.log(newDatas);

    setSns("");
    setLink("");
  };

  const removeLink = (index: number) => {
    const newDatas = datas.filter((_, i) => i !== index);
    setDatas(newDatas);
  };

  const handleCreateCard = async () => {
    if (!name?.trim()) {
      Alert.alert("エラー", "名前が設定されていません。");
      return;
    }
    
    if (!imageUri) {
      Alert.alert("エラー", "画像が選択されていません。");
      return;
    }

    setIsCreating(true);

    try {
      // 1. 画像をアップロード
      console.log('画像をアップロード中...');
      const { imageKey } = await apiClient.uploadImage(imageUri);
      console.log('画像アップロード完了:', imageKey);

      // 2. カードを作成
      console.log('カードを作成中...');
      const cardData = {
        card_name: name.trim(),
        bio: bio?.trim() || "",
        image_key: imageKey,
        links: datas.map(data => ({
          title: data.sns,
          url: data.link
        }))
      };

      const newCard = await apiClient.createCard(cardData);
      console.log('カード作成完了:', newCard);

      // 3. 成功メッセージと画面遷移
      Alert.alert("完了", "名刺が作成されました！", [
        { 
          text: "OK", 
          onPress: () => {
            // ホーム画面に戻る
            router.push("/(tabs)/home");
          }
        }
      ]);

    } catch (error) {
      console.error('カード作成エラー:', error);
      Alert.alert(
        "エラー", 
        error instanceof Error ? error.message : "名刺の作成に失敗しました。もう一度お試しください。"
      );
    } finally {
      setIsCreating(false);
    }
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
          
          {/* 基本情報表示 */}
          <View className="mt-4 p-3 bg-white rounded-lg">
            <Text className="text-sm font-medium text-gray-700">名前: {name}</Text>
            {bio && <Text className="text-xs text-gray-600 mt-1">自己紹介: {bio}</Text>}
          </View>
        </View>

        {/* SNSリンク設定部分 */}
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-lg font-semibold mb-4">SNSリンク設定</Text>
          <Text className="text-sm text-gray-600 mb-4">最大4つまでリンクを追加できます ({datas.length}/4)</Text>
          
          {/* 既に追加されたリンク */}
          {datas.map((data, index) => (
            <View key={index} className="flex-row items-center gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700">{data.sns}</Text>
                <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>{data.link}</Text>
              </View>
              <Pressable
                onPress={() => removeLink(index)}
                className="p-2"
              >
                <Entypo name="cross" size={16} color="#ef4444" />
              </Pressable>
            </View>
          ))}
          
          {/* 新しいリンクを追加するフォーム */}
          {datas.length < 4 && (
            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">新しいリンクを追加</Text>
              <View className="gap-3">
                <TextInput
                  placeholder="SNS名 (例: Instagram, Twitter)"
                  value={sns}
                  onChangeText={setSns}
                  className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white"
                  autoCapitalize="none"
                />
                <TextInput
                  placeholder="instagram.com/username"
                  value={link}
                  onChangeText={handleLinkChange}
                  onFocus={initializeLink}
                  className="border border-gray-300 rounded-lg px-3 py-3 text-base bg-white"
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <Text className="text-xs text-gray-500 -mt-2">※ https://で始まるURLのみ対応</Text>
                <Pressable
                  onPress={handleSetValue}
                  className="p-3 bg-gray-600 rounded-lg items-center"
                  disabled={!sns.trim() || !link.trim() || link.trim().length <= 3}
                  style={{
                    opacity: (!sns.trim() || !link.trim() || link.trim().length <= 3) ? 0.5 : 1
                  }}
                >
                  <Text className="text-white font-medium">リンクを追加</Text>
                </Pressable>
              </View>
            </View>
          )}
          
          {datas.length >= 4 && (
            <View className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Text className="text-amber-700 text-sm text-center">リンクは最大4つまでです</Text>
            </View>
          )}
        </View>
      </View>

      {/* ナビゲーションボタン */}
      <View className="flex-row gap-4 p-4 pb-8">
        <Pressable
          onPress={() => router.back()}
          className="flex-1 py-3 rounded-lg bg-white border border-gray-300 items-center justify-center"
          disabled={isCreating}
          style={{
            opacity: isCreating ? 0.5 : 1
          }}
        >
          <Text className="text-lg font-medium text-gray-700">戻る</Text>
        </Pressable>
        <Pressable
          onPress={handleCreateCard}
          className="flex-1 py-3 rounded-lg bg-black items-center justify-center"
          disabled={isCreating}
          style={{
            opacity: isCreating ? 0.7 : 1
          }}
        >
          <View className="flex-row items-center">
            {isCreating && (
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
            )}
            <Text className="text-lg font-bold text-white">
              {isCreating ? "作成中..." : "名刺を作成"}
            </Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
