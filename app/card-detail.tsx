import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Modal, Pressable, Text, TextInput, View } from "react-native";
import { apiClient } from "../utils/api";

interface ExchangeDetail {
  id: string;
  card: {
    id: string;
    card_name: string;
    image_key?: string;
    image_url?: string;
    bio?: string | null;
    links?: {
      title: string;
      url: string;
    }[];
    owner_name?: string;
  };
  memo?: string;
  location_name?: string;
  created_at: string;
}

export default function CardDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exchangeData, setExchangeData] = useState<ExchangeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [memo, setMemo] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  // データ取得
  useEffect(() => {
    const fetchExchangeDetail = async () => {
      if (!id) {
        setError('交換IDが指定されていません');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // 一旦コレクション一覧を取得して、該当するアイテムを探す
        // (個別エンドポイントが404のため)
        const collections = await apiClient.getCollection();
        const targetExchange = collections.find(item => item.id === id);
        
        if (!targetExchange) {
          setError('指定されたカードが見つかりません');
          return;
        }
        
        setExchangeData(targetExchange);
        setMemo(targetExchange.memo || "");
      } catch (err) {
        console.error('Failed to fetch exchange detail:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeDetail();
  }, [id]);

  // メモ更新処理
  const handleUpdateMemo = async () => {
    if (!id || !exchangeData) return;

    try {
      setUpdating(true);
      
      // API エンドポイントが存在しない場合のフォールバック
      // 一旦ローカル状態のみ更新
      setExchangeData({
        ...exchangeData,
        memo: memo
      });
      
      setModalVisible(false);
      Alert.alert('メモ更新', 'メモがローカルに保存されました\n（サーバー同期は今後実装予定）');
    } catch (err) {
      console.error('Failed to update memo:', err);
      Alert.alert('エラー', 'メモの更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  // ローディング中の表示
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">カード詳細を読み込み中...</Text>
      </View>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-4 bg-gray-100">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white">戻る</Text>
        </Pressable>
      </View>
    );
  }

  // データが存在しない場合
  if (!exchangeData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text className="text-gray-500 text-center">カード情報が見つかりません</Text>
      </View>
    );
  }

  // 背景色を#ecebebに変更
  return (
    <View className="flex-1 items-center justify-center px-10" style={{ backgroundColor: '#ecebeb' }}>
      <Image
        source={{ 
          uri: exchangeData.card.image_url?.replace('https://flocka-storage.kazu3jp-purin.workers.dev/', 'https://img.flocka.net/') || `https://img.flocka.net/cards/image/${exchangeData.card.image_key}` || 'https://via.placeholder.com/250',
        }}
        className="w-full border border-gray-300 mb-8"
        style={{ aspectRatio: 1.5, height: 250 }}
        resizeMode="cover"
        onError={(error) => {
          console.error("Image load error:", error.nativeEvent);
          Alert.alert("画像エラー", "画像を読み込むことができませんでした。");
        }}
      />
      <View className="bg-white p-6 rounded-lg w-full flex-col items-center shadow-gray-200 shadow-sm">
        <Text className="text-2xl font-bold mb-4">{exchangeData.card.card_name}</Text>
        {exchangeData.card.bio && (
          <Text className="text-gray-600 text-sm mb-4 text-center">{exchangeData.card.bio}</Text>
        )}
        {/* 各種リンク */}
        {exchangeData.card.links && exchangeData.card.links.length > 0 ? (
          <View className="flex-row gap-4 mb-4 flex-wrap justify-center">
            {exchangeData.card.links.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => Linking.openURL(item.url)}
                className="min-w-32 p-3 rounded-lg border border-gray-300 items-center"
              >
                <Text className="text-center font-medium text-xs">{item.title}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text className="text-gray-500 mb-4">リンクなし</Text>
        )}
        {/* 交換場所 */}
        {exchangeData.location_name && (
          <Text className="text-gray-500 text-sm mb-2">
            📍 {exchangeData.location_name}
          </Text>
        )}
        {/* 交換日時 */}
        <Text className="text-gray-500 text-sm mb-4">
          📅 {new Date(exchangeData.created_at).toLocaleDateString('ja-JP')}
        </Text>
        {/* メモ */}
        <Pressable onPress={() => setModalVisible(true)} className="border border-gray-300 p-4 rounded-lg w-full">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              {exchangeData.memo ? (
                <Text className="font-semibold text-sm">{exchangeData.memo}</Text>
              ) : (
                <Text className="text-gray-400 text-sm">メモを追加...</Text>
              )}
            </View>
            <MaterialIcons name="edit" size={24} color="gray" />
          </View>
        </Pressable>
        {/* モーダル */}
        {modalVisible && (
          <Modal
            transparent
            onRequestClose={() => setModalVisible(false)}
          >
            <View className="flex-1 items-center justify-center bg-black/30">
              <View className="w-80 bg-white rounded-2xl p-6 shadow-gray-200 shadow-sm">
                {/* 閉じるボタン */}
                <Pressable
                  onPress={() => setModalVisible(false)}
                  className="mb-4 self-end"
                >
                  <MaterialIcons name="close" size={28} color="black" />
                </Pressable>
                {/* メモ入力 */}
                <TextInput
                  placeholder="メモを入力"
                  value={memo}
                  onChangeText={setMemo}
                  multiline
                  numberOfLines={4}
                  className="border border-gray-300 rounded p-2 w-full h-28 mb-4"
                />
                {/* 変更を反映 */}
                <Pressable
                  className={`rounded w-full p-4 mb-4 ${updating ? 'bg-gray-400' : 'bg-black'}`}
                  onPress={handleUpdateMemo}
                  disabled={updating}
                >
                  {updating ? (
                    <View className="flex-row items-center justify-center">
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white font-bold ml-2">更新中...</Text>
                    </View>
                  ) : (
                    <Text className="text-white font-bold text-center">変更を反映する</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </View>
  );
}
