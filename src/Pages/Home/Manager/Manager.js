import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {StatusBar} from 'react-native';
import {HEIGHT, WIDTH} from '../../../constants/config';
import LinearGradient from 'react-native-linear-gradient';
import {BLACK, BLUE, GRAY, ORANGE, RED, WHITE} from '../../../constants/color';
import moment from 'moment';
import SQLitePlugin from 'react-native-sqlite-2';
import {getObjByKey} from '../../../utils/Storage';
import {Icon} from '@rneui/themed';
import {COMPLETE, MAN, TIME, TIMEOUT} from '../../../constants/imagepath';

const Manager = ({navigation}) => {
  const [selectedDate, setSelectedDate] = useState(
    moment().format('YYYY-MM-DD'),
  );
  const [clientUrl, setClientUrl] = useState('');
  const [Id, setID] = useState();
  const [Sl, setSl] = useState();
  const [TAB4DATA, setTAB4DATA] = useState([]);
  const [TAB3DATA, setTAB3DATA] = useState([]);
  const [data, setdata] = useState([]);
  const [table, settable] = useState();
  const [table1, settable1] = useState();
  const [table2, settable2] = useState();
  const [table5, settable5] = useState();
  // const table = data?.Table[0]?.Leave_approval;

  const initialize = async () => {
    try {
      await fetchClientUrlFromSQLite();
      await RetrieveDetails();
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
    }
  };

  console.log('table', table);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (Id && Sl && clientUrl) {
      fetchManagerDashBoard(Id, Sl);
    }
  }, [Id, Sl, clientUrl]);

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

  const fetchManagerDashBoard = async (ID, SL) => {
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
        `${clientUrl}api/ManagerDashbaord`,
        requestOptions,
      );
      const result = await response.json();
      console.log('ManagerDashBoard', result.data);
      if (result.Code === '200') {
        // update data in local storage
        //...
        setTAB4DATA(result?.data?.Table4);
        setTAB3DATA(result?.data?.Table3);
        settable(result.data?.Table[0]?.Leave_approval);
        settable1(result.data?.Table1[0]?.Outdoor_Approval);
        settable2(result.data?.Table2[0]?.manual_approval);
        settable5(result.data?.Table5[0]?.COFF_approval);
      }
    } catch (error) {
      console.error('Error fetching ManagerDashBoard:', error);
    }
  };

  const ListView = ({item}) => {
    let x = item.Status;
    let color;
    if (x === 'ABSENT') {
      color = 'red';
    } else if (x === 'PRESENT') {
      color = 'green';
    } else if (x === 'LEAVE') {
      color = 'blue';
    } else {
      color = 'gray';
    }
    const inTime = moment(item.In, 'HH:mm:ss').format('hh:mm A');
    const outTime = moment(item.Out, 'HH:mm:ss').format('hh:mm A');

    return (
      <View
        style={{
          width: WIDTH,
          height: HEIGHT * 0.18,
          padding: 5,
          elevation: 5,
          borderRadius: 4,
          backgroundColor: WHITE,
          alignItems: 'center',
          alignSelf: 'center',
          marginVertical: 10,
        }}>
        <View
          style={{
            height: '50%',
            width: '100%',
            backgroundColor: WHITE,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View
            style={{
              height: HEIGHT * 0.06,
              width: HEIGHT * 0.06,
              borderRadius: HEIGHT * 0.06,
              backgroundColor: 'white',
              elevation: 2,
            }}>
            <Image
              source={MAN}
              style={{
                height: '100%',
                width: '100%',
              }}
              resizeMode="contain"
            />
          </View>
          <View
            style={{
              marginLeft: 15,
              height: '70%',
              width: '52%',
              justifyContent: 'space-evenly',
            }}>
            <Text
              style={{
                fontFamily: 'Poppins-Bold',
                color: BLACK,
              }}>
              {item.staf_nm}
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                color: GRAY,
              }}>
              {item.div_nm}
            </Text>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                color: GRAY,
              }}>
              {item.dept_nm} / {item.desg_nm}
            </Text>
          </View>
          <View
            style={{
              width: '30%',
              height: '100%',
              alignSelf: 'center',
              alignItems: 'flex-end',
              justifyContent: 'center',
              // flexDirection: 'row',
            }}>
            <View
              style={{
                width: '50%',
                height: '32%',
                backgroundColor: color,
                borderRadius: 4,
                alignSelf: 'flex-end',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Bold',
                  color: WHITE,
                  fontSize: 10,
                }}>
                {item.Status}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            height: 1,
            width: '100%',
            backgroundColor: GRAY,
          }}
        />
        <View
          style={{
            height: '50%',
            width: '100%',
            backgroundColor: WHITE,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              height: '100%',
              width: '30%',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <View
              style={{
                height: '50%',
                width: '30%',
                borderRadius: 2,
                // backgroundColor: GRAY,
              }}>
              <Image
                source={TIME}
                style={{
                  height: '100%',
                  width: '100%',
                }}
                resizeMode="contain"
              />
            </View>
            <View
              style={{
                height: '100%',
                width: '60%',
                marginLeft: 4,
                // backgroundColor: 'green',
                // alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Reguler',
                  color: BLACK,
                  fontSize: 12,
                }}>
                Check In
              </Text>
              {item.In ? (
                <Text
                  style={{
                    fontFamily: 'Poppins-Bold',
                    color: BLACK,
                    fontSize: 13,
                  }}>
                  {inTime}
                </Text>
              ) : (
                <></>
              )}
            </View>
          </View>
          <View
            style={{
              height: '100%',
              width: '30%',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <View
              style={{
                height: '50%',
                width: '30%',
                borderRadius: 2,
                // backgroundColor: GRAY,
              }}>
              <Image
                source={TIMEOUT}
                style={{
                  height: '100%',
                  width: '100%',
                }}
                resizeMode="contain"
              />
            </View>
            <View
              style={{
                height: '100%',
                width: '60%',
                marginLeft: 4,
                // backgroundColor: 'green',
                // alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Reguler',
                  color: BLACK,
                  fontSize: 12,
                }}>
                Check Out
              </Text>
              {item.Out ? (
                <Text
                  style={{
                    fontFamily: 'Poppins-Bold',
                    color: BLACK,
                    fontSize: 13,
                  }}>
                  {outTime}
                </Text>
              ) : (
                <></>
              )}
            </View>
          </View>
          <View
            style={{
              height: '100%',
              width: '30%',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexDirection: 'row',
            }}>
            <View
              style={{
                height: '50%',
                width: '30%',
                borderRadius: 2,
                backgroundColor: WHITE,
              }}>
              <Image
                source={COMPLETE}
                style={{
                  height: '100%',
                  width: '100%',
                }}
                resizeMode="contain"
              />
            </View>
            <View
              style={{
                height: '100%',
                width: '60%',
                marginLeft: 4,
                // backgroundColor: 'green',
                // alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Reguler',
                  color: BLACK,
                  fontSize: 12,
                }}>
                Completed
              </Text>
              {item.Total_Hour ? (
                <Text
                  style={{
                    fontFamily: 'Poppins-Bold',
                    color: BLACK,
                    fontSize: 13,
                  }}>
                  {item.Total_Hour} Hrs
                </Text>
              ) : (
                <></>
              )}
            </View>
          </View>
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
        <ScrollView
          contentContainerStyle={styles.flexGrow}
          scrollEnabled={false}>
          <LinearGradient
            colors={['#b4000a', '#ff6347']}
            style={styles.headerContainer}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Let's track Your</Text>
              <Text style={styles.headerTitle}>Team Attendance</Text>
            </View>
          </LinearGradient>

          <View style={styles.searchBar}>
            <View
              style={{
                width: '100%',
                height: '30%',
                alignSelf: 'center',
                marginLeft: 7,
                justifyContent: 'space-evenly',
              }}>
              <Text
                style={{
                  color: BLACK,
                  fontSize: 22,
                  fontFamily: 'Poppins-Bold',
                  paddingTop: 15,
                }}>
                Summary
              </Text>
              <Text
                style={{
                  color: GRAY,
                  fontSize: 13,
                  fontFamily: 'Poppins-Regular',
                  // paddingTop: 5,
                  marginTop: 12,
                }}>
                {moment(selectedDate).format('LLLL')}
              </Text>
            </View>
            <View
              style={{
                width: '100%',
                height: '70%',
                alignSelf: 'center',
                justifyContent: 'space-evenly',
                flexDirection: 'row',
                // backgroundColor: 'green',
                padding: 10,
                marginTop: 10,
              }}>
              <View
                style={{
                  width: '15%',
                  height: '100%',
                  backgroundColor: 'white',
                  alignItems: 'center',
                  // padding: 5,
                }}>
                <Text
                  style={{
                    color: BLACK,
                    fontSize: 12,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  Total
                </Text>
                <Text
                  style={{
                    paddingTop: 5,
                    color: 'black',
                    fontSize: 30,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  {TAB3DATA[0]?.Total}
                </Text>
              </View>
              <View
                style={{
                  marginTop: '6%',
                  height: '50%',
                  width: '0.1%',
                  backgroundColor: GRAY,
                }}
              />
              <View
                style={{
                  width: '15%',
                  height: '100%',
                  backgroundColor: 'white',
                  alignItems: 'center',
                  // padding: 5,
                }}>
                <Text
                  style={{
                    color: BLACK,
                    fontSize: 12,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  PRESENT
                </Text>
                <Text
                  style={{
                    paddingTop: 5,
                    color: 'green',
                    fontSize: 30,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  {TAB3DATA[0]?.PRESENT}
                </Text>
              </View>
              <View
                style={{
                  marginTop: '6%',
                  height: '50%',
                  width: '0.11%',
                  backgroundColor: GRAY,
                }}
              />

              <View
                style={{
                  width: '15%',
                  height: '100%',
                  backgroundColor: 'white',
                  alignItems: 'center',
                  // padding: 5,
                }}>
                <Text
                  style={{
                    color: BLACK,
                    fontSize: 12,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  ABSENT
                </Text>
                <Text
                  style={{
                    paddingTop: 5,
                    color: 'red',
                    fontSize: 30,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  {TAB3DATA[0]?.ABSENT}
                </Text>
              </View>
              <View
                style={{
                  marginTop: '6%',
                  height: '50%',
                  width: '0.11%',
                  backgroundColor: GRAY,
                }}
              />

              <View
                style={{
                  width: '15%',
                  height: '100%',
                  backgroundColor: 'white',
                  alignItems: 'center',
                  // padding: 5,
                }}>
                <Text
                  style={{
                    color: BLACK,
                    fontSize: 12,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  Leave
                </Text>
                <Text
                  style={{
                    paddingTop: 5,
                    color: 'blue',
                    fontSize: 30,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  {TAB3DATA[0]?.LEAVE}
                </Text>
              </View>
              <View
                style={{
                  marginTop: '6%',
                  height: '50%',
                  width: '0.11%',
                  backgroundColor: GRAY,
                }}
              />

              <View
                style={{
                  width: '15%',
                  height: '100%',
                  backgroundColor: 'white',
                  alignItems: 'center',
                  // padding: 5,
                }}>
                <Text
                  style={{
                    color: BLACK,
                    fontSize: 12,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  WOFF
                </Text>
                <Text
                  style={{
                    paddingTop: 5,
                    color: 'orange',
                    fontSize: 30,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  {TAB3DATA[0]?.WOFF}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{
              height: HEIGHT * 0.2,
              width: WIDTH * 0.99,
              padding: 5,
              alignSelf: 'center',
              backgroundColor: 'white',
              // marginTop: 10,
            }}>
            <View
              style={{
                width: '100%',
                height: '35%',
                alignSelf: 'center',
                marginLeft: 7,
                justifyContent: 'space-around',
              }}>
              <Text
                style={{
                  color: BLACK,
                  fontSize: 20,
                  fontFamily: 'Poppins-Bold',
                  paddingTop: 15,
                }}>
                Approval Pending
              </Text>
            </View>
            {/* <FlatList
              data={[1, 2, 3, 4]}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({item}) => (
                <>
                  <View>
                    <View
                      style={{
                        width: WIDTH * 0.18,
                        height: HEIGHT * 0.08,
                        padding: 5,
                        elevation: 10,
                        borderRadius: 10,

                        backgroundColor: WHITE,
                        alignItems: 'center',
                        marginHorizontal: 10,
                      }}></View>
                    <Text
                      style={{
                        color: 'black',
                        alignSelf: 'center',
                      }}>
                      label
                    </Text>
                  </View>
                </>
              )}
            /> */}

            <View
              style={{
                flexDirection: 'row',
                height: HEIGHT * 0.12,
                width: WIDTH * 0.965,
                justifyContent: 'space-around',
                alignItems: 'center',
              }}>
              <View>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('LeaveApproval');
                  }}
                  style={{
                    width: WIDTH * 0.2,
                    height: HEIGHT * 0.1,
                    padding: 5,
                    elevation: 4,
                    borderRadius: 10,
                    borderBottomWidth: 20,
                    borderBottomColor: 'red',
                    backgroundColor: WHITE,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      fontSize: 35,
                      fontFamily: 'Poppins-Bold',
                      textAlign: 'center',
                    }}>
                    {table}
                  </Text>
                  <View
                    style={{
                      width: '100%',
                      height: '30%',
                      // backgroundColor: 'red',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'absolute',
                      top: HEIGHT * 0.078,
                    }}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{
                        color: 'white',
                        fontSize: 8,
                        fontFamily: 'Poppins-Bold',
                        alignSelf: 'center',
                      }}>
                      Leave Approval
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('OutdoorApproval');
                  }}
                  style={{
                    width: WIDTH * 0.2,
                    height: HEIGHT * 0.1,
                    padding: 5,
                    elevation: 4,
                    borderRadius: 10,
                    borderBottomWidth: 20,
                    borderBottomColor: 'red',
                    backgroundColor: WHITE,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      fontSize: 35,
                      fontFamily: 'Poppins-Bold',
                      textAlign: 'center',
                    }}>
                    {table1}
                  </Text>
                  <View
                    style={{
                      width: '100%',
                      height: '30%',
                      // backgroundColor: 'red',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'absolute',
                      top: HEIGHT * 0.078,
                    }}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{
                        color: 'white',
                        fontSize: 7.6,
                        fontFamily: 'Poppins-Bold',
                        alignSelf: 'center',
                      }}>
                      Outdoor Approval
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('MannualApproval');
                  }}
                  style={{
                    width: WIDTH * 0.2,
                    height: HEIGHT * 0.1,
                    padding: 5,
                    elevation: 4,
                    borderRadius: 10,
                    borderBottomWidth: 20,
                    borderBottomColor: 'red',
                    backgroundColor: WHITE,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      fontSize: 35,
                      fontFamily: 'Poppins-Bold',
                      textAlign: 'center',
                    }}>
                    {table2}
                  </Text>
                  <View
                    style={{
                      width: '100%',
                      height: '30%',
                      // backgroundColor: 'red',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'absolute',
                      top: HEIGHT * 0.078,
                    }}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{
                        color: 'white',
                        fontSize: 7.2,
                        fontFamily: 'Poppins-Bold',
                        alignSelf: 'center',
                      }}>
                      Mannual Approval
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('CoffApproval');
                  }}
                  style={{
                    width: WIDTH * 0.2,
                    height: HEIGHT * 0.1,
                    padding: 5,
                    elevation: 4,
                    borderRadius: 10,
                    borderBottomWidth: 20,
                    borderBottomColor: 'red',
                    backgroundColor: WHITE,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      fontSize: 35,
                      fontFamily: 'Poppins-Bold',
                      textAlign: 'center',
                    }}>
                    {table5}
                  </Text>
                  <View
                    style={{
                      width: '100%',
                      height: '30%',
                      // backgroundColor: 'red',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'absolute',
                      top: HEIGHT * 0.078,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 8,
                        fontFamily: 'Poppins-Bold',
                        alignSelf: 'center',
                      }}>
                      COFF Approval
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View
            style={{
              width: '100%',
              height: '5%',
              backgroundColor: 'white',
              alignSelf: 'center',
              flexDirection: 'row',
              padding: 10,
            }}>
            <Text
              style={{
                color: BLACK,
                fontSize: 20,
                fontFamily: 'Poppins-Bold',
              }}>
              Team Attendance
            </Text>
          </View>
          <View
            style={{
              width: WIDTH,
              height: HEIGHT * 0.5,
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {TAB4DATA.length > 0 ? (
              <FlatList
                data={TAB4DATA}
                renderItem={ListView}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                ListFooterComponent={
                  <View
                    style={{
                      height: HEIGHT * 0.1,
                      width: WIDTH,
                      backgroundColor: 'white',
                    }}
                  />
                }
              />
            ) : (
              <View>
                <Text
                  style={{
                    color: 'black',
                    fontSize: 20,
                    fontFamily: 'Poppins-Bold',
                  }}>
                  No Data Found !
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Manager;

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
    color: 'white',
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
