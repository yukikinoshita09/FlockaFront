import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

export default function ScanQr() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanned, setIsScanned] = useState(false);
  const lastScanTime = useRef<number>(0);
  const { selectedCardId } = useLocalSearchParams<{ selectedCardId: string }>();

  // 画面がフォーカスされたときにスキャンフラグをリセット
  useFocusEffect(
    useCallback(() => {
      setIsScanned(false);
      lastScanTime.current = 0;
    }, [])
  );

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
    const now = Date.now();
    
    // 既にスキャン済みの場合は処理しない
    if (isScanned) {
      return;
    }

    // デバウンス: 1秒以内の連続スキャンを防ぐ
    if (now - lastScanTime.current < 1000) {
      return;
    }

    lastScanTime.current = now;

    if (!selectedCardId) {
      Alert.alert(
        "エラー",
        "交換する名刺が選択されていません。",
        [{ text: "OK", onPress: () => router.back() }]
      );
      return;
    }

    // スキャンフラグを立てて重複を防ぐ
    setIsScanned(true);

    console.log('QR Code processing:', qrData);

    // 名刺プレビューページに遷移
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
