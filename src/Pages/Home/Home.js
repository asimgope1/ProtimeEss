import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Text,
  StyleSheet,
  TextInput,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import moment from 'moment'; // Import moment
import { HEIGHT, WIDTH } from '../Login/Login';
import {
  BELL,
  ClientVisit,
  ExpenseEntry,
  FOUR,
  LeaveBalance,
  LeaveEntry,
  LeaveStatus,
  ManualPunch,
  Odometer,
  ONE,
  Outdoor,
  Payslip,
  Supervisor,
  Task,
  THREE,
  TWO,
} from '../../constants/imagepath';
import {
  BLACK,
  BLUE,
  BRAND,
  GRAY,
  GREEN,
  ORANGE,
  RED,
  WHITE,
} from '../../constants/color';
import { Icon } from '@rneui/themed';
import { clearAll, getObjByKey } from '../../utils/Storage';
import { checkuserToken } from '../../redux/actions/auth';
import { useDispatch } from 'react-redux';
import SQLitePlugin from 'react-native-sqlite-2';
import { useNavigation } from '@react-navigation/native';

// const get = async () => {
//   let tree = await getObjByKey('loginResponse');
//   console.log('fredc', tree);
// };
const get = async () => {
  try {
    let tree = await getObjByKey('loginResponse');
    // console.log('fredc', tree);

    if (tree && tree.length > 0) {
      const profile = tree[0]; // Assuming the profile details are in the first object of the array

      const empCode = profile.emp_code;
      setname(profile.staf_nm);
      const empImage = profile.staf_image;
      const deptName = profile.dept_nm;
      const desgName = profile.desg_nm;
      const presentDays = profile.PRESENT;
      const absentDays = profile.ABSENT;
      const leaveDays = profile.LEAVEDAY;
      const halfDay = profile.HALFDAY;
      const woffDays = profile.WOFF;

      // console.log('Employee Code:', empCode);
      // console.log('Employee Name:', empName);
      // console.log('Employee Image:', empImage);
      // console.log('Department Name:', deptName);
      // console.log('Designation Name:', desgName);
      // console.log('Present Days:', presentDays);
      // console.log('Absent Days:', absentDays);
      // console.log('Leave Days:', leaveDays);
      // console.log('Half Day:', halfDay);
      // console.log('Weekly Off Days:', woffDays);

      // You can now use these variables in your component or logic
      // For example, you could set them in the state if using a class component or useState if using a functional component
    } else {
      console.log('No profile data found');
    }
  } catch (error) {
    console.error('Error fetching profile data:', error);
  }
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  return (
    <FlatList
      numColumns={4}
      data={[
        { img: LeaveEntry, text: 'Leave Entry', to: 'LeaveEntry' },
        { img: LeaveStatus, text: 'Leave Status', to: 'LeaveStatus' },
        { img: LeaveBalance, text: 'Leave Bal.', to: 'LeaveBalance' },
        { img: LeaveStatus, text: 'C.Off', to: 'CoffEntry' },
        { img: Outdoor, text: 'Outdoor', to: 'OutDoor' },
        { img: ManualPunch, text: 'In/Out', to: 'InOut' },
        { img: ClientVisit, text: 'Client Visit', to: 'ClientVisit' },
        { img: Supervisor, text: 'Supervisor', to: 'SuperVisor' },
        { img: ExpenseEntry, text: 'Expense ', to: 'Expense' },
        { img: Odometer, text: 'Odometer', to: 'Odometer' },
        { img: Payslip, text: 'Payslip', to: 'Payslip' },
        { img: Task, text: 'Task', to: 'Task' },
      ]}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => {
            if (item.to === null || undefined) {
              alert('This functionality is not available yet.');
              return null;
            } else {
              navigation.navigate(item.to);
            }
          }}>
          <View
            style={{
              width: WIDTH * 0.2,
              height: HEIGHT * 0.09,
              padding: 5,
              borderRadius: 10,
              elevation: 8,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Image source={item.img} style={styles.image} />
            <Text
              style={{
                fontSize: 11,
                fontFamily: 'Poppins-Regular',
                color: 'black',
                marginTop: 10,
                textAlign: 'center',
              }}>
              {item.text}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      keyExtractor={(item, index) => index.toString()}
    />
  );
};

const TableHeader = () => {
  const headers = [
    { text: 'Date', key: 'Date' },
    { text: 'Check In', key: 'In' },
    { text: 'Check Out', key: 'Out' },
    { text: 'Working Hrs', key: 'Total_Hour' },
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
        <View style={{ width: WIDTH / 4, alignItems: 'center' }} key={header.key}>
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

const ListView = ({ item }) => {
  // console.log('item', item);
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
            // width: WIDTH * 0.1,
            backgroundColor: color,
            borderRadius: 2,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 2,
            marginHorizontal: 5,
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

const Attendance = () => {
  const [clientUrl, setClientUrl] = useState('');
  const [Id, setID] = useState();
  const [Sl, setSl] = useState();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return (today.getMonth() + 1).toString(); // Get current month without leading zeros
  });
  const [data, setData] = useState([]);

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
          (_, { rows }) => {
            const url = rows.item(0)?.client_url || '';
            resolve(url);
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
        return {
          Id: value[0]?.loc_cd,
          Sl: value[0]?.staf_sl,
        };
      }
    } catch (e) {
      console.error('Error retrieving details:', e);
    }
    return { Id: null, Sl: null };
  };

  const initialize = async () => {
    try {
      const [clientUrl, details] = await Promise.all([
        fetchClientUrlFromSQLite(),
        RetrieveDetails(),
      ]);

      setClientUrl(clientUrl);
      setID(details.Id);
      setSl(details.Sl);

      if (details.Id && details.Sl && clientUrl) {
        AttendanceApi(details.Sl, clientUrl);
      }
    } catch (error) {
      console.error('Initialization error:', error);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const AttendanceApi = async (Sl, clientUrl) => {
    // console.log('clientUrl', selectedMonth, Sl);
    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const raw = `{staf_sl: ${Sl} , month: ${selectedMonth}}`;
      // console.log('dsd', raw);

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      await fetch(`${clientUrl}api/mainattnd`, requestOptions)
        .then(response => response.json())
        .then(result => {
          setData(result?.data?.Table1);
          // console.log('check', result);
        })
        .catch(error => console.error(error));
    } catch (error) {
      console.error('Error fetching ManagerDashBoard:', error);
    }
  };

  return (
    <>
      <TableHeader />
      <View
        style={{
          height: HEIGHT * 0.32,
        }}>
        <FlatList
          data={data}
          renderItem={({ item }) => <ListView item={item} />}
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
  );
};

const Tab = createMaterialTopTabNavigator();

const TopTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarIndicatorStyle: {
          backgroundColor: 'black',
        },
        tabBarPressOpacity: 0.1,
        tabBarPressColor: 'white',
      }}>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      {/* <Tab.Screen name="Report" component={Report} /> */}
      <Tab.Screen name="Attendance" component={Attendance} />
    </Tab.Navigator>
  );
};

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(
    moment().format('YYYY-MM-DD'),
  );
  const [dates, setDates] = useState(generateInitialDates());

  const headerCardHeight = useSharedValue(0);
  const bottomViewTranslateY = useSharedValue(HEIGHT); // Start from bottom
  const flatListRef = useRef(null);

  useEffect(() => {
    headerCardHeight.value = withTiming(HEIGHT * 0.5, { duration: 1500 });
    bottomViewTranslateY.value = withTiming(0, { duration: 2000 }); // Animate to its final position

    if (flatListRef.current) {
      const todayIndex = dates.findIndex(date =>
        moment(date).isSame(moment(), 'day'),
      );
      if (todayIndex !== -1) {
        flatListRef.current.scrollToIndex({ index: todayIndex, animated: true });
        setSelectedDate(dates[todayIndex]);
      }
    }
  }, []);

  const headerStyle = useAnimatedStyle(() => {
    return {
      height: headerCardHeight.value,
    };
  });

  const bottomViewStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: bottomViewTranslateY.value }],
    };
  });

  // Function to generate initial dates
  function generateInitialDates() {
    const initialDates = Array.from({ length: 30 }, (_, i) =>
      moment()
        .subtract(15 - i, 'days')
        .format('YYYY-MM-DD'),
    );
    // Sort dates in ascending order
    return initialDates.sort((a, b) => moment(a).diff(moment(b)));
  }

  // Function to load more dates
  const loadMoreDates = () => {
    const lastDate = moment(dates[dates.length - 1], 'YYYY-MM-DD');
    const newDates = Array.from({ length: 365 }, (_, i) =>
      lastDate.subtract(i + 1, 'days').format('YYYY-MM-DD'),
    );
    setDates([...dates, ...newDates]);
  };

  const getItemLayout = (data, index) => ({
    length: WIDTH * 0.18, // Assuming item width is 18% of the screen width
    offset: WIDTH * 0.18 * index - HEIGHT * 0.33, // Adjust offset based on your item width and margin
    index,
  });

  const renderDateItem = ({ item }) => {
    // console.log('itrmem', item);
    const isSelected = item === selectedDate;
    const isToday = moment(item).isSame(moment(), 'day');
    const textStyle = {
      color: isSelected ? '#b4000a' : 'white',
      fontWeight: isSelected ? 'normal' : 'normal',
    };

    return (
      <TouchableOpacity
        key={item}
        onPress={() => setSelectedDate(item)}
        style={
          {
            // elevation: 15,
          }
        }>
        <View
          style={[
            styles.dateItem,
            isSelected && {
              backgroundColor: 'white',
              width: WIDTH * 0.11,
              height: HEIGHT * 0.1,
              borderRadius: 10,
              elevation: 20,
              padding: 5,
            },
          ]}>
          {/* <Text
            style={[styles.dateText, isToday && styles.todayText, textStyle]}>
            {moment(item).format('MMMM')}
          </Text> */}
          <Text
            style={[styles.dateText, isToday && styles.todayText, textStyle]}>
            {moment(item).format('dd')}
          </Text>
          <Text
            style={[styles.dateText, isToday && styles.todayText, textStyle]}>
            {moment(item).format(' D ')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  useEffect(() => {
    get();
  }, []);
  const get = async () => {
    try {
      let tree = await getObjByKey('loginResponse');
      // console.log('fredc', tree);

      if (tree && tree.length > 0) {
        const profile = tree[0]; // Assuming the profile details are in the first object of the array

        setcode(profile.emp_code);
        setname(profile.staf_nm);
        setimage(profile.staf_image);
        setdept(profile.dept_nm);
        setdesg(profile.desg_nm);
        setpresent(profile.PRESENT);
        setabsent(profile.ABSENT);
        setleave(profile.LEAVEDAY);
        sethalf(profile.HALFDAY);
        setwoff(profile.WOFF);

        // You can now use these variables in your component or logic
        // For example, you could set them in the state if using a class component or useState if using a functional component
      } else {
        console.log('No profile data found');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const [name, setname] = useState();
  const [code, setcode] = useState();
  const [image, setimage] = useState();
  const [dept, setdept] = useState();
  const [desg, setdesg] = useState();
  const [present, setpresent] = useState();
  const [absent, setabsent] = useState();
  const [leave, setleave] = useState();
  const [half, sethalf] = useState();
  const [woff, setwoff] = useState();

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
        {/* <ScrollView
          contentContainerStyle={styles.flexGrow}
          scrollEnabled={false}> */}
        <Animated.View style={[styles.header, headerStyle]}>
          <LinearGradient
            colors={['#ff6347', '#b4000a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}>
            <View
              style={{
                marginTop: HEIGHT * 0.05,
                height: HEIGHT * 0.1,
                width: WIDTH * 0.9,
                // backgroundColor: WHITE,
                borderRadius: 10,
                // elevation: 20,
                marginHorizontal: 10,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <View
                style={{
                  height: '35%',
                  width: '50%',
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}>
                <Text style={styles.headerText}>{name}</Text>
                <Text
                  style={{
                    ...styles.headerText,
                    fontSize: 14,
                  }}>
                  ID: {code} | {dept}
                </Text>
              </View>
              <View
                style={{
                  height: '100%',
                  width: '50%',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  alignSelf: 'flex-end',
                  flexDirection: 'row',
                }}>
                <View
                  style={{
                    width: '22%',
                    height: '50%',
                    borderRadius: 10,
                    elevation: 15,
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // marginRight: 10,
                  }}>
                  <Image
                    source={BELL}
                    style={{
                      width: '70%',
                      height: '100%',
                      resizeMode: 'contain',
                      tintColor: '#b4000a',
                    }}
                  />
                </View>
              </View>
            </View>

            {/* line segment */}
            <View
              style={{
                height: HEIGHT * 0.001,
                width: WIDTH,
                backgroundColor: GRAY,

                marginHorizontal: 10,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}
            />

            <View
              style={{
                height: HEIGHT * 0.05,
                width: WIDTH * 0.95,
                marginTop: 5,
                borderRadius: 10,
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexDirection: 'row',
              }}>
              <View
                style={{
                  height: '70%',
                  width: '33%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 17,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  Select Date
                </Text>
                <Icon
                  name="info-outline"
                  type="MaterialIcons"
                  color="white"
                  size={HEIGHT * 0.029}
                />
              </View>

              <View
                style={{
                  height: '80%',
                  width: '50%',
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  paddingLeft: 5,
                  padding: 2,
                }}>
                <Icon
                  name="calendar"
                  type="evilicon"
                  color="white"
                  size={HEIGHT * 0.032}
                />
                <Text
                  style={{
                    color: 'white',
                    fontSize: 18,
                    fontFamily: 'Poppins-Regular',
                  }}>
                  {moment(selectedDate).format('MMMM')}
                </Text>
                <Text
                  style={{
                    color: 'white',
                    fontSize: 18,
                    fontFamily: 'Poppins-Regular',
                  }}>
                  {moment(selectedDate).format('YYYY')}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                height: HEIGHT * 0.125,
                bottom: HEIGHT * 0.03,
              }}>
              <FlatList
                horizontal
                ref={flatListRef}
                getItemLayout={getItemLayout}
                data={dates}
                renderItem={renderDateItem}
                keyExtractor={item => item}
                contentContainerStyle={styles.dateList}
                showsHorizontalScrollIndicator={false}
                // onEndReached={loadMoreDates}
                onEndReachedThreshold={0.1}
              />
            </View>
          </LinearGradient>
        </Animated.View>
        <Animated.View style={[styles.bottomView, bottomViewStyle]}>
          <View style={styles.searchBar}>
            <View
              style={{
                width: WIDTH * 0.85,
                height: HEIGHT * 0.055,
                alignSelf: 'center',
                marginLeft: 7,
                justifyContent: 'space-evenly',
              }}>
              <Text
                style={{
                  color: BLACK,
                  fontSize: 22,
                  fontFamily: 'Poppins-Bold',
                  paddingTop: 10,
                }}>
                Monthly Attendance
              </Text>
              <Text
                style={{
                  color: BLACK,
                  fontSize: 13,
                  fontFamily: 'Poppins-Regular',
                  paddingTop: 5,
                }}>
                {moment(selectedDate).format('LLLL')}
              </Text>
            </View>
            <View
              style={{
                width: WIDTH * 0.9,
                height: HEIGHT * 0.1,
                alignSelf: 'center',
                justifyContent: 'space-evenly',
                flexDirection: 'row',
                alignItems: 'center',
                // backgroundColor: 'green',
                padding: 10,
                marginTop: 10,
              }}>
              <View
                style={{
                  width: WIDTH * 0.18,
                  height: HEIGHT * 0.075,
                  backgroundColor: 'white',
                  alignItems: 'center',
                  // padding: 5,
                }}>
                <Text
                  style={{
                    color: BLACK,
                    fontSize: 13,
                    fontFamily: 'Poppins-SemiBold',
                  }}>
                  Present
                </Text>
                <Text
                  style={{
                    paddingTop: 5,
                    color: '#09692c',
                    fontSize: 28,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  {present}
                </Text>
              </View>
              <View
                style={{
                  marginTop: HEIGHT * 0.06,
                  height: HEIGHT * 0.05,
                  width: WIDTH * 0.001,
                  backgroundColor: GRAY,
                }}
              />
              <View
                style={{
                  width: WIDTH * 0.18,
                  height: HEIGHT * 0.075,
                  backgroundColor: 'white',
                  alignItems: 'center',
                  // padding: 5,
                }}>
                <Text
                  style={{
                    color: BLACK,
                    fontSize: 13,
                    fontFamily: 'Poppins-SemiBold',
                  }}>
                  Absent
                </Text>
                <Text
                  style={{
                    paddingTop: 5,
                    color: RED,
                    fontSize: 28,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  {absent}
                </Text>
              </View>
              <View
                style={{
                  marginTop: HEIGHT * 0.06,
                  height: HEIGHT * 0.05,
                  width: WIDTH * 0.001,
                  backgroundColor: GRAY,
                }}
              />
              <View
                style={{
                  width: WIDTH * 0.18,
                  height: HEIGHT * 0.075,
                  backgroundColor: 'white',
                  alignItems: 'center',
                  // padding: 5,
                }}>
                <Text
                  style={{
                    color: BLACK,
                    fontSize: 13,
                    fontFamily: 'Poppins-SemiBold',
                  }}>
                  Leave
                </Text>
                <Text
                  style={{
                    paddingTop: 5,
                    color: BLUE,
                    fontSize: 28,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  {leave}
                </Text>
              </View>
              <View
                style={{
                  marginTop: HEIGHT * 0.06,
                  height: HEIGHT * 0.05,
                  width: WIDTH * 0.001,
                  backgroundColor: GRAY,
                }}
              />
              <View
                style={{
                  width: WIDTH * 0.18,
                  height: HEIGHT * 0.075,
                  backgroundColor: 'white',
                  alignItems: 'center',
                  // padding: 5,
                }}>
                <Text
                  style={{
                    color: BLACK,
                    fontSize: 13,
                    fontFamily: 'Poppins-SemiBold',
                  }}>
                  WO/H
                </Text>
                <Text
                  style={{
                    paddingTop: 5,
                    color: ORANGE,
                    fontSize: 28,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  {half + woff}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.tabContainer}>
            <TopTabs />
          </View>
        </Animated.View>
        {/* </ScrollView> */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  flex: {
    flex: 1,
  },
  flexGrow: {
    flexGrow: 1,
  },
  header: {
    width: WIDTH,
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
    fontSize: 21,
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
    // justifyContent: 'flex-start', // Align items to the top
  },
  bottomViewText: {
    color: 'black',
    fontSize: 20,
    // marginTop: 20, // Add margin top to space it from the search bar
  },
  searchBar: {
    width: WIDTH * 0.85,
    height: HEIGHT * 0.22,
    bottom: HEIGHT * 0.15,
    elevation: HEIGHT * 0.01,
    paddingTop: 5,
    paddingLeft: 10,
    alignSelf: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: 'white',
    zIndex: 999,
    marginTop: 4,
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
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Home;
