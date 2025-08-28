import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  ScrollView,
  Image,
  Pressable,
  Text,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { SimpleGrid } from "react-native-super-grid";

const { width: screenWidth } = Dimensions.get("window");

// UIテスト用データ
const cardData = Array.from({ length: 21 }, (_, i) => ({
  id: String(i + 1),
  imagePath: require("../../assets/images/sample-profile-card.png"),
}));

const PAGE_SIZE = 8;

// ページごとに分割
const paginate = (data: typeof cardData, pageSize: number) => {
  const pages = [];
  for (let i = 0; i < data.length; i += pageSize) {
    pages.push(data.slice(i, i + pageSize));
  }
  return pages;
};

export default function PagerScrollView() {
  const pages = paginate(cardData, PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / screenWidth);
    setCurrentPage(pageIndex);
  };

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
            <SimpleGrid
              itemDimension={130}
              spacing={12}
              data={page}
              listKey={`page-${pageIndex}`}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push("/card-detail")}
                  className="m-1 border border-gray-300 shadow-gray-200 shadow-sm bg-gray-100"
                >
                  <Image
                    source={item.imagePath}
                    className="w-48 h-28"
                    resizeMode="cover" />
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
                index === currentPage ? "bg-blue-500" : "bg-gray-300"
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
