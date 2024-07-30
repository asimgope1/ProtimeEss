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
  TouchableOpacity,
} from 'react-native';
import {getObjByKey} from '../../../utils/Storage';
import SQLitePlugin from 'react-native-sqlite-2';
import {HEIGHT, WIDTH} from '../../../constants/config';
import {
  BLACK,
  BLUE,
  GRAY,
  GREEN,
  ORANGE,
  RED,
  WHITE,
} from '../../../constants/color';
import Header from '../../../components/Header';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import moment from 'moment';
import {Icon} from '@rneui/themed';
import LinearGradient from 'react-native-linear-gradient';

const Getreports = ({navigation, route}) => {
  const {item} = route.params;
  console.log('ite', item);
  const [data, setData] = useState([]);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [Id, setID] = useState();
  const [Sl, setSl] = useState();
  const [clientUrl, setClientUrl] = useState('');
  const [check, SetCheck] = useState(true);

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

  const handleApplyLeave = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const raw = JSON.stringify({
        loc_cd: Id,
        staf_sl: Sl,
        from_dt: fromDate,
        to_dt: toDate,
      });
      console.log('raw', raw);

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      const response = await fetch(
        `${clientUrl}${item.endpoint}`,
        requestOptions,
      );
      const result = await response.json();
      if (result.Code === '200') {
        setData(result.data_value);
        SetCheck(false);
      }
      console.log('balance', result);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const TableHeader = () => {
    const headers = [
      {text: 'Date', key: 'Date'},
      {text: 'Check In', key: 'In'},
      {text: 'Check Out', key: 'Out'},
      {text: 'Working Hrs', key: 'Total_Hour'},
    ];

    return (
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#ddd',
          paddingVertical: 10,
          justifyContent: 'space-around',
        }}>
        {headers.map(header => (
          <View
            style={{width: WIDTH / 4, alignItems: 'center'}}
            key={header.key}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: 'black',
              }}>
              {header.text}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const ListView = ({item}) => {
    console.log('item', item);
    let color = '';
    let char = '';
    if (item.Status == 'ABSENT') {
      color = RED;
      char = 'Absent';
    } else if (item.Status == 'PRESENT') {
      color = GREEN;
      char = 'Present';
    } else if (item.Status == 'WEEKLYOFF') {
      color = GRAY;
      char = 'Weekoff';
    } else if (item.Status == 'LEAVEDAY') {
      color = ORANGE;
      char = 'Leave';
    } else if (item.Status == 'HALFDAY') {
      color = BLUE;
      char = 'Half Day';
    } else if (
      item.Status == 'HOLIDAY' ||
      item.Status == 'SATURDAY' ||
      item.Status == 'SUNDAY'
    ) {
      color = 'purple';
      char = item.Status;
    }

    const [day, month, year] = item.Date.split('/');
    const formattedDate = `${parseInt(day)} ${monthNames[parseInt(month) - 1]}`;
    return (
      <View
        style={{
          padding: 10,
          marginVertical: 5,
          backgroundColor: '#fff',
          borderRadius: 10,
          elevation: 3,
          alignSelf: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
          <View
            style={{
              height: HEIGHT * 0.03,
              // width: WIDTH * 0.05,
              backgroundColor: color,
              borderRadius: 2,
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 2,
              marginLeft: 5,
            }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                padding: 5,
              }}>
              {char}
            </Text>
          </View>
          <Text
            style={{
              width: WIDTH / 4,
              fontSize: 14,
              textAlign: 'center',
              color: 'black',
            }}>
            {formattedDate}
          </Text>
          <Text
            style={{
              width: WIDTH / 4,
              fontSize: 14,
              textAlign: 'center',
              color: 'black',
            }}>
            {item.In}
          </Text>
          <Text
            style={{
              width: WIDTH / 4,
              fontSize: 14,
              textAlign: 'center',
              color: 'black',
            }}>
            {item.Out}
          </Text>
          <Text
            style={{
              width: WIDTH / 4,
              fontSize: 14,
              textAlign: 'center',
              color: 'black',
            }}>
            {item.Total}
          </Text>
        </View>
      </View>
    );
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
        <Header title={item.Name} onBackPress={() => navigation.goBack()} />
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          scrollEnabled={false}>
          <View
            style={{
              width: WIDTH * 0.95,
              height: HEIGHT * 0.038,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 5,
              paddingLeft: 10,
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
                // leaveList(Id);
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
                // leaveList(Id);
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

          <TouchableOpacity style={styles.button} onPress={handleApplyLeave}>
            <LinearGradient
              colors={['#b4000a', '#ff6347']}
              style={styles.button}>
              <Text style={styles.buttonText}>Apply</Text>
            </LinearGradient>
          </TouchableOpacity>

          {check === false ? (
            <>
              <TableHeader />
              <View
                style={{
                  height: HEIGHT * 0.7,
                }}>
                <FlatList
                  data={data}
                  renderItem={({item}) => <ListView item={item} />}
                  keyExtractor={(item, index) => index.toString()}
                  ListFooterComponent={
                    <View
                      style={{
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}></View>
                  }
                />
              </View>
            </>
          ) : (
            <View
              style={{
                height: HEIGHT * 0.1,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 10,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: RED,
                }}>
                No records found for selected date range.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Getreports;

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
  dateText: {
    color: BLACK,
    fontSize: 14,
    // marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  button: {
    width: WIDTH * 0.8,
    height: 50,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,

    borderRadius: HEIGHT * 0.1,
    marginBottom: 10,
    overflow: 'visible',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
