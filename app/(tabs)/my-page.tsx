import { router } from "expo-router";
import { Alert, Pressable, Text, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function MyPage() {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      "ログアウト確認",
      "ログアウトしますか？",
      [
        {
          text: "キャンセル",
          style: "cancel"
        },
        {
          text: "ログアウト",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace('/');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert("エラー", "ログアウトに失敗しました。");
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: '#ecebeb' }}>
      {/* ユーザーのメールのみ表示 */}
      <Text className="text-lg mb-6">{user?.email || ''}</Text>

      <Pressable 
        onPress={handleLogout}
        className="bg-red-500 px-8 py-4 rounded-lg"
      >
        <Text className="text-white font-bold text-lg">
          ログアウト
        </Text>
      </Pressable>
    </View>
  );
}
