import { StyleSheet, View, Text, Button, Alert, Platform, ScrollView, TextInput, Switch } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Card, Header } from '@rneui/base';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Assignment, Student, StudentDatabase, database } from '@/types/types';
import { Database } from '@/logic/database';

export default function InfoScreen() {
  const clearDatabase = () => {
    database.clear()
  }

  const exportAssignments = () => {
    database.exportToCsv.bind(database, 'assignments');
  }

  const exportStudents = () => {
    database.exportToCsv.bind(database, 'students');
  }

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
      <ScrollView>
        <View style={styles.container}>
          <Card>
            <Card.Title>Assignments</Card.Title>
            <Card.Divider />
            <View>
            </View>
          </Card>
          <Card>
            <Card.Title>Students</Card.Title>
            <Card.Divider />
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