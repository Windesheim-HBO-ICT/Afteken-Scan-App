import { Text, StyleSheet, View, Button, ScrollView, FlatList } from 'react-native';
import { Card, CheckBox, Header } from '@rneui/base';
import { Assignment, Student, database } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function InfoScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const fetchData = async () => {
    try {
      const studentsDB = await database.select('students');
      const assignmentsDB = await database.select('assignments');
      setStudents(studentsDB);
      setAssignments(assignmentsDB);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const clearDatabase = () => {
    database.clear()
    fetchData();
  }

  const exportAssignments = async () => {
    try {
      await database.exportToCsv('assignments');
    } catch (error) {
      console.error('Error exporting assignments:', error);
    }
  }

  const exportStudents = async () => {
    try {
      await database.exportToCsv('students');
    } catch (error) {
      console.error('Error exporting students:', error);
    }
  }

  const renderAssignmentItem = ({ item }: { item: Assignment }) => (
    <View style={styles.item}>
      <Text style={styles.header}>Assignment ID: {item.assignmentId}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={item.done ? 'checkmark-circle' : 'close-circle'} size={20} color={item.done ? 'green' : 'red'} style={{ marginRight: 5 }} />
        <Text style={styles.label}>Done: {item.done ? 'Yes' : 'No'}</Text>
      </View>
      <Text style={styles.label}>Student: {item.studentNumber}</Text>
      <Text style={styles.label}>Notes: {item.notes}</Text>
    </View>
  );

  const renderStudentItem = ({ item }: { item: Student }) => (
    <View style={styles.item}>
      <Text style={styles.header}>Student Name: {item.name}</Text>
      <Text style={styles.label}>Student Number: {item.studentNumber}</Text>
    </View>
  );

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
            <FlatList
              scrollEnabled={false}
              data={assignments}
              renderItem={renderAssignmentItem}
              keyExtractor={(item) => item.assignmentId}
            />
            <View>
            </View>
          </Card>
          <Card>
            <Card.Title>Students</Card.Title>
            <Card.Divider />
            <FlatList
              scrollEnabled={false}
              data={students}
              renderItem={renderStudentItem}
              keyExtractor={(item) => item.studentNumber}
            />
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
  item: {
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 3,
  },
});