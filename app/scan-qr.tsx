import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Button, Text, View } from 'react-native';

export default function ScanQr() {
  const [permission, requestPermission] = useCameraPermissions();
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
    if (!selectedCardId) {
      Alert.alert(
        "エラー",
        "交換するカードが選択されていません。",
        [{ text: "OK", onPress: () => router.back() }]
      );
      return;
    }

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
        onBarcodeScanned={({ data }) => {
          console.log('QR Code scanned:', data);
          handleQRCodeScanned(data);
        }}
      />
    </View>
  );
}
