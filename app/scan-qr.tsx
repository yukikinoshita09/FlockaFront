import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

export default function ScanQr() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanned, setIsScanned] = useState(false);
  const { selectedCardId } = useLocalSearchParams<{ selectedCardId: string }>();

  if (!permission) {
    return <View className="flex-1" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-center pb-2">We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // QRコードスキャン後の処理
  const handleQRCodeScanned = (qrData: string) => {
    // 既にスキャン済みの場合は処理しない
    if (isScanned) {
      return;
    }

    if (!selectedCardId) {
      Alert.alert(
        "エラー",
        "交換するカードが選択されていません。",
        [{ text: "OK", onPress: () => router.back() }]
      );
      return;
    }

    // スキャンフラグを立てて重複を防ぐ
    setIsScanned(true);

    // カードプレビューページに遷移
    router.push({
      pathname: '/card-preview',
      params: {
        qrData: qrData,
        selectedCardId: selectedCardId
      }
    });
  };

  return (
    <View className="flex-1">
      <CameraView
        style={{ flex: 1 }}
        facing='back'
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={isScanned ? undefined : ({ data }) => {
          console.log('QR Code scanned:', data);
          handleQRCodeScanned(data);
        }}
      />
    </View>
  );
}
