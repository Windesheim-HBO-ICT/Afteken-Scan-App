import { StyleSheet, View, Text, Button, Alert, Platform, ScrollView, TextInput, Switch } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Card, Header } from '@rneui/base';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Assignment, Student, StudentDatabase, database } from '@/types/types';
import { Database } from '@/logic/database';

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
  const [scanned, setScanned] = useState(true);

  const {
    register: registerAssignment,
    handleSubmit: handleSubmitAssignment,
    setValue: setValueAssignment,
    watch: watchAssignment,
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
    formState: { errors: errorsStudent }
  } = useForm<StudentFormInputs>();

  const onSubmitAssignment: SubmitHandler<AssignmentFormInputs> = async (data) => {
    console.log(data)

    const students = await database.select('students');
    const student = students.find(student => student.studentNumber === data.studentNumber);

    if (!student) {
      const studentName = prompt('Enter the student name')
      if (!studentName) {
        return
      }

      database.insert('students', { studentNumber: data.studentNumber, name: studentName })
    } else {
      // Double check that the student name is correct
      if (confirm(`Is ${student.name} the correct student?`)) {
        data.studentNumber = student.studentNumber
      } else {
        return
      }
    }

    const newAssignment: Assignment = {
      ...data,
      done: !!data.done,
      timestamp: Date.now()
    }

    database.insert('assignments', newAssignment)
    console.log(database)
  };

  const onSubmitStudent: SubmitHandler<StudentFormInputs> = async (data) => {
    console.log(data)

    const studentData: Student = {
      studentNumber: data.studentNumber,
      name: data.studentName,
    };

    database.insert('students', studentData)
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
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const clearDatabase = () => {
    database.clear()
  }

  const exportAssignments = () => {
    database.exportToCsv.bind(database, 'assignments');
  }

  const exportStudents = () => {
    database.exportToCsv.bind(database, 'students');
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
      {scanned ?
        <ScrollView>
          <View style={styles.container}>
            <Card>
              <Card.Title>Assignments</Card.Title>
              <Card.Divider />
              <View>
                <TextInput
                  placeholder="Student Number"
                  onChangeText={(text) => setValueAssignment('studentNumber', text)}
                  style={styles.input}
                  value={watchAssignment('studentNumber')}
                />
                {errorsAssignment.studentNumber && <Text style={styles.errorText}>This field is required</Text>}

                <TextInput
                  placeholder="Assignment ID"
                  onChangeText={(text) => setValueAssignment('assignmentId', text)}
                  style={styles.input}
                  value={watchAssignment('assignmentId')}
                />
                {errorsAssignment.assignmentId && <Text style={styles.errorText}>This field is required</Text>}

                <View style={styles.switchContainer}>
                  <Text>Done</Text>
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

                <Button title="Scan QR" onPress={toggleScan} />
                <Card.Divider />
                <Button title="Submit" onPress={handleSubmitAssignment(onSubmitAssignment)} />
              </View>
            </Card>
            <Card>
              <Card.Title>Students</Card.Title>
              <Card.Divider />
              <TextInput
                placeholder="Student Number"
                onChangeText={(text) => setValueStudent('studentNumber', text)}
                style={styles.input}
                value={watchStudent('studentNumber')}
              />
              {errorsStudent.studentNumber && <Text style={styles.errorText}>This field is required</Text>}

              <TextInput
                placeholder="Student Name"
                onChangeText={(text) => setValueStudent('studentName', text)}
                style={styles.input}
                value={watchStudent('studentName')}
              />
              {errorsStudent.studentName && <Text style={styles.errorText}>This field is required</Text>}

              <Button title="Submit" onPress={handleSubmitStudent(onSubmitStudent)} />
            </Card>
            <Card>
              <Button title='Export Assignments' onPress={exportAssignments}></Button>
              <Card.Divider />
              <Button title='Export Students' onPress={exportStudents}></Button>
              <Card.Divider />
              <Card.Divider />
              <Button title='Clear Database' onPress={clearDatabase}></Button>
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
              <Button title="Return" onPress={toggleScan} />
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
              <Button title="Return" onPress={toggleScan} />
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
});