import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  StatusBar,
  SafeAreaView,
  Platform,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {BLACK, WHITE} from '../../../constants/color';
import {HEIGHT, WIDTH} from '../../../constants/config';
import Header from '../../../components/Header';
import {getObjByKey} from '../../../utils/Storage';
import SQLitePlugin from 'react-native-sqlite-2';
import moment from 'moment';

const OutdoorApproval = ({navigation}) => {
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
        `${clientUrl}api/ManagerOutdoorApprovalList`,
        requestOptions,
      );
      const result = await response.json();
      console.log('ManagerLeaveApprovalList', result);

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
        return 'red';
    }
  };

  const handleDelete = async id => {
    // Show confirmation alert
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to cancel?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Delete cancelled'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
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
                `${clientUrl}api/ManagerOutdoorCancel`,
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
          },
        },
      ],
      {cancelable: false},
    );
  };

  const handleApprove = async id => {
    // Show confirmation alert
    Alert.alert(
      'Confirm Approve',
      'Are you sure you want to approve ?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Approve cancelled'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            // Handle approve action
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
                `${clientUrl}api/ManagerOutdoorApproval`,
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
            console.log('Approve item with id:', id);
          },
        },
      ],
      {cancelable: false},
    );
  };

  const renderItem = ({item}) => {
    console.log('i', item);
    // let status = '';
    // if (item.leave_status === 'PENDING') {
    //   status = 'orange';
    // } else if (item.leave_status === 'CANCELLED') {
    //   status = 'red';
    // }
    const inTime = moment(item.intime, 'HH:mm:ss').format('hh:mm A');
    const outTime = moment(item.outtime, 'HH:mm:ss').format('hh:mm A');

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
              <Text style={styles.text1}>Staff Name:</Text> {item.staf_nm}
            </Text>
            <Text style={styles.text}>
              {' '}
              <Text style={styles.text1}>Post Type:</Text> {item.post_type}
            </Text>
          </View>
          {/* {status === 'orange' && ( */}
          {/* <TouchableOpacity
            style={styles.deleteIcon}
            onPress={() => handleDelete(item.v_no)}>
            <Icon name="delete" size={24} color="red" />
          </TouchableOpacity> */}
          {/* )} */}
        </View>
        <View style={styles.additionalInfo}>
          <Text style={styles.text}>
            <Text style={styles.text1}>Reason:</Text> {item.reason}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.text1}>In Time</Text>
            {inTime}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.text1}>Out Time: </Text>
            {outTime}
          </Text>

          <Text style={styles.text}>
            {' '}
            {/* <Text style={styles.text1}>Leave Type:</Text> {item.leave_nm} */}
          </Text>
        </View>
        <View
          style={{
            height: HEIGHT * 0.05,
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
          <TouchableOpacity
            onPress={() => {
              handleDelete(item.slno);
            }}
            style={{
              width: '40%',
              backgroundColor: 'lightgray',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 4,
            }}>
            <Text
              style={{
                color: 'black',
                fontSize: 15,
                fontFamily: 'Poppins-Bold',
              }}>
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handleApprove(item.slno);
            }}
            style={{
              width: '40%',
              backgroundColor: 'green',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 4,
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: 15,
                fontFamily: 'Poppins-Bold',
              }}>
              Approve
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={'transparent'}
        translucent={true}
        animated={true}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Header
          title="Outdoor Approval"
          onBackPress={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={styles.flexGrow}
          scrollEnabled={false}>
          <View style={styles.loginContainer}>
            <FlatList
              data={leaveData}
              renderItem={renderItem}
              //   keyExtractor={item => item.v_no.toString()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OutdoorApproval;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  flex: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  detailsContainer: {
    width: '70%',
  },
  dateContainer: {
    width: '20%',
  },
  separator: {
    width: 2.5,
    height: '100%',
    backgroundColor: '#ddd',
    margin: 5,
  },
  text: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: BLACK,
  },
  additionalInfo: {
    marginTop: 10,
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
  flexGrow: {
    flexGrow: 1,
  },
  loginContainer: {
    height: HEIGHT * 0.9,
    width: WIDTH * 0.95,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  header: {
    width: WIDTH,
    height: HEIGHT * 0.2,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: WIDTH * 0.05,
    borderBottomRightRadius: WIDTH * 0.05,
    overflow: 'hidden', // Ensures children stay within rounded corners
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerText: {
    color: 'white',
    fontSize: 23,
    fontFamily: 'Poppins-Bold',
  },
  dateList: {
    marginTop: 20,
  },
  dateItem: {
    width: WIDTH * 0.155,
    height: HEIGHT * 0.1,
    padding: 5,

    justifyContent: 'space-evenly',
    alignItems: 'center',
    // marginHorizontal: 1,
  },
  bottomView: {
    position: 'absolute',
    bottom: 0,
    width: WIDTH * 0.99,
    height: HEIGHT * 0.6,
    backgroundColor: 'white',
    alignSelf: 'center',
    elevation: HEIGHT * 0.2,
    alignItems: 'center',
    borderTopLeftRadius: WIDTH * 0.05,
    borderTopRightRadius: WIDTH * 0.05,
  },
  bottomViewText: {
    color: 'black',
    fontSize: 20,
  },
  searchBar: {
    width: WIDTH * 0.99,
    height: HEIGHT * 0.18,
    elevation: HEIGHT * 0.01,
    paddingTop: 5,
    paddingLeft: 10,
    alignSelf: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
    zIndex: 999,
    shadowColor: '#ccc',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 50,
  },
  tabContainer: {
    flex: 1,
    width: '100%',
    position: 'absolute',
    marginTop: HEIGHT * 0.08,
  },
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContainer: {
    // flex: 1,
    height: HEIGHT * 0.095,
    width: WIDTH * 0.18,

    margin: HEIGHT * 0.015,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  image: {
    width: '100%', // Adjust based on your requirement
    height: HEIGHT * 0.04, // Adjust based on your requirement
    resizeMode: 'contain',
  },
  dateText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerContainer: {
    width: WIDTH,
    height: HEIGHT * 0.18,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  headerContent: {
    width: '90%',
    padding: 1,
    alignItems: 'flex-start',
    position: 'relative',
    marginTop: 20,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
  },
});
