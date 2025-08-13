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
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {getObjByKey} from '../../../utils/Storage';
import SQLitePlugin from 'react-native-sqlite-2';
import {HEIGHT, WIDTH} from '../../../constants/config';
import {BLACK, GRAY, RED, WHITE} from '../../../constants/color';
import Header from '../../../components/Header';
import {CheckBox, Icon} from '@rneui/themed';
import {Picker} from '@react-native-picker/picker';
import {launchCamera} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';

import LinearGradient from 'react-native-linear-gradient';
import {Loader} from '../../../components/Loader';

const IN_OUT2 = ({navigation}) => {
  const [clientUrl, setClientUrl] = useState('');
  const [Id, setID] = useState();
  const [Sl, setSl] = useState();
  const [loading, setLoading] = useState(false);
  const [Balance, setBalance] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveType, setLeaveType] = useState('');
  const [status, setstatus] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [image, setImage] = useState(null);
  const [base64String, setBase64String] = useState('');

  // SQLite DB initialization
  const db = SQLitePlugin.openDatabase({
    name: 'test.db',
    version: '1.0',
    description: '',
    size: 1,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      leaveList(Id);
    }, 100);

    return () => clearTimeout(timeoutId); // Cleanup
  }, [Id]);

  // Function to initialize the data
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

  // Fetch client URL from SQLite
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

  // Retrieve login details
  const RetrieveDetails = async () => {
    try {
      const value = await getObjByKey('loginResponse');
      if (value !== null) {
        setID(value[0]?.loc_cd);
        setSl(value[0]?.staf_sl);
      }
    } catch (e) {
      console.error('Error retrieving details:', e);
    }
  };

  // Fetch leave balance
  const fetchLeaveBalance = async (ID, SL) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');
      const raw = JSON.stringify({loc_cd: ID, staf_sl: SL});

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      const response = await fetch(
        `${clientUrl}api/divisiondisplay`,
        requestOptions,
      );
      const result = await response.json();
      if (result.Code === '200') {
        setBalance(result.data_value);
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leave list
  const leaveList = async loc => {
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    const raw = JSON.stringify({loc_cd: Id, staf_sl: Sl});

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    try {
      const response = await fetch(
        `${clientUrl}/api/divisiondisplay`,
        requestOptions,
      );
      const result = await response.json();
      setLoading(false);
      if (result.data_value) {
        const leaveTypesData = result.data_value.map(item => ({
          label: item.div_nm,
          value: item.div_sl,
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

  // Handle image selection and apply leave
  const pickImage = async () => {
    await launchCamera({mediaType: 'photo'}, async response => {
      if (response?.assets && response?.assets?.length > 0) {
        const image = response.assets[0];

        try {
          // Resize the image to reduce size
          const resizedImage = await ImageResizer.createResizedImage(
            image.uri,
            400, // Width
            400, // Height
            'JPEG', // Format
            70, // Quality (0-100)
            0, // Rotation (0 means no rotation)
          );

          setImage(resizedImage.uri);
          convertToBase64(resizedImage.uri);
        } catch (error) {
          console.log('Error resizing image:', error);
        }
      }
    });
  };

  const convertToBase64 = async uri => {
    try {
      const base64 = await RNFS.readFile(uri, 'base64');
      setBase64String(base64);
      handleApplyLeave(base64);
    } catch (error) {
      console.error('Error converting image to Base64:', error);
    }
  };

  // Leave Selected Handler
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

  // Apply leave
  const handleApplyLeave = async base64 => {
    console.log('base64-------------------', base64);
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      loc_cd: Id,
      staf_sl: Sl,
      div_sl: leaveType,
      log_dt: currentDateTime
        .toLocaleDateString('en-GB')
        .split('/')
        .reverse()
        .join('/'),
      log_time: currentDateTime.toLocaleTimeString('en-GB'),
      log_note: note,
      log_img: base64,
      log_status: 'P',
      post_type: status,
    });
    console.log('raw', raw);

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    await fetch(`${clientUrl}api/manualposting`, requestOptions)
      .then(response => response.json())
      .then(result => {
        setLoading(false);
        console.log('result', result);
        if (result.Code === '200') {
          setLeaveType('');
          setstatus('');
          setImage(null);
          alert(result.msg);

          // Clear the note after the API response is processed
          setNote('');
        }
      })
      .catch(error => console.error(error));
  };

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (Id && Sl && clientUrl) {
      fetchLeaveBalance(Id, Sl);
    }
  }, [Id, Sl, clientUrl]);
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
        <Header title="IN_OUT2" onBackPress={() => navigation.goBack()} />
        {/* <WebView source={{uri: url}} style={{flex: 1}} /> */}
        <View
          style={{
            width: WIDTH,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
          }}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.timeText}>
              {currentDateTime.toLocaleTimeString('en-GB', {})}
            </Text>
          </View>
          <View
            style={{
              width: WIDTH * 0.95,
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
              Division Type
            </Text>
          </View>
          <Picker
            selectedValue={leaveType}
            dropdownIconColor={BLACK}
            style={styles.picker}
            onValueChange={LeaveSelected}>
            <Picker.Item label="Select Division type" value="" />
            {leaveTypes.map((item, index) => (
              <Picker.Item key={index} label={item.label} value={item.value} />
            ))}
          </Picker>

          <View style={styles.checklistContainer}>
            <View style={{width: WIDTH, flexDirection: 'row', marginTop: 10}}>
              <CheckBox
                title="Att.."
                checked={status === 'Attendance'}
                onPress={() => setstatus('Attendance')}
              />
              <CheckBox
                title="WFH"
                checked={status === 'Work from Home'}
                onPress={() => setstatus('Work from Home')}
              />
              <CheckBox
                title="Tour"
                checked={status === 'Tour'}
                onPress={() => setstatus('Tour')}
              />
            </View>
            <View
              style={{
                width: WIDTH * 0.99,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                marginTop: 5,
              }}>
              <CheckBox
                title="Outdoor"
                checked={status === 'Outdoor'}
                onPress={() => setstatus('Outdoor')}
              />
            </View>
          </View>

          <TextInput
            style={styles.textinput}
            value={note}
            placeholderTextColor={GRAY}
            placeholder="Comments"
            multiline={true}
            onChangeText={txt => setNote(txt)}
          />                                                                                                     1
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              pickImage();
            }}>
            <LinearGradient
              colors={['#b4000a', '#ff6347']}
              style={styles.button}>
              <Text style={styles.buttonText}>Submit Attendance</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Loader visible={loading} />
    </SafeAreaView>
  );
};

export default IN_OUT2;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    // backgroundColor: WHITE,
    // alignSelf: 'center',
    // alignItems: 'center',
    width: '100%',
    justifyContent: 'flex-start',
  },
  scrollViewContent: {
    flexGrow: 1,
    position: 'absolute',
    backgroundColor: 'transparent',
    // justifyContent: 'center',
    alignItems: 'center',
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
  dateTimeContainer: {
    width: WIDTH * 0.6,
    marginTop: 50,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dateText: {
    color: BLACK,
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
  },
  timeText: {
    color: BLACK,
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  picker: {
    width: WIDTH * 0.95,
    color: BLACK,
    backgroundColor: WHITE,
    // marginBottom: 20,
    borderWidth: 1,
    elevation: 4,
    borderColor: RED,
  },
  checklistContainer: {
    width: WIDTH,
    marginTop: 20,

    // justifyContent: 'space-around',
    // marginBottom: 20,
    // paddingVertical: 10,
    // flexDirection: 'row',
  },
  textinput: {
    width: WIDTH * 0.85,
    height: HEIGHT * 0.07,
    backgroundColor: WHITE,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 4,
    borderColor: RED,
    padding: 10,
    color: BLACK,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginTop: 20,
  },
  button: {
    width: WIDTH * 0.8,
    height: 50,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,

    borderRadius: HEIGHT * 0.1,
    marginBottom: 10,
    overflow: 'visible',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
