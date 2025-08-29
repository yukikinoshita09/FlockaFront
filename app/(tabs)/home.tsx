import { MaterialIcons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ListRenderItem,
  Pressable,
  RefreshControl,
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
        style={{
          width: cardWidth,
          height: cardHeight,
          borderRadius: 12, // 角丸
          marginTop: 8, // 上側の余白を追加
        }}
      >
        <Entypo name="plus" size={48} color="gray" />
        <Text className="mt-2 text-gray-600">新しい名刺を作成</Text>
      </TouchableOpacity>
    );
  }

  if (item.card && item.card.image_key) {
    return (
      <View
        style={{
          width: cardWidth,
          alignItems: 'center', // 上側のズレを修正
          marginTop: 8, // 上側の余白を追加
        }}
      >
        <TouchableOpacity
          onPress={onPress}
          onLongPress={() => {
            // 長押しで編集画面に遷移
            router.push(`/edit-card?id=${item.card?.id}`);
          }}
          className="w-80"
          style={{
            width: cardWidth,
            height: cardHeight,
            boxShadow: isSelected ? '0 0 0 4px #6d6d6d' : undefined, // 選択時に青い枠を表示
            borderRadius: 12, // 角丸
            overflow: 'hidden', // 画像が角丸に収まるように
          }}
        >
          <Image
            source={{ uri: apiClient.getCardImageUrl(item.card.image_key) }}
            resizeMode="contain"
            className="w-full h-48"
            style={{ width: cardWidth, height: cardHeight }}
          />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.push(`/edit-card?id=${item.card?.id}`)}
          className="flex-row items-center mt-2"
        >
          <Text className="text-center text-lg font-medium text-black mr-1">
            {item.card.card_name}
          </Text>
          <MaterialIcons name="edit" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={{
        width: cardWidth,
        alignItems: 'center', // 上側のズレを修正
        marginTop: 8, // 上側の余白を追加
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onLongPress={() => {
          // 長押しで編集画面に遷移（カードIDがある場合のみ）
          if (item.card?.id) {
            router.push(`/edit-card?id=${item.card.id}`);
          }
        }}
        className="w-80"
        style={{
          width: cardWidth,
          height: cardHeight,
          boxShadow: isSelected ? '0 0 0 4px #6d6d6d' : undefined, // 選択時にグレーの枠を表示
          borderRadius: 12, // 角丸
          overflow: 'hidden', // 画像が角丸に収まるように
        }}
      >
        <Image
          source={require("../../assets/images/sample-profile-card.png")}
          resizeMode="contain"
          className="w-full"
          style={{ height: cardHeight }}
        />
      </TouchableOpacity>
      <View className="flex-row items-center mt-2">
        <Text className="text-center text-lg font-medium text-black mr-1">
          {item.card?.card_name || "サンプル名刺"}
        </Text>
        {item.card?.id && (
          <TouchableOpacity onPress={() => router.push(`/edit-card?id=${item.card?.id}`)}>
            <MaterialIcons name="edit" size={16} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// 名刺サイズの比率を55mm×91mmに変更
const cardWidth = 320;
const cardHeight = Math.round(cardWidth / 1.65); // 高さを計算

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cards, setCards] = useState<ItemData[]>([{ id: "add", type: "add" }]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [qrValue, setQrValue] = useState<string>("Hello, QR Code!");
  const [isGeneratingQR, setIsGeneratingQR] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  // QR交換通知をチェック
  const { 
    newExchangeLog, 
    showPreview, 
    closePreview 
  } = useQRExchangeNotifications();

  // 画面幅を取得
  const screenWidth = Dimensions.get('window').width;
  const cardSpacing = 12;
  const itemWidth = cardWidth + cardSpacing;
  
  // 左右の余白を計算（名刺が画面中央に来るように）
  const sideMargin = (screenWidth - cardWidth) / 2;

  // 各名刺が中央に来る位置を計算
  const snapOffsets = cards.map((_, index: number) => {
    return index * itemWidth;
  });

  // QRコードを生成
  const generateQRCode = useCallback(async (cardId: string) => {
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
  }, []);

  // 名刺データを取得
  const fetchCards = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (!isRefresh) {
        setIsLoading(true);
      }
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
        // QRコードの生成は selectedId の useEffect で行う
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error);
      Alert.alert(
        "名刺取得エラー",
        "名刺情報の取得に失敗しました。再度お試しください。",
        [{ text: "OK", style: "default" }]
      );
    } finally {
      if (!isRefresh) {
        setIsLoading(false);
        setHasInitialized(true);
      }
    }
  }, []); // generateQRCodeの依存関係を削除

  // プルトゥリフレッシュの処理
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCards(true);
    setRefreshing(false);
  };

  // 初回ロード時に名刺を取得
  useEffect(() => {
    fetchCards();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 画面がフォーカスされた時にデータを更新（編集から戻った時など）
  useFocusEffect(
    useCallback(() => {
      // 初期化完了後で、かつリフレッシュ中でない場合のみ実行
      if (hasInitialized && !refreshing) {
        fetchCards(true); // リフレッシュとして実行
      }
    }, [hasInitialized, refreshing, fetchCards])
  );

  // 名刺選択時にQRコードを更新
  useEffect(() => {
    if (selectedId && selectedId !== "add") {
      generateQRCode(selectedId);
    }
  }, [selectedId, generateQRCode]);

  const renderItem: ListRenderItem<ItemData> = ({ item }) => (
    <Item
      item={item}
      onPress={() => setSelectedId(item.id)}
      isSelected={item.id === selectedId}
    />
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#ecebeb' }}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#000000']} // Android
            tintColor="#000000" // iOS
          />
        }
      >
        <View className="flex-1 items-center justify-center px-4 py-6">
          <View className="flex-col items-center gap-8 w-full">
            {/* QRコード表示エリア */}
            <View className="items-center">
              {isGeneratingQR ? (
                <View
                  className="w-52 h-52 items-center justify-center bg-white rounded-lg"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 2, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                    elevation: 4,
                  }}
                >
                  <ActivityIndicator size="large" color="#000000" />
                  <Text className="mt-2 text-sm text-gray-600">QR生成中...</Text>
                </View>
              ) : (
                <View
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 2, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                    elevation: 4,
                    borderRadius: 12,
                  }}
                >
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
              {[
                { icon: <MaterialCommunityIcons name="cellphone-wireless" size={24} color="black" />, label: "近くの人と", onPress: () => console.log('ble'), disabled: true },
                { icon: <Entypo name="link" size={24} color="black" />, label: "コードを送る", onPress: () => console.log('url'), disabled: true },
                { icon: <MaterialCommunityIcons name="qrcode-scan" size={24} color="black" />, label: "読み取る", onPress: () => {
                    if (selectedId && selectedId !== "add") {
                      router.push(`/scan-qr?selectedCardId=${selectedId}`);
                    } else {
                      Alert.alert(
                        "名刺を選択してください",
                        "交換する名刺を選択してからQRコードを読み取ってください。",
                        [{ text: "OK", style: "default" }]
                      );
                    }
                  }
                }
              ].map((btn, index) => (
                <Pressable
                  key={index}
                  onPress={btn.onPress}
                  disabled={!!btn.disabled}
                  accessibilityState={{ disabled: !!btn.disabled }}
                  className="items-center"
                >
                  <View
                    className="bg-white p-4 rounded-full"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 2, height: 2 }, // 右下にオフセット
                      shadowOpacity: 0.15,                    // 薄め
                      shadowRadius: 3,                         // ぼかし
                      elevation: 4,                            // Android用
                      opacity: btn.disabled ? 0.5 : 1,
                    }}
                  >
                    {btn.icon}
                  </View>
                  <Text className="mt-2" style={{ opacity: btn.disabled ? 0.6 : 1 }}>{btn.label}</Text>
                </Pressable>
              ))}
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
