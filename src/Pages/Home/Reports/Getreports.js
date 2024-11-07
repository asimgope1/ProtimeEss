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
  Button,
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
import {Icon} from '@rneui/themed';
import LinearGradient from 'react-native-linear-gradient';

const Getreports = ({navigation, route}) => {
  const {item} = route.params;
  console.log('ite', item);
  const [Route, SetRoute] = useState(item);
  const [Monthdata, SetMonthdata] = useState([]);
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
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const getBorderColor = status => {
    switch (status) {
      case 'ABSENT':
        return 'red'; // Color for absent
      case 'PRESENT':
        return 'green'; // Color for present
      case 'LEAVE':
        return 'blue'; // Color for leave
      default:
        return '#ccc'; // Default color
    }
  };
  const Card = ({item}) => {
    const borderColor =
      item.Status === 'Approved' ? 'green' : getBorderColor(item.day_status);
    const name = Route.Name;
    console.log('Card', name);
    if (name === 'Holiday Register') {
      return (
        <View
          style={{
            flex: 1,
            width: WIDTH,
          }}>
          <View style={[styles.cardContainer, {borderLeftColor: borderColor}]}>
            <Button title="Get List" />
          </View>
        </View>
      );
    } else if (name === 'Outdoor Register') {
      return (
        <View style={[styles.cardContainer, {borderLeftColor: borderColor}]}>
          <Text style={styles.cardText1}>
            Apply Date: <Text style={styles.cardText}>{item.ApplyDate}</Text>
          </Text>
          <Text style={styles.cardText1}>
            Date: <Text style={styles.cardText}>{item.Date}</Text>
          </Text>
          <Text style={styles.cardText1}>
            IN Time: <Text style={styles.cardText}>{item.IN}</Text>
          </Text>
          <Text style={styles.cardText1}>
            OUT Time: <Text style={styles.cardText}>{item.OUT}</Text>
          </Text>
          <Text style={styles.cardText1}>
            Reason: <Text style={styles.cardText}>{item.Reason || 'N/A'}</Text>
          </Text>
          <Text style={styles.cardText1}>
            Status: <Text style={styles.cardText}>{item.Status}</Text>
          </Text>
        </View>
      );
    } else if (name === 'Presentee Register') {
      return (
        <View style={[styles.cardContainer, {borderLeftColor: 'green'}]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text style={styles.cardText1}>
              Date: <Text style={styles.cardText}>{item.Date}</Text>
            </Text>
            <Text style={styles.cardText1}>
              In Time: <Text style={styles.cardText}>{item.In}</Text>
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text style={styles.cardText1}>
              Out Time: <Text style={styles.cardText}>{item.Out}</Text>
            </Text>
            <Text style={styles.cardText1}>
              Status: <Text style={styles.cardText}>{item.Status}</Text>
            </Text>
          </View>
          <Text style={styles.cardText1}>
            Total Hours:{' '}
            <Text style={styles.cardText}>{item['Total(Hour)']}</Text>
          </Text>
        </View>
      );
    } else if (name === 'Late Commer Register') {
      return (
        <View style={[styles.cardContainer, {borderLeftColor: 'red'}]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: 'white',
            }}>
            <Text style={styles.cardText1}>
              Date: <Text style={styles.cardText}>{item.Date}</Text>
            </Text>
            <Text style={styles.cardText1}>
              In: <Text style={styles.cardText}>{item.In}</Text>
            </Text>
            <Text style={styles.cardText1}>
              Late By:{' '}
              <Text style={styles.cardText}>{item.LateInMins} mins</Text>
            </Text>
          </View>
        </View>
      );
    } else if (name === 'Mannual Register') {
      return (
        <View style={[styles.cardContainer, {borderLeftColor: 'green'}]}>
          <Text style={styles.cardText1}>
            Name <Text style={styles.cardText}>{item.EmployeeName}</Text>
          </Text>
          <Text style={styles.cardText1}>
            Desgination <Text style={styles.cardText}>{item.Desgination}</Text>
          </Text>
          <Text style={styles.cardText1}>
            Department <Text style={styles.cardText}>{item.Department}</Text>
          </Text>
          <Text style={styles.cardText1}>
            Address <Text style={styles.cardText}>{item.Address}</Text>
          </Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.cardContainer, {borderLeftColor: borderColor}]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: 'white',
            }}>
            <Text style={styles.cardText1}>
              Date: <Text style={styles.cardText}>{item.dt}</Text>
            </Text>
            <Text style={styles.cardText1}>
              Day Status: <Text style={styles.cardText}>{item.day_status}</Text>
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: 'white',
            }}>
            <Text style={styles.cardText1}>
              In: <Text style={styles.cardText}> {item.In}</Text>
            </Text>
            <Text style={styles.cardText1}>
              Out: <Text style={styles.cardText}>{item.Out}</Text>
            </Text>
          </View>

          {name !== 'Multi Punch Register' && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: 'white',
              }}>
              <Text style={styles.cardText1}>
                late In: <Text style={styles.cardText}>{item.late_in}</Text>
              </Text>
              <Text style={styles.cardText1}>
                From: <Text style={styles.cardText}>{item.log_tp}</Text>
              </Text>
            </View>
          )}

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: 'white',
            }}>
            <Text style={styles.cardText1}>
              Total Hours:{' '}
              <Text style={styles.cardText}>{item.Total_Hour}</Text>
            </Text>
            {name !== 'Multi Punch Register' && (
              <Text style={styles.cardText1}>
                OT: <Text style={styles.cardText}>{item.tot_otmin}</Text>
              </Text>
            )}
          </View>

          {name !== 'Multi Punch Register' && (
            <Text style={styles.cardText1}>
              Shift Name: <Text style={styles.cardText}>{item.shift_nm}</Text>
            </Text>
          )}
          <Text style={styles.cardText1}>
            In-Out: <Text style={styles.cardText}>{item.in_out}</Text>
          </Text>
        </View>
      );
    }
  };

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
      console.log('redty', response);
      const result = await response.json();

      if (result.Code === '200') {
        if (
          result.msg === 'Daily Attendance Register' ||
          result.msg === 'Absentee Register'
        ) {
          setData(result.data_value);
          SetCheck(false);
        } else if (
          result.msg !== 'Daily Attendance Register' &&
          result.msg !== 'Absentee Register'
        ) {
          SetMonthdata(result.data_value);
          SetCheck(true);
        }
      }
      console.log('balance', result);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    } finally {
      // setLoading(false);
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
    console.log('ListView item', item);

    {
      let color = '';
      let char = '';
      if (item.Status === 'ABSENT' || item.day_status === 'ABSENT') {
        color = RED;
        char = 'Absent';
      } else if (item.Status === 'PRESENT' || item.day_status === 'PRESENT') {
        color = GREEN;
        char = 'Present';
      } else if (
        item.Status === 'WEEKLYOFF' ||
        item.day_status === 'WEEKLYOFF'
      ) {
        color = GRAY;
        char = 'Weekoff';
      } else if (item.Status === 'LEAVEDAY' || item.day_status === 'LEAVEDAY') {
        color = ORANGE;
        char = 'Leave';
      } else if (item.Status === 'HALFDAY' || item.day_status === 'HALFDAY') {
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

      const dateStr = item.dt || item.Date;

      const [day, month, year] = dateStr ? dateStr.split('/') : ['', '', ''];

      const formattedDate = dateStr
        ? `${parseInt(day)} ${monthNames[parseInt(month) - 1]}`
        : 'N/A';
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
    }
  };
  console.log('data', data);

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
        {Route.Name !== 'Holiday Register' && (
          <>
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
          </>
        )}

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
        {Route.Name !== 'Holiday Register' && (
          <TouchableOpacity style={styles.button} onPress={handleApplyLeave}>
            <LinearGradient
              colors={['#b4000a', '#ff6347']}
              style={styles.button}>
              <Text style={styles.buttonText}>Apply</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {check === false && (
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
        )}
        {check === true ? (
          <>
            <View
              style={{
                height: HEIGHT * 0.7,
              }}>
              <FlatList
                data={Monthdata}
                renderItem={({item}) => <Card item={item} />}
                keyExtractor={(item, index) => index.toString()}
                ListFooterComponent={
                  <View style={styles.footerContainer}></View>
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
  cardContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 3,
    elevation: 2, // For Android shadow
  },
  cardText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  cardText1: {
    fontSize: 14,
    color: 'black',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  listContainer: {
    height: HEIGHT * 0.7,
  },
  footerContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noRecordsContainer: {
    height: HEIGHT * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  noRecordsText: {
    fontSize: 16,
    color: RED,
  },
});
