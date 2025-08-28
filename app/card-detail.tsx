import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View, Image, Pressable, FlatList, Linking, Modal, TextInput } from "react-native";

// テスト用のデータ
const cardData = {
  id: "1",
  card_name: "エンジニア太郎",
  imageUrl: require("../assets/images/sample-profile-card.png"),
  description: "ECCコンピュータ専門学校所属",
  links: [
    { type: "X(旧Twitter)", url: "https://twitter.com" },
    { type: "GitHub", url: "https://github.com" },
  ] as { type: string; url: string }[],
  memo: "8月27日ビギナーズハッカソン8月27日ビギナーズハッカソン8月27日ビギナーズハッカソン8月27日ビギナーズハッカソン",
};

export default function CardDetail() {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [memo, setMemo] = useState<string | null>(cardData.memo);

  return (
    <View className="flex-1 items-center justify-center px-10 bg-gray-100">
      <Image
        source={cardData.imageUrl}
        className="w-full border border-gray-300 mb-8"
        resizeMode="cover"
      />
      <View className="bg-white p-6 rounded-lg w-full flex-col items-center shadow-gray-200 shadow-sm">
        <Text className="text-2xl font-bold mb-4">{cardData.card_name}</Text>
        {cardData.description && (
          <Text className="text-gray-600 text-sm mb-4">{cardData.description}</Text>
        )}
        {/* 各種リンク */}
        {cardData.links.length > 0 ? (
          <View className="flex-row gap-4 mb-4">
            {cardData.links.map((item) => (
              <Pressable
                key={item.type}
                onPress={() => Linking.openURL(item.url)}
                className="w-36 p-3 rounded-lg border border-gray-300 items-center"
              >
                <Text className="text-center font-medium">{item.type}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text className="text-gray-500 mb-4">リンクなし</Text>
        )}
        {/* メモ */}
        <Pressable onPress={() => setModalVisible(true)} className="border border-gray-300 p-4 rounded-lg">
          {cardData.memo && 
            <Text className="font-semibold text-sm">{cardData.memo}</Text>
          }
          <MaterialIcons name="edit" size={24} color="gray" className="text-right" />
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
                  className="mb-4"
                >
                  <MaterialIcons name="close" size={28} color="black" className="text-right" />
                </Pressable>
                {/* メモ入力 */}
                <TextInput
                  placeholder="メモを入力"
                  value={memo || ""}
                  onChangeText={setMemo}
                  multiline
                  numberOfLines={4}
                  className="border border-gray-300 rounded p-2 w-full h-28 mb-4"
                />
                {/* 変更を反映 */}
                <Pressable
                  className="rounded w-full p-4 bg-black mb-4"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white font-bold text-center">変更を反映する</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </View>
  );
}
