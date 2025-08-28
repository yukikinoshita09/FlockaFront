import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { useState } from "react";
import { Image, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <View className="flex-1 items-center justify-center">
      <View className="items-center">
        <Image
          source={require("../assets/images/start-app-icon.png")}
          className="w-40 h-40"
          resizeMode="contain">
        </Image>
        <Text className='text-xl font-extrabold mt-6'>flocka</Text>
      </View>
      <View className="w-full px-16 mt-4">
        <View>
          <Text className='text-lg font-extrabold mt-16'>メールアドレス</Text>
          <TextInput
            placeholder="sample@example.com"
            className="mt-3 h-14 border border-gray-400 rounded-lg px-4 text-base"
            keyboardType="email-address"
          />
        </View>
        <View className="mt-6">
          <View className="flex-row gap-5 items-center">
            <Text className='text-lg font-extrabold'>パスワード</Text>
          </View>
          <View className="mt-3 h-14 border border-gray-400 rounded-lg px-4 flex-row items-center">
            <TextInput
              placeholder="パスワードを入力"
              className="flex-1 text-base"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
        </View>
        <Pressable onPress={() => console.log("click")}>
          <Text className="text-base mt-2 left text-gray-400">半角英数字のみ・8文字以上</Text>
        </Pressable>
      </View>
      <View className='w-full px-16 mt-16'>
        <Pressable onPress={()=> console.log("click")} className='bg-black h-16 items-center justify-center rounded-lg'>
          <Text className="text-xl font-bold text-white">
            新規登録
          </Text>
        </Pressable>
      </View>
      <View className='w-full px-16'>
        <Pressable onPress={() => router.navigate('/sign-in')} className="h-16 items-center justify-center mt-2">  
          <Text className="text-xl font-bold">
            ログインはこちら
          </Text>
        </Pressable>
      </View>
    </View>
  );
}