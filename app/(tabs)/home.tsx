import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import QRCode from "react-native-qrcode-svg";

// データ型
type ItemData = {
  id: string;
  image?: any;
  type: 'card' | 'add'; // アイテムの種類
};

const DATA: ItemData[] = [
  { id: "add", type: "add" }, // 追加ボタン
  { id: "1", image: require("../../assets/images/sample-profile-card.png"), type: "card" },
  { id: "2", image: require("../../assets/images/sample-profile-card.png"), type: "card" },
  { id: "3", image: require("../../assets/images/sample-profile-card.png"), type: "card" },
];

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
        <Text className="mt-2 text-gray-600">新しいカードを作成</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-80 ${isSelected ? 'border-4 border-blue-500' : ''}`}
      style={{ width: 320 }} // 明示的に幅を指定
    >
      <Image
        source={item.image}
        resizeMode="contain"
        className="w-full"
      />
    </TouchableOpacity>
  );
};

export default function Home() {
  const [selectedId, setSelectedId] = useState<string>("1"); // 初期選択を最初のカードに

  // 画面幅を取得
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = 320;
  const cardSpacing = 12;
  const itemWidth = cardWidth + cardSpacing;
  
  // 左右の余白を計算（カードが画面中央に来るように）
  const sideMargin = (screenWidth - cardWidth) / 2;

  // 各カードが中央に来る位置を計算
  const snapOffsets = DATA.map((_, index) => {
    return index * itemWidth;
  });

  const renderItem: ListRenderItem<ItemData> = ({ item }) => (
    <Item
      item={item}
      onPress={() => setSelectedId(item.id)}
      isSelected={item.id === selectedId}
    />
  );

  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <View className="flex-col items-center gap-10">
        <QRCode value="Hello, QR Code!" size={200} quietZone={20} />
        <View className="flex-row gap-8 mb-20">
          <View className="items-center">
            <View className="bg-white p-4 rounded-full">
              <MaterialCommunityIcons name="cellphone-wireless" size={24} color="black" />
            </View>
            <Text className="mt-2">近くの人と</Text>
          </View>
          <View className="items-center">
            <View className="bg-white p-4 rounded-full">    
              <Entypo name="link" size={24} color="black" />
            </View>
            <Text className="mt-2">コードを送る</Text>
          </View>
          <View className="items-center">
            <View className="bg-white p-4 rounded-full">    
              <MaterialCommunityIcons name="qrcode-scan" size={30} color="black" />
            </View>
            <Text className="mt-2">読み取る</Text>
          </View>
        </View>
      </View>
      <View className="flex-row items-center mb-4">
        <FlatList
          className="max-h-60"
          data={DATA}
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
          initialScrollIndex={1}
          getItemLayout={(data, index) => ({
            length: itemWidth,
            offset: itemWidth * index,
            index,
          })}
        />
      </View>
    </View>
  );
}
