import { router } from "expo-router";
import { Text, View, FlatList, Image, Pressable } from "react-native";

const cardData = [
  {
    id: "1",
    title: "Card 1",
    imagePath: require("../../assets/images/sample-profile-card.png"),
  },
  {
    id: "2",
    title: "Card 2",
    imagePath: require("../../assets/images/sample-profile-card.png"),
  },
  {
    id: "3",
    title: "Card 3",
    imagePath: require("../../assets/images/sample-profile-card.png"),
  },
];

export default function Correction() {
  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-xl font-bold mb-4">コレクション</Text>

      <FlatList
        data={cardData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <Pressable 
            onPress={() => router.push('/card-detail')}
            className="bg-gray-100  m-2 border border-gray-300"
          >
            <Image
              source={item.imagePath}
              className="w-48 h-28"
              resizeMode="cover"
            />
          </Pressable>
        )}
      />
    </View>
  );
}
