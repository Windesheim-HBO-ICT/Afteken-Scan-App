import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import * as SecureStore from 'expo-secure-store';
import { View, Text } from 'react-native';
import { Camera, CameraView } from 'expo-camera'; // Import expo-camera

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, setLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const result = await SecureStore.getItemAsync('authentication');
        if (result !== null) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setLoaded(true);
        SplashScreen.hideAsync();
      }
    };

    checkAuthentication();
  }, []);

  if (!fontsLoaded || !loaded) {
    return null; // or render a loading indicator
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {isLoggedIn ? (
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      ) : (
        <View style={{ flex: 1 }}>
          <Text style={{ alignSelf: 'center', marginTop: 50 }}>U moet een QR-code scannen om de app te kunnen gebruiken. De QR-code is naar u verzonden.</Text>
          <View style={{ flex: 1 }}>
            <CameraView
              style={{ flex: 1 }}
              // onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }} />
          </View>
        </View>
      )}
    </ThemeProvider>
  );
}
