import { StyleSheet, View, ScrollView, FlatList } from 'react-native';
import { Button, CheckBox, Header } from '@rneui/base';
import { Assignment, Student, database } from '@/types/types';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@rneui/themed';

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
    <ThemedView style={styles.item}>
      <ThemedText style={styles.header}>Assignment ID: {item.assignmentId}</ThemedText>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={item.done ? 'checkmark-circle' : 'close-circle'} size={20} color={item.done ? 'green' : 'red'} style={{ marginRight: 5 }} />
        <ThemedText style={styles.label}>Done: {item.done ? 'Yes' : 'No'}</ThemedText>
      </View>
      <ThemedText style={styles.label}>Student: {item.studentNumber}</ThemedText>
      <ThemedText style={styles.label}>Notes: {item.notes}</ThemedText>
    </ThemedView>
  );

  const renderStudentItem = ({ item }: { item: Student }) => (
    <View style={styles.item}>
      <ThemedText style={styles.header}>Student Name: {item.name}</ThemedText>
      <ThemedText style={styles.label}>Student Number: {item.studentNumber}</ThemedText>
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
        <ThemedView style={styles.container}>
          <Card>
            <Card.Title>Assignments</Card.Title>
            <Card.Divider />
            <FlatList
              scrollEnabled={false}
              data={assignments}
              renderItem={renderAssignmentItem}
              keyExtractor={(item) => JSON.stringify(item)}
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
            <Button
              title=" Export Assignments"
              onPress={exportAssignments}
              icon={<Ionicons name="document-text-outline" size={18} color="white" />}
              buttonStyle={{ backgroundColor: '#2196F3', marginBottom: 10 }}
              titleStyle={{ fontSize: 16 }}
            />

            <Card.Divider />

            <Button
              title=" Export Students"
              onPress={exportStudents}
              icon={<Ionicons name="people-outline" size={18} color="white" />}
              buttonStyle={{ backgroundColor: '#FF9800', marginBottom: 10 }}
              titleStyle={{ fontSize: 16 }}
            />

            <Card.Divider />
            <Card.Divider />

            <Button
              title=" Clear Database"
              onPress={clearDatabase}
              icon={<Ionicons name="trash-outline" size={18} color="white" />}
              buttonStyle={{ backgroundColor: '#F44336' }}
              titleStyle={{ fontSize: 16 }}
            />
          </Card>
        </ThemedView>
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
