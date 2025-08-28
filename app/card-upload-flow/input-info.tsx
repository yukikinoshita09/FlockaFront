import { Text, View, TextInput, Pressable } from "react-native";
import { useState } from "react";

type InputData = {
  sns: string;
  link: string;
};

export default function InputInfo() {
  const [sns, setSns] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [datas, setDatas] = useState<InputData[]>([]);

  const handleSetValue = () => {
    if (datas.length >= 4) {
      alert("リンクは最大4つまでです。");
      return;
    }
    if (!sns.trim() || !link.trim()) {
      alert("SNS名とURLの両方を入力してください。");
      return;
    }
    const newDatas = [...datas, { sns, link }];
    setDatas(newDatas);
    console.log(newDatas);

    setSns("");
    setLink("");
  };

  return (
    <View className="flex-1 justify-center items-center p-8">
      <View className="w-full p-8 bg-white rounded-lg shadow-gray-200 shadow-sm mb-8">
        <Text className="font-medium text-xl mb-4">設定するリンク (最大4つ)</Text>
        {datas.map((data, index) => (
          <View key={index} className="flex-row gap-2 mb-4">
            <Text className="flex-[3] border border-gray-300 rounded-lg px-2 py-2 text-xl">{data.sns}</Text>
            <Text className="flex-[7] border border-gray-300 rounded-lg px-2 py-2 text-xl">{data.link}</Text>
          </View>
        ))}
        {datas.length < 4 && (
          <View>
            <View className="flex-row mb-4 gap-2">
              <TextInput
                placeholder="SNS名"
                value={sns}
                onChangeText={setSns}
                className="flex-[3] border border-gray-300 rounded-lg px-2 py-2 text-xl"
              />
              <TextInput
                placeholder="URL"
                value={link}
                onChangeText={setLink}
                className="flex-[7] border border-gray-300 rounded-lg px-2 py-2 text-xl"
              />
            </View>
            <Pressable
              onPress={handleSetValue}
              className="p-4 border border-dashed border-gray-300 rounded-lg"
            >
              <Text className="text-center">リンクを追加</Text>
            </Pressable>
          </View>
        )}
      </View>
      <Pressable
        onPress={()=>console.log('名刺を作成')}
        className="bg-black w-full h-16 items-center justify-center rounded-lg"
      >
        <Text className="text-xl font-bold text-white">名刺を作成</Text>
      </Pressable>
    </View>
  );
}
