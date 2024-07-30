import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {getObjByKey} from '../../../utils/Storage';
import SQLitePlugin from 'react-native-sqlite-2';
import Header from '../../../components/Header';
import {WIDTH} from '../../../constants/config';
import {BLACK, RED, WHITE} from '../../../constants/color';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LeaveStatus = ({navigation}) => {
  const [clientUrl, setClientUrl] = useState('');
  const [Id, setID] = useState();
  const [Sl, setSl] = useState();
  const [loading, setLoading] = useState(true);
  const [leaveData, setLeaveData] = useState([]);

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
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (Id && Sl && clientUrl) {
      fetchLeaveStatus(Id, Sl);
    }
  }, [Id, Sl, clientUrl]);

  const fetchLeaveStatus = async (ID, SL) => {
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
        `${clientUrl}api/leavestatus`,
        requestOptions,
      );
      const result = await response.json();
      console.log('status', result);

      if (result && result.data_value) {
        setLeaveData(result.data_value);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching leave status:', error);
    }
  };

  const getBorderColor = status => {
    switch (status) {
      case 'PENDING':
        return 'orange';
      case 'CANCELLED':
        return 'red';
      default:
        return 'green';
    }
  };

  const handleDelete = async id => {
    // Handle delete action

    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const raw = JSON.stringify({id: id});

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      const response = await fetch(
        `${clientUrl}api/LeaveCancel`,
        requestOptions,
      );
      const result = await response.json();
      console.log('status', result);
      if (result.Code === '200') {
        alert(result.msg);
        fetchLeaveStatus(Id, Sl);
      }
    } catch (error) {
      console.error('Error fetching leave status:', error);
    }
    console.log('Delete item with id:', id);
  };

  const renderItem = ({item}) => {
    let status = '';
    if (item.leave_status === 'PENDING') {
      status = 'orange';
    } else if (item.leave_status === 'CANCELLED') {
      status = 'red';
    }

    return (
      <View
        style={[
          styles.card,
          {borderLeftColor: getBorderColor(item.leave_status)},
        ]}>
        <View style={styles.row}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{item.apply_dt}</Text>
          </View>
          <View style={styles.separator}></View>
          <View style={styles.detailsContainer}>
            <Text style={styles.text}>
              <Text style={styles.text1}>Leave Name:</Text> {item.leave_nm}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.text1}>Reason:</Text> {item.reason}
            </Text>
          </View>
          {status === 'orange' && (
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => handleDelete(item.v_no)}>
              <Icon name="delete" size={24} color="red" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.additionalInfo}>
          <Text style={styles.text}>
            <Text style={styles.text1}>From Date: </Text>
            {item.from_date}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.text1}>To Date: </Text>
            {item.to_date}
          </Text>
          <Text style={styles.text}>
            {' '}
            <Text style={styles.text1}>Leave Status:</Text> {item.leave_status}
          </Text>
          <Text style={styles.text}>
            {' '}
            <Text style={styles.text1}>Leave Type:</Text> {item.leave_type}
          </Text>
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
        <Header title="Leave Status" onBackPress={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.loginContainer}>
            <FlatList
              data={leaveData}
              renderItem={renderItem}
              keyExtractor={item => item.v_no.toString()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LeaveStatus;

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
    width: WIDTH * 0.9,
    padding: 10,
    marginVertical: 5,
    borderLeftWidth: 5,
    borderRadius: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    width: '20%',
  },
  dateText: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: BLACK,
  },
  separator: {
    width: 2.5,
    height: '100%',
    backgroundColor: '#ddd',
    margin: 5,
  },
  detailsContainer: {
    width: '70%',
  },
  text: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: BLACK,
  },
  text1: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: BLACK,
  },
  deleteIcon: {
    width: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionalInfo: {
    marginTop: 10,
  },
  flex: {
    flex: 1,
  },
});
