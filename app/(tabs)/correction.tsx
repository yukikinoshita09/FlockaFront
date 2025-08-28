import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { apiClient } from "../../utils/api";

const { width: screenWidth } = Dimensions.get("window");

// コレクションアイテムの型定義
interface CollectionItem {
  id: string;
  card: {
    id: string;
    card_name: string;
    image_key?: string;
    image_url?: string;
    bio?: string;
    links?: {
      title: string;
      url: string;
    }[];
  };
  memo?: string;
  location_name?: string;
  created_at: string;
}

// 2列 x 3行 = 6アイテム/ページ
const PAGE_SIZE = 6;

// ページごとに分割
const paginate = (data: CollectionItem[], pageSize: number) => {
  const pages = [];
  for (let i = 0; i < data.length; i += pageSize) {
    pages.push(data.slice(i, i + pageSize));
  }
  return pages;
};

export default function PagerScrollView() {
  const [collectionData, setCollectionData] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // コレクションデータを取得
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching collection data...');
        const data = await apiClient.getCollection();
        console.log('Collection data received:', data);
        console.log('Number of items:', data.length);
        if (data.length > 0) {
          console.log('First item structure:', JSON.stringify(data[0], null, 2));
        }
        setCollectionData(data);
      } catch (err) {
        console.error('Failed to fetch collection:', err);
        setError(err instanceof Error ? err.message : 'コレクションの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, []);

  const pages = paginate(collectionData, PAGE_SIZE);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / screenWidth);
    setCurrentPage(pageIndex);
  };

  // アイテム幅を画面サイズに基づいて計算（余白考慮）
  const ITEM_MARGIN = 12; // 各アイテムのマージン
  const itemWidth = Math.floor(screenWidth / 2) - ITEM_MARGIN - 8;

  // ローディング中の表示
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">コレクションを読み込み中...</Text>
      </View>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <Pressable
          onPress={async () => {
            try {
              setError(null);
              setLoading(true);
              console.log('Retrying collection fetch...');
              const data = await apiClient.getCollection();
              console.log('Retry - Collection data received:', data);
              console.log('Retry - Number of items:', data.length);
              if (data.length > 0) {
                console.log('Retry - First item structure:', JSON.stringify(data[0], null, 2));
              }
              setCollectionData(data);
            } catch (err) {
              console.error('Retry failed:', err);
              setError(err instanceof Error ? err.message : 'コレクションの取得に失敗しました');
            } finally {
              setLoading(false);
            }
          }}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white">再試行</Text>
        </Pressable>
      </View>
    );
  }

  // データが空の場合
  if (collectionData.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500 text-center">
          まだカードが収集されていません。{'\n'}
          QR交換でカードを集めてみましょう！
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center">
      {/* 横スクロールページャー */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {pages.map((page, pageIndex) => (
          <View key={pageIndex} className="py-10" style={{ width: screenWidth }}>
            <FlatList
              data={page}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false} // ページ内はスクロールさせない
              contentContainerStyle={{ paddingHorizontal: 12, alignItems: 'center' }}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push(`/card-detail?id=${item.id}`)}
                  style={{
                    width: itemWidth,
                    marginVertical: 8,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 6,
                    overflow: 'hidden'
                  }}
                >
                  <Image
                    source={{ 
                      uri: item.card.image_url || `${apiClient.getBaseUrl()}/cards/image/${item.card.image_key}` 
                    }}
                    style={{ width: '100%', height: 120 }}
                    resizeMode="cover"
                  />
                  {/* カード名を表示 */}
                  <View style={{ padding: 8 }}>
                    <Text 
                      style={{ fontSize: 12, fontWeight: '500', color: '#374151' }}
                      numberOfLines={1}
                    >
                      {item.card.card_name}
                    </Text>
                    {item.memo && (
                      <Text 
                        style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}
                        numberOfLines={1}
                      >
                        {item.memo}
                      </Text>
                    )}
                  </View>
                </Pressable>
              )}
            />
          </View>
        ))}
      </ScrollView>

      {/* ドットインジケータ */}
      {pages.length > 1 && (
        <View className="flex-row justify-center absolute bottom-40">
          {pages.map((_, index) => (
            <View
              key={index}
              className={`w-2.5 h-2.5 rounded-full mx-1.5 ${
                index === currentPage ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
