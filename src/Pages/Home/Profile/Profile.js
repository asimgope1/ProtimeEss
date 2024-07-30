import {View, Text, Button} from 'react-native';
import React from 'react';
import {useDispatch} from 'react-redux';
import {clearAll} from '../../../utils/Storage';
import {checkuserToken} from '../../../redux/actions/auth';
import SQLitePlugin from 'react-native-sqlite-2';

const Profile = () => {
  const clearDatabase = () => {
    const db = SQLitePlugin.openDatabase({
      name: 'test.db',
      version: '1.0',
      description: '',
      size: 1,
    });

    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM ApiResponse',
        [],
        () => console.log('Database cleared successfully'),
        error => console.error('Error clearing database:', error),
      );
    });
  };
  const clearUserCredentials = () => {
    const db = SQLitePlugin.openDatabase({
      name: 'test.db',
      version: '1.0',
      description: '',
      size: 1,
    });

    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM UserCredentials',
        [],
        () => console.log('UserCredentials cleared successfully'),
        error => console.error('Error clearing UserCredentials:', error),
      );
    });
  };

  const dispatch = useDispatch();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
      }}>
      <Button
        title="LogOut"
        onPress={() => {
          console.log('LogOut');
          clearAll();
          dispatch(checkuserToken(false));
          // clearDatabase(); // Clear SQLite database
          // clearUserCredentials();
        }}
      />
    </View>
  );
};

export default Profile;
