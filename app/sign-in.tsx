import { Pressable, Text, View, Image, TextInput} from "react-native";
import { router } from 'expo-router';


export default function SignIn() {
  return (
    <>
    <View className="items-center">
      <Image
        source={require("../assets/images/start-app-icon.png")}
        className="w-32 h-32 mt-14"
        resizeMode="contain">
      </Image>
       <Text className='text-4xl font-extrabold mt-10'>flocka</Text>
    </View>
      <Text className='text-lg font-extrabold mx-14 mt-16'>メールアドレス</Text>
    <View className="mx-14 mt-4">
        <TextInput
          placeholder="sample@example.com"
          className="h-14 border border-gray-400 rounded-lg px-4 text-base"
          keyboardType="email-address"
        />
      </View>

      <View className="flex-row">
        <Text className='text-lg font-extrabold mx-14 mt-8'>パスワード</Text>
        <Text className="text-sm mt-10 pl-5 text-gray-500">半角英数字のみ・8文字以上</Text>
      </View>
      <View className="mx-14 mt-3">
        <TextInput
          placeholder="パスワードを入力"
          className="h-14 border border-gray-400 rounded-lg px-4 text-base"
          secureTextEntry={true} 
        />  
      </View>  
      <Pressable onPress={() => console.log("click")}>
        <Text className="text-sm mt-3 left-64 text-blue-400">パスワードを忘れた方</Text>
      </Pressable>
      <View className='w-full px-16 mt-16'>
        <Pressable onPress={()=> console.log("click")} className='bg-black h-16 items-center justify-center rounded-lg'>
          <Text className="text-xl font-bold text-white">
            ログイン
          </Text>
        </Pressable>
      </View>
      <View className='w-full px-16'>
        <Pressable onPress={() => router.navigate('/sign-up')} className="h-16 items-center justify-center mt-2">  
          <Text className="text-xl font-bold">
            新規登録はこちら
          </Text>
          </Pressable>
      </View>
    </>
  );
}