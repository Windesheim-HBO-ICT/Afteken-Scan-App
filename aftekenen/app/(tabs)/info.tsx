import { Text, StyleSheet, View, Button, ScrollView, FlatList } from 'react-native';
import { Card, Header } from '@rneui/base';
import { Assignment, Student, database } from '@/types/types';
import { useEffect, useState } from 'react';

export default function InfoScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
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

    fetchData();
  }, [database])

  const clearDatabase = () => {
    database.clear()
  }

  const exportAssignments = () => {
    database.exportToCsv.bind(database, 'assignments');
  }

  const exportStudents = () => {
    database.exportToCsv.bind(database, 'students');
  }

  const renderAssignmentItem = ({ item }: { item: Assignment }) => (
    <View style={styles.item}>
      <Text>{item.assignmentId}</Text>
      <Text>Done: {item.done ? 'Yes' : 'No'}</Text>
      <Text>Notes: {item.notes}</Text>
    </View>
  );

  const renderStudentItem = ({ item }: { item: Student }) => (
    <View style={styles.item}>
      <Text>{item.name}</Text>
      <Text>Student Number: {item.studentNumber}</Text>
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
    backgroundColor: '#d3d3d3',
    padding: 20,
    marginVertical: 8,
  },
});