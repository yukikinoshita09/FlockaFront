import React, { useState } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
  Image,
  Pressable
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Entypo from '@expo/vector-icons/Entypo';
import { router } from "expo-router";

// データ型
type ItemData = {
  id: string;
  image: any; // 画像を使う
};

const DATA: ItemData[] = [
  { id: "1", image: require("../../assets/images/sample-profile-card.png") },
  { id: "2", image: require("../../assets/images/sample-profile-card.png") },
  { id: "3", image: require("../../assets/images/sample-profile-card.png") },
];

// 単一アイテム
type ItemProps = {
  item: ItemData;
  onPress: () => void;
  isSelected: boolean;
};

const Item = ({ item, onPress, isSelected }: ItemProps) => (
  <TouchableOpacity
    onPress={onPress}
    className={`w-80 ${isSelected ? 'border-4 border-blue-500' : ''}`}
  >
    <Image
      source={item.image}
      resizeMode="contain"
      className="w-full"
    />
  </TouchableOpacity>
);

export default function Home() {
  const [selectedId, setSelectedId] = useState<string>();

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
          <Pressable onPress={()=>console.log('ble')} className="items-center">
            <View className="bg-white p-4 rounded-full">
              <MaterialCommunityIcons name="cellphone-wireless" size={24} color="black" />
            </View>
            <Text className="mt-2">近くの人と</Text>
          </Pressable>
          <Pressable onPress={()=>console.log('url')} className="items-center">
            <View className="bg-white p-4 rounded-full">    
              <Entypo name="link" size={24} color="black" />
            </View>
            <Text className="mt-2">コードを送る</Text>
          </Pressable>
          <Pressable onPress={()=>router.push('/scan-qr')} className="items-center">
            <View className="bg-white p-4 rounded-full">    
              <MaterialCommunityIcons name="qrcode-scan" size={30} color="black" />
            </View>
            <Text className="mt-2">読み取る</Text>
          </Pressable>
        </View>
      </View>
      <View className="flex-row items-center mb-4">
        <Pressable onPress={() => router.navigate('/create-card')}>
          <Entypo name="plus" size={24} color="black" className="mx-4" />
        </Pressable>
        <FlatList
          className="max-h-60"
          data={DATA}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          extraData={selectedId}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ItemSeparatorComponent={() => <View className="w-3" />}
        />
      </View>
    </View>
  );
}
