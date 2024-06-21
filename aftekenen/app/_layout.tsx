import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import forge from 'node-forge';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as SecureStore from 'expo-secure-store';
import { StyleSheet, View, Text, Button, Alert } from 'react-native';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera'; // Import expo-camera

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, setLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [permission, requestPermission] = useCameraPermissions();

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

  useEffect(() => {
    if (!fontsLoaded || loaded || !permission) {
      return; // Ensure we only proceed when fonts are loaded, and permission is granted
    }

    checkAuthentication();
  }, [fontsLoaded, loaded, permission]);

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    setScanned(true);
    try {
      const jsonData = JSON.parse(data);
      const { privatekey } = jsonData;

      // Decode Base64 private key
      const decodedKey = atob(privatekey);

      // Check if decodedKey is a valid RSA private key
      const privateKey = forge.pki.privateKeyFromPem(decodedKey);
      if (!privateKey || !privateKey.n) {
        throw new Error('Invalid RSA private key');
      }

      // Save private key securely
      await SecureStore.setItemAsync('authentication', decodedKey);

      Alert.alert(
        `Ingelogd`,
        `U bent ingelogd met uw private key.`,
        [
          {
            text: 'OK',
            onPress: () => setScanned(false)
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        `Ongeldig`,
        `Deze QR-code is ongeldig.`,
        [
          {
            text: 'OK', onPress: () => {
              checkAuthentication()
              setScanned(false)
            }
          }
        ]
      );
      console.error('Error parsing barcode data:', error);
    }
  };

  if (!fontsLoaded || !permission || !loaded) {
    return null; // or render a loading indicator
  }

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
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
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr"],
              }} />
          </View>
        </View>
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  }
});
