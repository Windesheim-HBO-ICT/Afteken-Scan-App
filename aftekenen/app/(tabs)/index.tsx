import { StyleSheet, View, Text, Button, Alert } from 'react-native';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import forge from 'node-forge';

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

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

  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    setScanned(true);
    try {
      const jsonData = JSON.parse(data);
      const convertedData = {
        student: jsonData.student,
        publickey: jsonData.publickey,
        opdracht: jsonData.opdracht
      };

      const publicKeyPem = atob(convertedData.publickey);

      // Convert PEM formatted public key to a Forge public key object
      const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

      // Define your test data
      const testData = 'This is the test data to be encrypted';

      // Encrypt the test data using the public key
      const encryptedData = publicKey.encrypt(testData, 'RSA-OAEP', {
        md: forge.md.sha256.create(),
      });

      Alert.alert(
        `Barcode Scanned`,
        `Data: ${data}\n\nConverted to object it's\n\n${JSON.stringify(convertedData)}\n\n and has the key ${publicKeyPem}.
        \n\nwhich has encrypted 'This is the test data to be encrypted' to\n\n${encryptedData}`,
        [
          { text: 'OK', onPress: () => setScanned(false) }
        ]
      );
    } catch (error) {
      alert('Error parsing barcode data.');
      console.error('Error parsing barcode data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});