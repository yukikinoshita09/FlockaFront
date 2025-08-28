import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ListRenderItem,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import QRExchangeLogPreview from "../../components/QRExchangeLogPreview";
import { useQRExchangeNotifications } from "../../hooks/useQRExchangeNotifications";
import { apiClient, Card } from "../../utils/api";

// データ型
type ItemData = {
  id: string;
  image?: any;
  type: 'card' | 'add';
  card?: Card; // APIから取得した名刺データ
};

// 単一アイテム
type ItemProps = {
  item: ItemData;
  onPress: () => void;
  isSelected: boolean;
};

const Item = ({ item, onPress, isSelected }: ItemProps) => {
  if (item.type === 'add') {
    return (
      <TouchableOpacity
        onPress={() => router.navigate('/create-card')}
        className="w-80 h-48 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center bg-gray-100"
        style={{ width: 320, height: 192 }}
      >
        <Entypo name="plus" size={48} color="gray" />
        <Text className="mt-2 text-gray-600">新しい名刺を作成</Text>
      </TouchableOpacity>
    );
  }

  // 名刺データがある場合は実際の名刺画像を表示
  if (item.card && item.card.image_key) {
    return (
      <View style={{ width: 320 }}>
        <TouchableOpacity
          onPress={onPress}
          className={`w-80 ${isSelected ? 'border-4 border-blue-500' : ''}`}
          style={{ width: 320 }}
        >
          <Image
            source={{ uri: apiClient.getCardImageUrl(item.card.image_key) }}
            resizeMode="contain"
            className="w-full h-48"
            style={{ width: 320, height: 192 }}
          />
        </TouchableOpacity>
        <Text className="text-center mt-2 text-lg font-medium text-black">
          {item.card.card_name}
        </Text>
      </View>
    );
  }

  // フォールバック（サンプル画像）
  return (
    <View style={{ width: 320 }}>
      <TouchableOpacity
        onPress={onPress}
        className={`w-80 ${isSelected ? 'border-4 border-blue-500' : ''}`}
        style={{ width: 320 }}
      >
        <Image
          source={require("../../assets/images/sample-profile-card.png")}
          resizeMode="contain"
          className="w-full"
        />
      </TouchableOpacity>
      <Text className="text-center mt-2 text-lg font-medium text-black">
        {item.card?.card_name || "サンプル名刺"}
      </Text>
    </View>
  );
};

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cards, setCards] = useState<ItemData[]>([{ id: "add", type: "add" }]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [qrValue, setQrValue] = useState<string>("Hello, QR Code!");
  const [isGeneratingQR, setIsGeneratingQR] = useState<boolean>(false);

  // QR交換通知をチェック
  const { 
    newExchangeLog, 
    showPreview, 
    closePreview 
  } = useQRExchangeNotifications();

  // 画面幅を取得
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = 320;
  const cardSpacing = 12;
  const itemWidth = cardWidth + cardSpacing;
  
  // 左右の余白を計算（名刺が画面中央に来るように）
  const sideMargin = (screenWidth - cardWidth) / 2;

  // 各名刺が中央に来る位置を計算
  const snapOffsets = cards.map((_, index: number) => {
    return index * itemWidth;
  });

  // 名刺データを取得
  const fetchCards = async () => {
    try {
      setIsLoading(true);
      const apiCards = await apiClient.getMyCards();
      
      // 追加ボタン + APIから取得した名刺
      const allItems: ItemData[] = [
        { id: "add", type: "add" },
        ...apiCards.map((card: Card) => ({
          id: card.id,
          type: 'card' as const,
          card: card
        }))
      ];
      
      setCards(allItems);
      
      // 初期選択を最初の名刺に設定（追加ボタンではない）
      if (apiCards.length > 0) {
        const firstCardId = apiCards[0].id;
        setSelectedId(firstCardId);
        // 初期名刺のQRコードを生成
        setTimeout(() => generateQRCode(firstCardId), 100);
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error);
      Alert.alert(
        "名刺取得エラー",
        "名刺情報の取得に失敗しました。再度お試しください。",
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 初回ロード時に名刺を取得
  useEffect(() => {
    fetchCards();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // QRコードを生成
  const generateQRCode = async (cardId: string) => {
    if (!cardId || cardId === "add") return;
    
    try {
      setIsGeneratingQR(true);
      const qrData = await apiClient.generateQRCode(cardId);
      setQrValue(qrData.qrData);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      Alert.alert(
        "QRコード生成エラー",
        "QRコードの生成に失敗しました。再度お試しください。",
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // 名刺選択時にQRコードを更新
  useEffect(() => {
    if (selectedId && selectedId !== "add") {
      generateQRCode(selectedId);
    }
  }, [selectedId]);

  const renderItem: ListRenderItem<ItemData> = ({ item }) => (
    <Item
      item={item}
      onPress={() => setSelectedId(item.id)}
      isSelected={item.id === selectedId}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center justify-center px-4 py-6">
          <View className="flex-col items-center gap-8 w-full">
            {/* QRコード表示エリア */}
            <View className="items-center">
              {isGeneratingQR ? (
                <View className="w-52 h-52 items-center justify-center bg-white rounded-lg border border-gray-200 shadow-gray-200 shadow-sm">
                  <ActivityIndicator size="large" color="#000000" />
                  <Text className="mt-2 text-sm text-gray-600">QR生成中...</Text>
                </View>
              ) : (
                <View className="shadow-md shadow-gray-200 rounded-lg">
                  <View className="bg-white rounded-lg overflow-hidden">
                    <QRCode value={qrValue} size={200} quietZone={20} />
                  </View>
                </View>
              )}
              {selectedId && selectedId !== "add" && (
                <Text className="mt-2 text-sm text-gray-600">
                  選択中の名刺の交換用QR
                </Text>
              )}
            </View>

            {/* アクションボタン */}
            <View className="flex-row gap-8 justify-center">
              <Pressable onPress={()=>console.log('ble')} className="items-center">
                <View className="bg-white p-4 rounded-full shadow-gray-200 shadow-sm">
                  <MaterialCommunityIcons name="cellphone-wireless" size={24} color="black" />
                </View>
                <Text className="mt-2">近くの人と</Text>
              </Pressable>
              <Pressable onPress={()=>console.log('url')} className="items-center">
                <View className="bg-white p-4 rounded-full shadow-gray-200 shadow-sm">
                  <Entypo name="link" size={24} color="black" />
                </View>
                <Text className="mt-2">コードを送る</Text>
              </Pressable>
              <Pressable onPress={()=>{
                if (selectedId && selectedId !== "add") {
                  router.push(`/scan-qr?selectedCardId=${selectedId}`);
                } else {
                  Alert.alert(
                    "名刺を選択してください",
                    "交換する名刺を選択してからQRコードを読み取ってください。",
                    [{ text: "OK", style: "default" }]
                  );
                }
              }} className="items-center">
                <View className="bg-white p-4 rounded-full shadow-gray-200 shadow-sm">    
                  <MaterialCommunityIcons name="qrcode-scan" size={24} color="black" />
                </View>
                <Text className="mt-2">読み取る</Text>
              </Pressable>
            </View>

            {/* 名刺一覧 */}
            <View className="w-full">
              {isLoading ? (
                <View className="flex-1 items-center justify-center h-72">
                  <ActivityIndicator size="large" color="#000000" />
                  <Text className="mt-2">名刺を読み込み中...</Text>
                </View>
              ) : (
                <FlatList
                  className="max-h-72"
                  data={cards}
                  horizontal
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  extraData={selectedId}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ 
                    paddingLeft: sideMargin - cardSpacing/2, 
                    paddingRight: sideMargin - cardSpacing/2 
                  }}
                  ItemSeparatorComponent={() => <View style={{ width: cardSpacing }} />}
                  snapToOffsets={snapOffsets}
                  decelerationRate="fast"
                  pagingEnabled={false}
                  initialScrollIndex={cards.length > 1 ? 1 : 0} // 最初の名刺を中央に表示
                  getItemLayout={(data, index) => ({
                    length: itemWidth,
                    offset: itemWidth * index,
                    index,
                  })}
                />
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* QR交換通知プレビュー */}
      <QRExchangeLogPreview
        visible={showPreview}
        onClose={closePreview}
        exchangeLog={newExchangeLog}
      />
    </SafeAreaView>
  );
}
