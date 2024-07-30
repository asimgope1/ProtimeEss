import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  FlatList,
} from 'react-native';
import {getObjByKey} from '../../../utils/Storage';
import SQLitePlugin from 'react-native-sqlite-2';
import {WIDTH} from '../../../constants/config';
import {RED, WHITE} from '../../../constants/color';
import Header from '../../../components/Header';

const LeaveBalance = ({navigation}) => {
  const [clientUrl, setClientUrl] = useState('');
  const [Id, setID] = useState();
  const [Sl, setSl] = useState();
  const [loading, setLoading] = useState(true);
  const [Balance, setBalance] = useState([]);

  const db = SQLitePlugin.openDatabase({
    name: 'test.db',
    version: '1.0',
    description: '',
    size: 1,
  });

  const fetchClientUrlFromSQLite = () => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT client_url FROM ApiResponse ORDER BY id DESC LIMIT 1',
          [],
          (_, {rows}) => {
            const url = rows.item(0)?.client_url || '';
            setClientUrl(url);
            resolve();
          },
          error => {
            console.error('Error fetching client_url:', error);
            reject(error);
          },
        );
      });
    });
  };

  const RetrieveDetails = async () => {
    try {
      const value = await getObjByKey('loginResponse');
      if (value !== null) {
        console.log('value', value);
        setID(value[0]?.loc_cd);
        setSl(value[0]?.staf_sl);
      }
    } catch (e) {
      console.error('Error retrieving details:', e);
    }
  };

  const initialize = async () => {
    try {
      await fetchClientUrlFromSQLite();
      await RetrieveDetails();
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (Id && Sl && clientUrl) {
      fetchLeaveBalance(Id, Sl);
    }
  }, [Id, Sl, clientUrl]);

  const fetchLeaveBalance = async (ID, SL) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const raw = JSON.stringify({
        loc_cd: ID,
        staf_sl: SL,
      });

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      const response = await fetch(
        `${clientUrl}api/leavebalanceview`,
        requestOptions,
      );
      const result = await response.json();
      if (result.Code === '200') {
        setBalance(result.data_value);
      }
      console.log('balance', result);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorByName = name => {
    switch (name) {
      case 'Paid Leave':
        return styles.paidLeave;
      case 'Casual Leave':
        return styles.casualLeave;
      case 'Sick Leave':
        return styles.sickLeave;
      default:
        return styles.defaultLeave;
    }
  };

  const renderItem = ({item}) => {
    console.log('item', item);
    let color = '';
    if (item.Name === 'Paid Leave') {
      color = 'green';
    } else if (item.Name === 'Casual Leave') {
      color = 'orange';
    } else if (item.Name === 'Sick Leave') {
      color = 'red';
    } else {
      color = 'black';
    }

    return (
      <View
        style={{
          ...styles.card,
          borderColor: color,
        }}>
        <View style={styles.rightContainer}>
          <Text style={[styles.nameText, getColorByName(item.Name)]}>
            {item.Name}
          </Text>
        </View>
        <View style={styles.separator}></View>

        <View style={styles.leftContainer}>
          <Text style={styles.balanceText}>{item.Balance}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={RED} />
      </View>
    );
  }

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
        <Header title="Leave Balance" onBackPress={() => navigation.goBack()} />
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          scrollEnabled={false}>
          <View style={styles.loginContainer}>
            <FlatList
              data={Balance}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LeaveBalance;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: WHITE,
    alignSelf: 'center',
    alignItems: 'center',
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  loginContainer: {
    flex: 1,
    width: WIDTH * 0.95,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: WIDTH * 0.9,
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: 'white',
    borderLeftWidth: 3,

    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'center',
  },
  balanceText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: 'black',
  },
  separator: {
    width: 1,
    height: '100%',
    backgroundColor: '#ddd',
    marginHorizontal: 10,
  },
  rightContainer: {
    flex: 1,
    alignItems: 'flex-start', // Align items to the left
  },
  nameText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: 'black',
  },
  paidLeave: {
    color: 'green',
  },
  casualLeave: {
    color: 'orange',
  },
  sickLeave: {
    color: 'red',
  },
  defaultLeave: {
    color: 'black',
  },
  flex: {
    flex: 1,
  },
});
