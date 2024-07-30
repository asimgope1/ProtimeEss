import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {HEIGHT, WIDTH} from '../../Login/Login';
import {BLACK, GRAY, ORANGE, RED, WHITE} from '../../../constants/color';
import Header from '../../../components/Header';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import moment from 'moment';
import SQLitePlugin from 'react-native-sqlite-2';
import {getObjByKey} from '../../../utils/Storage';
import LinearGradient from 'react-native-linear-gradient';
import {CheckBox, Icon} from '@rneui/themed';

const CoffEntry = ({navigation}) => {
  const [fullDay, setFullDay] = useState(true);
  const [halfDay, setHalfDay] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [reason, setReason] = useState('');
  const [clientUrl, setClientUrl] = useState('');
  const [Id, setID] = useState();
  const [Sl, setSl] = useState();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balance, setBalance] = useState(0);
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

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
  const RetrieveDetails = async () => {
    try {
      const value = await getObjByKey('loginResponse');
      if (value !== null) {
        console.log('value', value);
        const ID = value[0]?.loc_cd;
        await leaveList(ID);
        setID(value[0]?.loc_cd);
        setSl(value[0]?.staf_sl);
      }
    } catch (e) {
      console.error('Error retrieving details:', e);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      leaveList(Id);
    }, 100);
    timeoutId;
  }, [Id, leaveList]);

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

  const handleApplyLeave = () => {
    let half = 1; // Default value assuming full day leave
    if (fullDay) {
      half = 1;
    } else if (halfDay) {
      half = 0.5;
    }

    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      loc_cd: Id,
      staf_sl: Sl,
      from_dt: fromDate,
      to_dt: toDate,
      leave_tp: 'N',
      reason: reason,
      contact: contact,
      emailid: email,
      leave_nm: leaveType,
      half: half,
    });

    console.log('raw', raw);

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    fetch(`${clientUrl}api/coffapply`, requestOptions)
      .then(response => response.json())
      .then(result => {
        if (result.Code === '200') {
          alert(result.msg);
        }
        console.log('applyyy', result);
      })
      .catch(error => console.error(error));
  };

  const leaveList = async loc => {
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      loc_cd: loc,
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    try {
      const response = await fetch(
        `${clientUrl}/api/coffdisplay`,
        requestOptions,
      );
      const result = await response.json();
      setLoading(false);
      if (result.data_value) {
        const leaveTypesData = result.data_value.map(item => ({
          label: item.leave_nm.toUpperCase(),
          value: item.leave_nm.toUpperCase(),
        }));
        setLeaveTypes(leaveTypesData);
      } else {
        console.error('Unexpected response structure:', result);
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching leave list:', error);
    }
  };

  const LeaveSelected = async item => {
    console.log('Selected leave type:', item);
    setLeaveType(item);

    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      staf_sl: Sl,
      loc_cd: Id,
      leave_nm: item,
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    try {
      const response = await fetch(
        `${clientUrl}/api/leavebalance`,
        requestOptions,
      );
      const result = await response.json();
      setBalance(result.Leave_balance);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  console.log('id', leaveType);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header title="Coff Entry" onBackPress={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: WHITE,
        }}>
        <View style={styles.container}>
          <View style={styles.checklistContainer}>
            <CheckBox
              title="Full Day"
              checked={fullDay}
              onPress={() => {
                setFullDay(true);
                setHalfDay(false);
                leaveList(Id);
              }}
            />
            <CheckBox
              title="Half Day"
              checked={halfDay}
              onPress={() => {
                setFullDay(false);
                setHalfDay(true);
                leaveList(Id);
              }}
            />
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
                fontSize: 14,
                marginBottom: 10,
                fontFamily: 'Poppins-Bold',
              }}>
              Select Date
            </Text>
            <Text style={{color: ORANGE, fontSize: 17, marginBottom: 10}}>
              {/* total number of date calculated from from and to date  */}
              {Math.max(moment(toDate).diff(moment(fromDate), 'days') + 1, 0) *
                (fullDay ? 1 : halfDay ? 0.5 : 1)}{' '}
              Days
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
                leaveList(Id);
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
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                leaveList(Id);
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
            </TouchableOpacity>
          </View>
          {/* <TouchableOpacity onPress={() => setShowFromDatePicker(true)}>
        <Text style={styles.dateText}>
          From Date: {fromDate.toDateString()}
        </Text>
      </TouchableOpacity> */}
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
          {/* <TouchableOpacity onPress={() => setShowToDatePicker(true)}>
        <Text style={styles.dateText}>To Date: {toDate.toDateString()}</Text>
      </TouchableOpacity> */}
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

          <View>
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
                Leave Type
              </Text>
              <Text
                style={{
                  color: 'blue',
                  fontSize: 14,
                  marginBottom: 10,
                  fontFamily: 'Poppins-Bold',
                }}>
                Balance: {balance} days
              </Text>
            </View>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="red"
                style={{marginTop: 10}}
              />
            ) : (
              <Picker
                selectedValue={leaveType}
                dropdownIconColor={BLACK}
                style={styles.picker}
                onValueChange={LeaveSelected}>
                <Picker.Item label="Select leave type" value="" />
                {leaveTypes.map((item, index) => (
                  <Picker.Item
                    key={index}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </Picker>
            )}
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

          <TextInput
            style={styles.input}
            placeholder="Enter Reason"
            placeholderTextColor="#888"
            value={reason}
            onChangeText={text => setReason(text)}
            multiline={true}
          />
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
              Enter Your Contact
            </Text>
          </View>
          <TextInput
            style={{
              color: 'black',
              width: WIDTH * 0.95,
              height: HEIGHT * 0.06,
              borderColor: '#ccc',
              borderWidth: 1,
              marginBottom: 15,
              paddingHorizontal: 20,
              fontSize: 14,
              backgroundColor: '#f9f9f9',
            }}
            placeholder="Enter Emergency Contact"
            placeholderTextColor="#888"
            value={contact}
            onChangeText={text => setContact(text)}
            maxLength={12}
          />
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
              Enter Your Email
            </Text>
          </View>
          <TextInput
            style={{
              color: 'black',
              width: WIDTH * 0.95,
              height: HEIGHT * 0.06,
              borderColor: '#ccc',
              borderWidth: 1,
              marginBottom: 15,
              paddingHorizontal: 20,
              fontSize: 14,
              backgroundColor: '#f9f9f9',
            }}
            placeholder="Enter Emergency Email-Id"
            placeholderTextColor="#888"
            value={email}
            onChangeText={text => setEmail(text)}
            multiline={true}
          />

          <TouchableOpacity style={styles.button} onPress={handleApplyLeave}>
            <LinearGradient
              colors={['#b4000a', '#ff6347']}
              style={styles.button}>
              <Text style={styles.buttonText}>Apply</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CoffEntry;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 2,
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    position: 'absolute',
    marginTop: HEIGHT * 0.08,
  },
  redBox: {
    height: HEIGHT * 0.07,
    width: WIDTH * 0.95,
    backgroundColor: 'red',
    flexDirection: 'row',
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
  button: {
    width: WIDTH * 0.8,
    height: 50,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: HEIGHT * 0.1,
    marginBottom: 10,
    overflow: 'visible',
  },
  buttonBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  animatedView: {
    width: WIDTH,
    height: 100,
    backgroundColor: 'white',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
    padding: 10,
  },
  box: {
    width: '22%',
    height: WIDTH * 0.12,
    borderRadius: 10,
  },
  leaveTypeList: {
    marginBottom: 20,
  },
  leaveTypeItem: {
    width: WIDTH * 0.12,
    height: WIDTH * 0.12,
    borderRadius: WIDTH * 0.12,
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    margin: 10,
    marginTop: 15,
    backgroundColor: WHITE,
    borderColor: GRAY,
    borderWidth: 2,
  },
  selectedLeaveTypeItem: {
    backgroundColor: 'white',
    borderColor: '#b4000a',
    borderWidth: 2,
  },
  leaveTypeText: {
    color: GRAY,
    textAlign: 'center',
  },
  selectedLeaveTypeText: {
    color: '#b4000a',
  },
  // container: {
  //   flex: 1,
  //   width: '100%',
  //   // backgroundColor: 'blue',
  //   alignItems: 'center',
  //   padding: 20,
  // },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: WHITE,
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
  dateText: {
    color: BLACK,
    fontSize: 14,
    // marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  picker: {
    width: WIDTH * 0.95,
    color: BLACK,
    backgroundColor: WHITE,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 4,
    borderColor: GRAY,
  },
});
