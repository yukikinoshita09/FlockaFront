import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Image, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#ecebeb' }}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack
            screenOptions={{
              headerTitle: () => (
                <Image
                  source={require('../assets/images/flocka-font.png')}
                  style={{ width: 110, height: 30, resizeMode: 'contain', marginTop: 5, marginBottom: 10}}
                />
              ),
              headerTitleAlign: 'center',
              headerStyle: { backgroundColor: "#f8f8f8" },
              headerTintColor: "#333",
              headerTitleStyle: { fontWeight: "bold" },
            }}
            >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="sign-up" options={{ headerShown: false }} />
            <Stack.Screen name="sign-up-auth" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerLeft: () => null, gestureEnabled: false, title: '' }} />
            <Stack.Screen name="+not-found" />
            </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </View>
  );
}
