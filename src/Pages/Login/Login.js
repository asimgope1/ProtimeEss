import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import SQLitePlugin from 'react-native-sqlite-2'; // Import SQLitePlugin
import {POSTNETWORK} from '../../utils/Network';
import {storeObjByKey, storeStringByKey} from '../../utils/Storage';
import {checkuserToken} from '../../redux/actions/auth';
import {useDispatch} from 'react-redux';

export const {width: WIDTH, height: HEIGHT} = Dimensions.get('window');

const Login = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clientUrl, setClientUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // SQLite database initialization
  const db = SQLitePlugin.openDatabase({
    name: 'test.db',
    version: '1.0',
    description: '',
    size: 1,
  });

  const headerCardHeight = useSharedValue(0);
  const loginContainerTranslateY = useSharedValue(HEIGHT);
  const animatedViewTranslateX = useSharedValue(WIDTH);

  const headerStyle = useAnimatedStyle(() => {
    return {
      height: headerCardHeight.value,
    };
  });

  const loginContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: loginContainerTranslateY.value}],
    };
  });

  const animatedViewStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: animatedViewTranslateX.value}],
    };
  });

  const fetchClientUrlFromSQLite = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT client_url FROM ApiResponse ORDER BY id DESC LIMIT 1',
        [],
        (_, {rows}) => {
          const url = rows.item(0)?.client_url || '';
          setClientUrl(url);
        },
        error => {
          console.error('Error fetching client_url:', error);
        },
      );
    });
  };

  useEffect(() => {
    headerCardHeight.value = withTiming(HEIGHT * 0.5, {duration: 1500});
    loginContainerTranslateY.value = withTiming(0, {duration: 1500});
    animatedViewTranslateX.value = withTiming(0, {duration: 1500});

    fetchClientUrlFromSQLite();
    fetchCredentials();
  }, []);

  const handleLogin = async () => {
    const url = `${clientUrl}api/login`;
    const data = {userid: username, password: password};
    setLoading(true);

    try {
      const res = await POSTNETWORK(url, data);
      console.log('reddd', res);
      if (res.Code === '200' && res.msg === 'Logged in successfully...') {
        alert('Login', res);
      } else {
        alert('Login failed', res);
      }

      setLoading(false);

      // if (res.Code === '200' && res.msg === 'Logged in successfully...') {
      //   // Store login response (if needed)
      //   await storeObjByKey('loginResponse', res.data);
      //   await storeObjByKey('userid', username);
      //   await storeObjByKey('password', password);

      //   // Store username and password securely in SQLite
      //   const db = SQLitePlugin.openDatabase({
      //     name: 'test.db',
      //     version: '1.0',
      //     description: '',
      //     size: 1,
      //   });
      //   db.transaction(tx => {
      //     tx.executeSql(
      //       'CREATE TABLE IF NOT EXISTS UserCredentials (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)',
      //       [],
      //       () => {
      //         console.log('Table UserCredentials created successfully');
      //       },
      //       error => {
      //         console.error('Error creating table UserCredentials:', error);
      //       },
      //     );

      //     tx.executeSql(
      //       'INSERT INTO UserCredentials (username, password) VALUES (?, ?)',
      //       [username, password],
      //       (_, result) => {
      //         console.log('User credentials saved successfully:', result);
      //       },
      //       error => {
      //         console.error('Error saving user credentials:', error);
      //       },
      //     );
      //   });

      //   // Dispatch action to update user token or navigate to Home
      //   dispatch(checkuserToken());
      // } else {
      //   Alert.alert('Login failed', res.msg, [
      //     {text: 'OK', onPress: () => console.log('OK Pressed')},
      //   ]);
      //   console.error('Login failed:', res.Message); // Handle login failure
      // }
    } catch (error) {
      console.error('Network error:', error); // Handle network errors
      // Alert.alert('Network Error', error);
    }
  };

  const fetchCredentials = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM UserCredentials ORDER BY id DESC LIMIT 1',
        [],
        (_, result) => {
          if (result.rows.length > 0) {
            const fetchedUsername = result.rows.item(0).username || '';
            const fetchedPassword = result.rows.item(0).password || '';
            setUsername(fetchedUsername);
            setPassword(fetchedPassword);
          }
          console.log('Credentials fetched successfully');
        },
        error => {
          console.error('Error fetching credentials:', error);
        },
      );
    });
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={'transparent'}
        translucent={true}
        animated={true}
      />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <Animated.View
            style={[
              {
                width: WIDTH,
                height: HEIGHT * 0.6,
                backgroundColor: '#b4000a',
                borderBottomLeftRadius: WIDTH * 0.05,
                borderBottomRightRadius: WIDTH * 0.5,
                alignItems: 'center',
                justifyContent: 'center',
              },
              headerStyle,
            ]}>
            <View
              style={{
                width: WIDTH * 0.8,
                height: WIDTH * 0.8,
                borderRadius: WIDTH * 0.4,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}>
              <Image
                source={require('../../Assets/images/logo.png')}
                style={{
                  width: '85%',
                  height: '100%',
                  borderRadius: WIDTH * 0.4,
                  resizeMode: 'contain',
                }}
              />
            </View>
          </Animated.View>
          <Animated.View style={[styles.loginContainer, loginContainerStyle]}>
            <TextInput
              style={styles.input}
              placeholder="Enter Employee Id"
              placeholderTextColor="#aaa"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter Password"
              placeholderTextColor="#aaa"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
            {/* {loading === true ? (
              <ActivityIndicator
                size="large"
                color="#000"
                animating={loading}
                style={{
                  position: 'absolute',
                  top: HEIGHT * 0.5,
                  left: WIDTH * 0.5,
                }}
              />
            ) : ( */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                handleLogin();
              }}>
              <LinearGradient
                colors={['#b4000a', '#ff6347']}
                style={styles.buttonBackground}>
                <Text style={styles.buttonText}>Login</Text>
              </LinearGradient>
            </TouchableOpacity>
            {/* )} */}
            <View
              style={{
                marginTop: 10,
                height: HEIGHT * 0.02,
                width: WIDTH * 0.9,
                justifyContent: 'space-around',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              <View
                style={{
                  height: HEIGHT * 0.001,
                  width: WIDTH * 0.2,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'black',
                }}></View>
              <Text
                style={{
                  color: 'black',
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: '700',
                }}>
                Offline Mode
              </Text>
              <View
                style={{
                  height: HEIGHT * 0.001,
                  width: WIDTH * 0.2,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'black',
                }}></View>
            </View>
            <Animated.View style={[styles.animatedView, animatedViewStyle]}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Check');
                }}
                style={styles.box}>
                <Image
                  source={require('../../Assets/images/squareserver.png')}
                  style={{
                    height: '100%',
                    width: '100%',
                    resizeMode: 'contain',
                  }}
                />
                <Text
                  style={{
                    color: 'black',
                    textAlign: 'center',
                    fontSize: 10,
                  }}>
                  Server Setup
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.box}>
                <Image
                  source={require('../../Assets/images/squarevisit.png')}
                  style={{
                    height: '100%',
                    width: '100%',
                    resizeMode: 'contain',
                  }}
                />
                <Text
                  style={{
                    color: 'black',
                    textAlign: 'center',
                    fontSize: 10,
                  }}>
                  Client Visit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.box}>
                <Image
                  source={require('../../Assets/images/squaresupervisor.png')}
                  style={{
                    height: '100%',
                    width: '100%',
                    resizeMode: 'contain',
                  }}
                />
                <Text
                  style={{
                    color: 'black',
                    textAlign: 'center',
                    fontSize: 10,
                  }}>
                  Supervisor Corner
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.box}>
                <Image
                  source={require('../../Assets/images/squareodometer.png')}
                  style={{
                    height: '100%',
                    width: '100%',
                    resizeMode: 'contain',
                  }}
                />
                <Text
                  style={{
                    color: 'black',
                    textAlign: 'center',
                    fontSize: 10,
                  }}>
                  Odometer Entry
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    color: 'black',
    width: WIDTH * 0.8,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    width: WIDTH * 0.8,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 10,
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
});
