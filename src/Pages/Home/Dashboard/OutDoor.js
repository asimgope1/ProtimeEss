import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import {HEIGHT, WIDTH} from '../../../constants/config';
import Header from '../../../components/Header';
import DateTimePicker from '@react-native-community/datetimepicker';
import {BLACK, GRAY, ORANGE, RED, WHITE} from '../../../constants/color';
import moment from 'moment';
import SQLitePlugin from 'react-native-sqlite-2';
import {CheckBox, Icon} from '@rneui/themed';
import {getObjByKey} from '../../../utils/Storage';
import LinearGradient from 'react-native-linear-gradient';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

const TopTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="OutDoor"
      screenOptions={{
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarIndicatorStyle: {
          backgroundColor: RED,
        },
        tabBarPressOpacity: 0.1,
        tabBarPressColor: 'white',

        tabBarStyle: {
          height: HEIGHT * 0.06,
          width: WIDTH * 0.95,
          alignSelf: 'center',
          marginTop: 10,
          borderWidth: 0.2,
          borderColor: 'gray',

          // backgroundColor: 'white',
        },
      }}>
      <Tab.Screen name="Apply OutDoor" component={OD} />
      <Tab.Screen name="View Report" component={Report} />
    </Tab.Navigator>
  );
};

const Report = ({navigation}) => {
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
            console.log('url', url);
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
      OutdoorStatus(Id, Sl);
    }
  }, [Id, Sl, clientUrl, navigation]);

  const OutdoorStatus = async (ID, SL) => {
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
        `${clientUrl}api/outdoortatus`,
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
        `${clientUrl}api/OutdoorCancel`,
        requestOptions,
      );
      const result = await response.json();
      console.log('status', result);
      if (result.Code === '200') {
        alert(result.msg);
        OutdoorStatus(Id, Sl);
      }
    } catch (error) {
      console.error('Error fetching leave status:', error);
    }
    console.log('Delete item with id:', id);
  };

  const renderItem = ({item}) => {
    let status = '';
    if (item.outdoor_status === 'PENDING') {
      status = 'orange';
    } else if (item.outdoor_status === 'CANCELLED') {
      status = 'red';
    }

    return (
      <View
        style={[
          styles.card,
          {borderLeftColor: getBorderColor(item.outdoor_status)},
        ]}>
        <View style={styles.row}>
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{item.date}</Text>
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
              onPress={() => handleDelete(item.sl)}>
              <Icon name="delete" size={24} color="red" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.additionalInfo}>
          <Text style={styles.text}>
            <Text style={styles.text1}>From Date: </Text>
            {item.out_time}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.text1}>To Date: </Text>
            {item.in_time}
          </Text>
          <Text style={styles.text}>
            {' '}
            <Text style={styles.text1}>Leave Status:</Text>{' '}
            {item.outdoor_status}
          </Text>
          <Text style={styles.text}>
            {' '}
            <Text style={styles.text1}>Leave Type:</Text> {item.post_type}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        // backgroundColor: 'red',
        alignSelf: 'center',
        alignItems: 'center',
      }}>
      <View
        style={{
          height: HEIGHT * 0.9,
        }}>
        <FlatList
          data={leaveData}
          renderItem={renderItem}
          ListFooterComponent={<View style={{height: 50}} />}
        />
      </View>
    </View>
  );
};

const OD = ({}) => {
  const [fromTime, setFromTime] = useState(new Date());
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [reason, setReason] = useState('');
  const [clientUrl, setClientUrl] = useState('');

  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [toTime, setToTime] = useState(new Date());
  const [Id, setID] = useState();
  const [Sl, setSl] = useState();
  const [Both, setBoth] = useState();
  const [In, setIn] = useState();
  const [Out, setOut] = useState();

  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchClientUrlFromSQLite();
        await RetrieveDetails();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
    initialize();
  }, []);
  const RetrieveDetails = async () => {
    try {
      const value = await getObjByKey('loginResponse');
      if (value !== null) {
        console.log('value', value);
        const ID = value[0]?.loc_cd;
        setID(value[0]?.loc_cd);
        setSl(value[0]?.staf_sl);
      }
    } catch (e) {
      console.error('Error retrieving details:', e);
    }
  };

  const db = SQLitePlugin.openDatabase({
    name: 'test.db',
    version: '1.0',
    description: '',
    size: 1,
  });

  const fetchClientUrlFromSQLite = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT client_url FROM ApiResponse ORDER BY id DESC LIMIT 1',
        [],
        (_, {rows}) => {
          const url = rows.item(0)?.client_url || '';
          setClientUrl(url);

          console.log('rr', url);
        },
        error => {
          console.error('Error fetching client_url:', error);
        },
      );
    });
  };
  console.log('tym', moment(toTime).format('DD-MMM-YYYY hh:mm A'));

  const handleOutDoor = () => {
    let post = null;
    if (Both === true) {
      post = 'BOTH';
    } else if (In === true) {
      post = 'IN';
    } else if (Out === true) {
      post = 'OUT';
    }
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      loc_cd: Id,
      staf_sl: Sl,
      from_dt: fromDate,
      to_dt: toDate,
      in_time: fromTime,
      out_time: toTime,
      reason: reason,
      post_type: post,
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    fetch(`${clientUrl}api/outdoor`, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log('out', result);
      })
      .catch(error => console.error(error));
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
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          scrollEnabled={false}>
          <View style={styles.loginContainer}>
            <View
              style={{
                width: WIDTH * 0.9,
                height: HEIGHT * 0.038,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 5,
              }}>
              <Text
                style={{
                  color: BLACK,
                  fontSize: 15,
                  marginBottom: 10,
                  fontFamily: 'Poppins-Bold',
                }}>
                Select Date
              </Text>
            </View>

            <View
              style={{
                width: WIDTH * 0.95,
                height: HEIGHT * 0.1,
                borderColor: '#ccc',
                borderWidth: 1,
                marginBottom: 10,
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row',
                padding: 10,
                paddingTop: 25,
              }}>
              <TouchableOpacity
                onPress={() => {
                  setShowFromDatePicker(true);
                }}
                style={{
                  width: '45%',
                  height: HEIGHT * 0.1,
                }}>
                <Text
                  style={{
                    color: GRAY,
                  }}>
                  From
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={styles.dateText}>{fromDate.toDateString()}</Text>

                  <Icon name="calendar-today" size={HEIGHT * 0.03} />
                </View>

                {showFromDatePicker && (
                  <DateTimePicker
                    value={fromDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowFromDatePicker(false);
                      if (selectedDate) {
                        setFromDate(selectedDate);
                      }
                    }}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowToDatePicker(true);
                }}
                style={{
                  width: '45%',
                  height: HEIGHT * 0.1,
                }}>
                <Text
                  style={{
                    color: GRAY,
                  }}>
                  To
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={styles.dateText}>{toDate.toDateString()}</Text>

                  <Icon name="calendar-today" size={HEIGHT * 0.03} />
                </View>

                {showToDatePicker && (
                  <DateTimePicker
                    value={toDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowToDatePicker(false);
                      if (selectedDate) {
                        setToDate(selectedDate);
                      }
                    }}
                  />
                )}
              </TouchableOpacity>
            </View>

            <View
              style={{
                width: WIDTH * 0.9,
                height: HEIGHT * 0.038,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 5,
              }}>
              <Text
                style={{
                  color: BLACK,
                  fontSize: 15,
                  marginBottom: 10,
                  fontFamily: 'Poppins-Bold',
                }}>
                Select Time
              </Text>
            </View>
            <View
              style={{
                width: WIDTH * 0.95,
                height: HEIGHT * 0.1,
                borderColor: '#ccc',
                borderWidth: 1,
                marginBottom: 10,
                alignSelf: 'center',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row',
                padding: 10,
                paddingTop: 25,
              }}>
              <TouchableOpacity
                style={{
                  width: '30%',
                  height: HEIGHT * 0.1,
                  marginLeft: 8,
                }}
                onPress={() => {
                  setShowFromTimePicker(true);
                }}>
                <Text
                  style={{
                    color: GRAY,
                  }}>
                  From
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={styles.dateText}>
                    {moment(fromTime).format('hh:mm A')}
                  </Text>
                  <Icon name="watch-later" size={HEIGHT * 0.03} />
                </View>
              </TouchableOpacity>
              {showFromTimePicker && (
                <DateTimePicker
                  value={fromTime}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowFromTimePicker(false);
                    if (selectedTime) {
                      setFromTime(selectedTime);
                    }
                  }}
                />
              )}
              <TouchableOpacity
                style={{
                  width: '30%',
                  height: HEIGHT * 0.1,
                  marginLeft: 8,
                }}
                onPress={() => {
                  setShowToTimePicker(true);
                }}>
                <Text
                  style={{
                    color: GRAY,
                  }}>
                  To
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text style={styles.dateText}>
                    {moment(toTime).format('hh:mm A')}
                  </Text>
                  <Icon name="watch-later" size={HEIGHT * 0.03} />
                </View>
              </TouchableOpacity>
              {showToTimePicker && (
                <DateTimePicker
                  value={toTime}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    setShowToTimePicker(false);
                    if (selectedTime) {
                      setToTime(selectedTime);
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.checklistContainer}>
              <CheckBox
                title="Both"
                checked={Both}
                onPress={() => {
                  setBoth(true);
                  setIn(false);
                  setOut(false);
                }}
              />
              <CheckBox
                title="IN"
                checked={In}
                onPress={() => {
                  setIn(true);
                  setBoth(false);
                  setOut(false);
                }}
              />
              <CheckBox
                title="OUT"
                checked={Out}
                onPress={() => {
                  setOut(true);
                  setBoth(false);
                  setIn(false);
                }}
              />
            </View>

            <View
              style={{
                width: WIDTH * 0.95,
                height: HEIGHT * 0.038,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 5,
              }}>
              <Text
                style={{
                  color: BLACK,
                  fontSize: 14,
                  marginBottom: 10,
                  fontFamily: 'Poppins-Bold',
                }}>
                Enter Your Reason
              </Text>
            </View>
            <View>
              <TextInput
                style={styles.input}
                placeholder="Enter Reason"
                placeholderTextColor="#888"
                value={reason}
                onChangeText={text => setReason(text)}
                multiline={true}
              />
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: 40,
                // marginTop: HEIGHT * 0.1,
              }}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  if (
                    fromDate === '' ||
                    toDate === '' ||
                    fromTime === '' ||
                    toTime === '' ||
                    reason === '' ||
                    (Both === false && In === false && Out === false)
                  ) {
                    alert('Please fill all the fields');
                  } else {
                    handleOutDoor();
                  }
                }}>
                <LinearGradient
                  colors={['#b4000a', '#ff6347']}
                  style={styles.buttonBackground}>
                  <Text style={styles.buttonText}>Submit</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const OutDoor = ({navigation}) => {
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
        <Header title="OutDoor" onBackPress={() => navigation.goBack()} />
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          scrollEnabled={false}>
          <TopTabs />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OutDoor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    alignSelf: 'center',
    alignItems: 'center',
    width: '100%',
  },
  flex: {
    flex: 1,
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
  sectionContainer: {
    width: WIDTH * 0.9,
    height: HEIGHT * 0.038,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sectionTitle: {
    color: BLACK,
    fontSize: 15,
    marginBottom: 10,
    fontFamily: 'Poppins-Bold',
  },
  dateTimeContainer: {
    width: WIDTH * 0.95,
    height: HEIGHT * 0.1,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 10,
    paddingTop: 25,
  },
  datePicker: {
    width: '45%',
    height: HEIGHT * 0.1,
  },
  dateLabel: {
    color: GRAY,
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    color: BLACK,
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    marginTop: 10,
  },
  timePicker: {
    width: '45%',
    height: HEIGHT * 0.1,
  },
  timeLabel: {
    color: GRAY,
  },
  timePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    color: 'black',
    width: WIDTH * 0.95,
    height: HEIGHT * 0.1,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  checklistContainer: {
    flexDirection: 'row',
    height: HEIGHT * 0.07,
    width: WIDTH * 0.95,
    backgroundColor: WHITE,
    elevation: 2,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    width: WIDTH * 0.9,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    // marginTop: 10,
  },
  buttonBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: WHITE,
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
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
