import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function SignUp() {
  return (
    <View className="flex-1 items-center justify-center ">
      <Pressable onPress={()=>router.navigate('/home')}>
        <Text className="text-xl font-bold">
          ホームへ
        </Text>
      </Pressable>
    </View>
  );
}
