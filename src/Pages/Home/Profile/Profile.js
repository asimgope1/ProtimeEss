import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import {useDispatch} from 'react-redux';
import SQLitePlugin from 'react-native-sqlite-2';
import {clearAll} from '../../../utils/Storage';
import {checkuserToken} from '../../../redux/actions/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';

const Profile = () => {
  const dispatch = useDispatch();
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
    role: 'Administrator',
    avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // placeholder image
  });

  // SQLite cleanup functions
  const clearDatabase = () => {
    const db = SQLitePlugin.openDatabase({name: 'test.db', version: '1.0'});
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
    const db = SQLitePlugin.openDatabase({name: 'test.db', version: '1.0'});
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM UserCredentials',
        [],
        () => console.log('UserCredentials cleared successfully'),
        error => console.error('Error clearing UserCredentials:', error),
      );
    });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Yes',
        onPress: () => {
          clearAll();
          clearDatabase();
          clearUserCredentials();
          dispatch(checkuserToken(false));
        },
      },
    ]);
  };

  return (

     <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={'transparent'}
            translucent={true}
            animated={true}
          />
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Header title="Profile" onBackPress={() => navigation.goBack()} />
    <ScrollView style={{}}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image source={{uri: user.avatar}} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>{user.role}</Text>
      </View>

      {/* Profile Actions */}
      <View style={styles.menu}>
        <MenuItem
          icon="person-outline"
          label="Edit Profile"
          onPress={() => {}}
        />
        <MenuItem
          icon="lock-closed-outline"
          label="Change Password"
          onPress={() => {}}
        />
        <MenuItem icon="time-outline" label="Activity Log" onPress={() => {}} />
        <MenuItem icon="settings-outline" label="Settings" onPress={() => {}} />
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const MenuItem = ({icon, label, onPress}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Icon name={icon} size={22} color="#333" />
    <Text style={styles.menuText}>{label}</Text>
    <Icon name="chevron-forward-outline" size={20} color="#999" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f8f9fa'},
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 10,
    elevation: 2,
  },
  avatar: {width: 90, height: 90, borderRadius: 50, marginBottom: 10},
  name: {fontSize: 20, fontWeight: 'bold', color: '#333'},
  email: {fontSize: 14, color: '#666', marginBottom: 3},
  role: {fontSize: 14, color: '#007bff', fontWeight: '600'},
  menu: {backgroundColor: '#fff', marginBottom: 20},
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  menuText: {flex: 1, fontSize: 16, color: '#333', marginLeft: 15},
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#dc3545',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {color: '#fff', fontWeight: '600', marginLeft: 8},
});

export default Profile;
