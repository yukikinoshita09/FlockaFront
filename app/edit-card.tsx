import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { apiClient, Card } from '../utils/api';

interface EditableCard {
  id: string;
  card_name: string;
  bio?: string;
  image_key?: string;
  links?: { title: string; url: string }[];
}

export default function EditCard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [card, setCard] = useState<EditableCard | null>(null);
  const [cardName, setCardName] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState<{ title: string; url: string }[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // カードデータを取得
  useEffect(() => {
    const fetchCardData = async () => {
      if (!id) {
        Alert.alert('エラー', 'カードIDが指定されていません。', [
          { text: 'OK', onPress: () => router.back() }
        ]);
        return;
      }

      try {
        setLoading(true);
        const cards = await apiClient.getMyCards();
        const targetCard = cards.find((c: Card) => c.id === id);
        
        if (!targetCard) {
          Alert.alert('エラー', '指定されたカードが見つかりません。', [
            { text: 'OK', onPress: () => router.back() }
          ]);
          return;
        }

        setCard(targetCard);
        setCardName(targetCard.card_name || '');
        setBio(targetCard.bio || '');
        setLinks(Array.isArray(targetCard.links) ? targetCard.links : []);
        if (targetCard.image_key) {
          setSelectedImage(apiClient.getCardImageUrl(targetCard.image_key));
        }
      } catch (error) {
        console.error('Failed to fetch card:', error);
        Alert.alert('エラー', 'カード情報の取得に失敗しました。', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, [id]);

  // 画像選択
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // リンク追加
  const addLink = () => {
    setLinks(prevLinks => [...(prevLinks || []), { title: '', url: '' }]);
  };

  // リンク削除
  const removeLink = (index: number) => {
    setLinks(prevLinks => (prevLinks || []).filter((_, i) => i !== index));
  };

  // リンク更新
  const updateLink = (index: number, field: 'title' | 'url', value: string) => {
    setLinks(prevLinks => {
      const newLinks = [...(prevLinks || [])];
      if (newLinks[index]) {
        newLinks[index][field] = value;
      }
      return newLinks;
    });
  };

  // カード更新
  const handleUpdateCard = async () => {
    if (!card || !cardName.trim()) {
      Alert.alert('エラー', 'カード名は必須です。');
      return;
    }

    try {
      setUpdating(true);
      
      // 画像をアップロード（新しい画像が選択された場合）
      let imageKey = card.image_key;
      if (selectedImage && !selectedImage.startsWith('http')) {
        const uploadResult = await apiClient.uploadImage(selectedImage);
        imageKey = uploadResult.imageKey;
      }

      // カード情報を更新
      await apiClient.updateCard(card.id, {
        card_name: cardName,
        bio: bio || undefined,
        image_key: imageKey,
        links: Array.isArray(links) ? links.filter(link => link.title && link.url) : []
      });

      Alert.alert('成功', 'カード情報を更新しました。', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Failed to update card:', error);
      Alert.alert('エラー', 'カード情報の更新に失敗しました。');
    } finally {
      setUpdating(false);
    }
  };

  // カード削除
  const handleDeleteCard = () => {
    Alert.alert(
      'カード削除',
      'このカードを削除しますか？この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await apiClient.deleteCard(card!.id);
              Alert.alert('成功', 'カードを削除しました。', [
                { text: 'OK', onPress: () => router.replace('/(tabs)/home') }
              ]);
            } catch (error) {
              console.error('Failed to delete card:', error);
              Alert.alert('エラー', 'カードの削除に失敗しました。');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  // 修正: SafeAreaView 内の条件付きレンダリングを整理
  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: '#ecebeb' }}>
        <>
          <ActivityIndicator size="large" color="#000000" />
          <Text className="mt-4 text-xl">カード情報を読み込み中...</Text>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mt-6 bg-gray-500 px-8 py-4 rounded-lg"
          >
            <Text className="text-white font-bold text-lg">戻る</Text>
          </TouchableOpacity>
        </>
      </SafeAreaView>
    );
  }

  if (!card) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center" style={{ backgroundColor: '#ecebeb' }}>
        <>
          <Text className="text-xl text-red-500 text-center">カード情報の読み込みに失敗しました</Text>
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mt-6 bg-black px-8 py-4 rounded-lg"
          >
            <Text className="text-white font-bold text-lg">戻る</Text>
          </TouchableOpacity>
        </>
      </SafeAreaView>
    );
  }

  // デバッグ用: id の値をログに出力
  console.log('EditCard: id =', id);

  // 修正: ルート要素を Fragment でラップ
  return (
    <>
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#ecebeb' }}>
        <KeyboardAvoidingView 
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
          enabled={true}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView 
              className="flex-1"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              contentInsetAdjustmentBehavior={Platform.OS === 'ios' ? 'automatic' : undefined}
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios' ? true : false}
              contentContainerStyle={{ 
                flexGrow: 1,
                paddingBottom: Platform.OS === 'ios' ? 20 : 0 
              }}
            >
              <View className="p-6">
                {/* 画像選択 */}
                <View className="bg-white rounded-lg p-6 mb-6 border border-gray-100 shadow shadow-gray-200">
                  <Text className="text-xl font-bold mb-4">カード画像</Text>
                  <TouchableOpacity
                    onPress={pickImage}
                    className="w-full h-52 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center"
                  >
                    {selectedImage ? (
                      <Image
                        source={{ uri: selectedImage }}
                        className="w-full h-full rounded-lg"
                        resizeMode="contain"
                      />
                    ) : (
                      <View className="items-center">
                        <MaterialIcons name="add-photo-alternate" size={48} color="#9CA3AF" />
                        <Text className="text-gray-500 mt-2 text-lg">画像を選択</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* カード名 */}
                <View className="bg-white rounded-lg p-6 mb-6 border border-gray-100 shadow shadow-gray-200">
                  <Text className="text-xl font-bold mb-4">カード名 *</Text>
                  <TextInput
                    value={cardName}
                    onChangeText={setCardName}
                    placeholder="カード名を入力"
                    className="border border-gray-300 rounded-lg p-4 text-lg"
                    maxLength={50}
                  />
                  <Text className="text-right text-sm text-gray-500 mt-2">
                    {cardName.length}/50文字
                  </Text>
                </View>

                {/* Bio */}
                <View className="bg-white rounded-lg p-6 mb-6 border border-gray-100 shadow shadow-gray-200">
                  <Text className="text-xl font-bold mb-4">Bio（任意）</Text>
                  <TextInput
                    value={bio}
                    onChangeText={setBio}
                    placeholder="自己紹介を入力"
                    multiline
                    numberOfLines={4}
                    className="border border-gray-300 rounded-lg p-4 h-28 text-lg"
                    textAlignVertical="top"
                    maxLength={200}
                  />
                  <Text className="text-right text-sm text-gray-500 mt-2">
                    {bio.length}/200文字
                  </Text>
                </View>

                {/* リンク */}
                <View className="bg-white rounded-lg p-6 mb-6 border border-gray-100 shadow shadow-gray-200">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-xl font-bold">リンク</Text>
                    <TouchableOpacity onPress={addLink} className="bg-black px-4 py-3 rounded-lg">
                      <Text className="text-white font-bold">追加</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {links && links.map((link, index) => (
                    <View key={index} className="border border-gray-300 rounded-lg p-4 mb-4">
                      <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-lg font-bold">リンク {index + 1}</Text>
                        <TouchableOpacity onPress={() => removeLink(index)}>
                          <MaterialIcons name="delete" size={24} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        value={link.title}
                        onChangeText={(text) => updateLink(index, 'title', text)}
                        placeholder="タイトル (例: Twitter)"
                        className="border border-gray-300 rounded-lg p-3 mb-3 text-lg"
                      />
                      <TextInput
                        value={link.url}
                        onChangeText={(text) => updateLink(index, 'url', text)}
                        placeholder="URL (例: https://twitter.com/username)"
                        className="border border-gray-300 rounded-lg p-3 text-lg"
                        keyboardType="url"
                        autoCapitalize="none"
                      />
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {/* 更新と削除ボタンを復元 */}
      <View className="bg-white border-t border-gray-100 px-6 py-6">
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={handleDeleteCard}
            className="flex-1 bg-red-500 py-4 rounded-lg"
            disabled={deleting}
          >
            {deleting ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-bold text-xl ml-2">削除中...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-bold text-xl">
                削除
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleUpdateCard}
            className="flex-1 bg-black py-4 rounded-lg"
            disabled={updating}
          >
            {updating ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-bold text-xl ml-2">更新中...</Text>
              </View>
            ) : (
              <Text className="text-white text-center font-bold text-xl">
                更新
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
