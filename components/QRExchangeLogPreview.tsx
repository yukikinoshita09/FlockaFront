import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    Linking,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { apiClient, Card } from '../utils/api';

interface QRExchangeLogPreviewProps {
  visible: boolean;
  onClose: () => void;
  exchangeLog: {
    id: string;
    scannerUser: {
      id: string;
      name: string;
    };
    scannerCard: Card;
    memo?: string;
    created_at: string;
  } | null;
}

export default function QRExchangeLogPreview({ 
  visible, 
  onClose, 
  exchangeLog 
}: QRExchangeLogPreviewProps) {
  if (!exchangeLog) return null;

  // リンクを開く
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error("Failed to open URL:", err);
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        {/* ヘッダー */}
        <View className="bg-white px-4 py-6 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800">
                名刺を受け取りました！
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                「{exchangeLog.scannerCard.card_name}」
              </Text>
            </View>
            <TouchableOpacity 
              onPress={onClose}
              className="p-2 rounded-full bg-gray-100"
            >
              <MaterialIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* 名刺画像 */}
          <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              {exchangeLog.scannerCard.card_name}
            </Text>
            {(exchangeLog.scannerCard.image_url || exchangeLog.scannerCard.image_key) ? (
              (() => {
                const imageUri = exchangeLog.scannerCard.image_url 
                  ? `${apiClient.getBaseUrl()}${exchangeLog.scannerCard.image_url}` 
                  : apiClient.getCardImageUrl(exchangeLog.scannerCard.image_key!);
                console.log('QR Exchange Image URI:', imageUri);
                return (
                  <Image
                    source={{ uri: imageUri }}
                    className="w-full h-48 rounded-lg"
                    resizeMode="contain"
                    onError={(error) => console.log('QR Exchange Image load error:', error)}
                  />
                );
              })()
            ) : (
              <View className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <MaterialIcons name="image" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">画像なし</Text>
              </View>
            )}
          </View>

          {/* Bio情報 */}
          {exchangeLog.scannerCard.bio && (
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-2">Bio</Text>
              <Text className="text-gray-700 leading-6">{exchangeLog.scannerCard.bio}</Text>
            </View>
          )}

          {/* リンク情報 */}
          {exchangeLog.scannerCard.links && exchangeLog.scannerCard.links.length > 0 && (
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3">リンク</Text>
              {exchangeLog.scannerCard.links.map((link, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => openLink(link.url)}
                  className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
                >
                  <FontAwesome5 name="external-link-alt" size={16} color="#3B82F6" />
                  <View className="ml-3 flex-1">
                    <Text className="font-medium text-gray-800">{link.title}</Text>
                    <Text className="text-sm text-blue-600" numberOfLines={1}>
                      {link.url}
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* メモ情報 */}
          {exchangeLog.memo && (
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-2">メモ</Text>
              <Text className="text-gray-700 leading-6">{exchangeLog.memo}</Text>
            </View>
          )}

          {/* 交換日時 */}
          <View className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">交換日時</Text>
            <Text className="text-gray-700">
              {new Date(exchangeLog.created_at).toLocaleString('ja-JP')}
            </Text>
          </View>
        </ScrollView>

        {/* 閉じるボタン */}
        <View className="bg-white border-t border-gray-200 px-4 py-4">
          <TouchableOpacity
            onPress={onClose}
            className="bg-blue-600 py-4 rounded-lg"
          >
            <Text className="text-white text-center font-semibold text-lg">
              閉じる
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
