import { StyleSheet, View, Text, Button, Alert, Platform, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import forge from 'node-forge';
import { Card, Header } from '@rneui/base';

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(true);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted && !scanned) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const handleBarCodeScanned = async (result: any) => {
    setScanned(true);
    let data;

    if (Platform.OS === 'web') {
      // On web, the result is wrapped in a NativeEvent
      data = result.nativeEvent.data;
    } else {
      data = result.data;
    }

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

      const message = `Data: ${data}\n\nConverted to object it's\n\n${JSON.stringify(convertedData)}\n\n and has the key ${publicKeyPem}.
      \n\nwhich has encrypted 'This is the test data to be encrypted' to\n\n${encryptedData}`;

      if (Platform.OS === 'web') {
        window.alert(message);
        setScanned(false);
      } else {
        Alert.alert(
          `Barcode Scanned`,
          message,
          [
            { text: 'OK', onPress: () => setScanned(false) }
          ]
        );
      }
    } catch (error) {
      let errorMessage = 'Error parsing barcode data.';

      if (error instanceof Error) {
        errorMessage = `Error parsing barcode data: ${error.message}`;
      }

      if (Platform.OS === 'web') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }

      console.error('Error parsing barcode data:', error);
      setScanned(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        statusBarProps={{ barStyle: 'light-content' }}
        barStyle="light-content"
        centerComponent={{ text: 'Aftekenen', style: { fontWeight: "bold" } }}
        containerStyle={{
          backgroundColor: '#b1d249',
          justifyContent: 'space-around',
        }}
      />
      {scanned ?
        <ScrollView>
          <View style={styles.container}>
            <Card>
              <Card.Title>Assignments</Card.Title>
              <Card.Divider />
            </Card>
            <Card>
              <Card.Title>Students</Card.Title>
              <Card.Divider />
            </Card>
            <Card>
              <Button title='Clear Database'></Button>
            </Card>
          </View>
        </ScrollView>
        :
        (
          Platform.OS === 'web' ? (
            // Web platform specific view WITH OLD DEPRECATED PROPS BECAUSE OF EXPO INCOMPETENCE
            <View style={styles.camera}>
              <CameraView
                // @ts-ignore - reason: above comment
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                type="back"
                barCodeScannerSettings={{
                  barCodeTypes: 'qr',
                }}
              />
            </View>
          ) : (
            // Mobile platform specific view
            <View style={styles.camera}>
              <CameraView
                style={{ flex: 1 }} // Adjust styles as needed
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
              />
            </View>
          )
        )
      }
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