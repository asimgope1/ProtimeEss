import React, {useEffect, useState} from 'react';
import {ScrollView, View, Text, Button} from 'react-native';
import SQLitePlugin from 'react-native-sqlite-2';

const Database = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const db = SQLitePlugin.openDatabase({
      name: 'test.db',
      version: '1.0',
      description: '',
      size: 1,
    });

    // Create table if not exists
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS Users(user_id INTEGER PRIMARY KEY NOT NULL, name VARCHAR(30))',
        [],
        () => console.log('Table created successfully'),
        error => console.error('Error creating table:', error),
      );
    });

    // Fetch users from the database
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Users',
        [],
        (_, {rows}) => {
          const users = rows._array;
          setUsers(users);
        },
        error => console.error('Error fetching users:', error),
      );
    });

    // Close the database connection when component unmounts
    return () => db.close();
  }, []);

  // Function to handle adding a new name to the database
  const addNameToDatabase = name => {
    const db = SQLitePlugin.openDatabase({
      name: 'test.db',
      version: '1.0',
      description: '',
      size: 1,
    });
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO Users (name) VALUES (?)',
        [name],
        () => {
          console.log('Name added to database:', name);
          // After adding the name, fetch the updated list of users from the database
          fetchUsersFromDatabase();
        },
        error => console.error('Error adding name to database:', error),
      );
    });
  };

  // Function to fetch users from the database and update state
  const fetchUsersFromDatabase = () => {
    const db = SQLitePlugin.openDatabase({
      name: 'test.db',
      version: '1.0',
      description: '',
      size: 1,
    });
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Users',
        [],
        (_, {rows}) => {
          const users = rows._array;
          setUsers(users);
        },
        error => console.error('Error fetching users:', error),
      );
    });
  };

  const clearDatabase = () => {
    const db = SQLitePlugin.openDatabase({
      name: 'test.db',
      version: '1.0',
      description: '',
      size: 1,
    });
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM Users',
        [],
        () => {
          console.log('All names cleared from database');
          // After clearing the names, fetch the updated list of users from the database
          fetchUsersFromDatabase();
        },
        error => console.error('Error clearing database:', error),
      );
    });
  };

  return (
    <ScrollView>
      <View style={{padding: 20}}>
        <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 10}}>
          Users:
        </Text>
        {users.map(user => (
          <Text key={user.user_id}>{user.name}</Text>
        ))}
        <Button title="Add Name" onPress={() => addNameToDatabase('656858')} />
        <Button
          title="Clear"
          onPress={() => {
            clearDatabase();
          }}
        />
        {/* Add your UI components here if needed */}
      </View>
    </ScrollView>
  );
};

export default Database;
