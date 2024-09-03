import { StyleSheet, View, Text, Alert, Platform, Modal, TextInput, Switch } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Button, Card, Header } from '@rneui/base';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Assignment, Student, database } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type AssignmentFormInputs = {
  studentNumber: string;
  assignmentId: string;
  done: boolean;
  notes: string;
  timestamp: string;
}

type StudentFormInputs = {
  studentNumber: string;
  studentName: string;
}

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const {
    register: registerAssignment,
    handleSubmit: handleSubmitAssignment,
    setValue: setValueAssignment,
    watch: watchAssignment,
    reset: resetAssignment,
    formState: { errors: errorsAssignment }
  } = useForm<AssignmentFormInputs>({
    defaultValues: {
      done: false,
      notes: '',
      timestamp: '',
    },
  });

  const {
    register: registerStudent,
    handleSubmit: handleSubmitStudent,
    setValue: setValueStudent,
    watch: watchStudent,
    reset: resetStudent,
    formState: { errors: errorsStudent }
  } = useForm<StudentFormInputs>();

  const onSubmitAssignment: SubmitHandler<AssignmentFormInputs> = async (data) => {
    console.log(data);

    const students = await database.select('students');
    const student = students.find(student => student.studentNumber === data.studentNumber);

    const getStudentName = async () => {
      if (Platform.OS === 'web') {
        return prompt('Enter the student name');
      } else if (Platform.OS == "ios") {
        return new Promise<string | undefined>((resolve) => {
          Alert.prompt('Enter the student name', undefined, [
            {
              text: 'Cancel',
              onPress: () => resolve(undefined),
              style: 'cancel',
            },
            {
              text: 'Submit',
              onPress: (name) => resolve(name),
            },
          ]);
        });
      } else {
        //TODO: android needs custom implementation
      }
    };

    const confirmStudent = async (name: string) => {
      if (Platform.OS === 'web') {
        return confirm(`Is ${name} the correct student?`);
      } else {
        return new Promise<boolean>((resolve) => {
          Alert.alert(
            'Confirm Student',
            `Is ${name} the correct student?`,
            [
              {
                text: 'No',
                onPress: () => resolve(false),
                style: 'cancel',
              },
              {
                text: 'Yes',
                onPress: () => resolve(true),
              },
            ],
            { cancelable: false }
          );
        });
      }
    };

    let studentName = '';
    if (!student) {
      studentName = await getStudentName() ?? '';
      if (!studentName) {
        return;
      }
      // Insert new student into database
      database.insert('students', { studentNumber: data.studentNumber, name: studentName });
    } else {
      const isConfirmed = await confirmStudent(student.name);
      if (!isConfirmed) {
        return;
      }
      // Use existing student data
      data.studentNumber = student.studentNumber;
    }

    // Create new assignment
    const newAssignment: Assignment = {
      ...data,
      done: !!data.done,
      timestamp: Date.now(),
    };

    // Insert new assignment into database
    database.insert('assignments', newAssignment);
    resetAssignment();
    console.log(database);
    setScanned(false);
  };

  const requestPermissions = () => {
    requestPermission()
  }

  const onSubmitStudent: SubmitHandler<StudentFormInputs> = async (data) => {
    console.log(data)

    const studentData: Student = {
      studentNumber: data.studentNumber,
      name: data.studentName,
    };

    database.insert('students', studentData)
    resetStudent()
    console.log(database)
  };

  // Register fields with validation rules
  useEffect(() => {
    registerAssignment('studentNumber', { required: true });
    registerAssignment('assignmentId', { required: true });
    registerStudent('studentNumber', { required: true });
    registerStudent('studentName', { required: true });
  }, [registerAssignment, registerStudent]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted && !scanned) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button
          onPress={requestPermissions}
          title="grant permission"
          titleStyle={{ fontSize: 16 }} />
      </View>
    );
  }
  const toggleScan = async () => {
    setScanned(!scanned)
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
        assignment: jsonData.assignment,
        rubric: jsonData.rubric
      };

      setValueAssignment("studentNumber", convertedData.student)
      setValueAssignment("assignmentId", convertedData.assignment)
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
      <Modal
        transparent
        visible={scanned}
      >
        <View style={styles.container}>
          <ThemedView style={{ marginHorizontal: 4, padding: 8 }}>
            <Card.Title><ThemedText>Opdracht</ThemedText></Card.Title>
            <Card.Divider />
            <View style={{ margin: 6 }}>
              <View style={styles.switchContainer}>
                <ThemedText type='subtitle'>Student number:</ThemedText>
                <ThemedText type='subtitle'>{watchAssignment('studentNumber')}</ThemedText>
              </View>

              <View style={styles.switchContainer}>
                <ThemedText type='subtitle'>Assignment ID:</ThemedText>
                <ThemedText type='subtitle'>{watchAssignment('assignmentId')}</ThemedText>
              </View>
              <View style={styles.switchContainer}>
                <ThemedText>Afgerond?</ThemedText>
                <Switch
                  onValueChange={(value) => setValueAssignment('done', value)}
                  value={watchAssignment('done')}
                />
              </View>

              <TextInput
                placeholder="Notes"
                onChangeText={(text) => setValueAssignment('notes', text)}
                style={styles.input}
              />

              <Card.Divider />
              <View style={styles.buttonContainer}>
                <Button
                  title=" New Scan"
                  onPress={toggleScan}
                  icon={
                    <Ionicons name="qr-code-outline" size={24} color="white" />
                  }
                  buttonStyle={{ backgroundColor: 'red' }}
                  titleStyle={{ fontSize: 24, fontWeight: 'bold' }}
                />
                <Button
                  title="Submit"
                  buttonStyle={{ backgroundColor: '#b1d249' }}
                  onPress={handleSubmitAssignment(onSubmitAssignment)}
                  titleStyle={{ fontSize: 24, fontWeight: 'bold' }}
                />
              </View>
            </View>
          </ThemedView>
        </View>
      </Modal>
      {
        Platform.OS === 'web' ? (
          // Web platform specific view WITH OLD DEPRECATED PROPS BECAUSE OF EXPO INCOMPETENCE
          <CameraView
            // @ts-ignore - reason: above comment
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            type="back"
            barCodeScannerSettings={{
              barCodeTypes: 'qr',
            }}
          />
        ) : (
          // Mobile platform specific view
          <CameraView
            style={{ flex: 1 }} // Adjust styles as needed
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
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
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
  popupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
