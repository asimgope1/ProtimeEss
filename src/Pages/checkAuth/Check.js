import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  TextInput,
  TouchableOpacity,
  Image,
  BackHandler,
  ToastAndroid,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {HEIGHT, WIDTH} from '../../constants/config';
import LinearGradient from 'react-native-linear-gradient';
import SQLitePlugin from 'react-native-sqlite-2';
import {checkuserToken} from '../../redux/actions/auth';
import {useDispatch} from 'react-redux';
import {storeObjByKey} from '../../utils/Storage';

const Check = ({navigation}) => {
  const [code, setCode] = useState('');
  const [backPressed, setBackPressed] = useState(0);
  const [loading, setLoading] = useState(false);

  const headerCardHeight = useSharedValue(0);
  const loginContainerTranslateY = useSharedValue(HEIGHT);
  const animatedViewTranslateX = useSharedValue(WIDTH);

  const dispatch = useDispatch();

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

  useEffect(() => {
    fetchClientUrlFromSQLite();
    headerCardHeight.value = withTiming(HEIGHT * 0.5, {duration: 1500});
    loginContainerTranslateY.value = withTiming(0, {duration: 1500});
    animatedViewTranslateX.value = withTiming(0, {duration: 1500});

    const backAction = () => {
      if (backPressed > 0) {
        BackHandler.exitApp();
      } else {
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        setBackPressed(backPressed + 1);
        setTimeout(() => {
          setBackPressed(0);
        }, 2000);
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [backPressed]);

  const fetchClientUrlFromSQLite = () => {
    const db = SQLitePlugin.openDatabase({
      name: 'test.db',
      version: '1.0',
      description: '',
      size: 1,
    });

    db.transaction(tx => {
      tx.executeSql(
        'SELECT client_url FROM ApiResponse ORDER BY id DESC LIMIT 1',
        [],
        (_, {rows}) => {
          const url = rows.item(0)?.client_url || '';
          if (url) {
            navigation.navigate('Login');
          } else {
            console.log('No client_url found in database');
          }
        },
        error => {
          console.error('Error fetching client_url:', error);
        },
      );
    });
  };

  const handleLogin = async () => {
    setLoading(true);
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      compcode: code,
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    await fetch('https://protimes.co.in/ptadmin/api/validcode', requestOptions)
      .then(response => response.json())
      .then(result => {
        setLoading(false);
        if (result.status === 'success' && result.data_value.length > 0) {
          const clientUrl = result.data_value[0].client_url;

          // Open SQLite database
          const db = SQLitePlugin.openDatabase({
            name: 'test.db',
            version: '1.0',
            description: '',
            size: 1,
          });

          // Create table if not exists
          db.transaction(tx => {
            tx.executeSql(
              'CREATE TABLE IF NOT EXISTS ApiResponse(id INTEGER PRIMARY KEY AUTOINCREMENT, client_url TEXT)',
              [],
              () => console.log('Table created successfully'),
              error => console.error('Error creating table:', error),
            );
          });

          // Insert client_url into database
          db.transaction(tx => {
            tx.executeSql(
              'INSERT INTO ApiResponse (client_url) VALUES (?)',
              [clientUrl],
              () => {
                console.log('client_url saved to database:', clientUrl);
                // Navigate to Login screen after saving the URL
                navigation.navigate('Login');
                // storeObjByKey('loginResponse', result);
                // dispatch(checkuserToken(true));
              },
              error =>
                console.error('Error saving client_url to database:', error),
            );
          });
        } else {
          Alert.alert(
            'Invalid Code',
            result.msg,
            [{text: 'OK', onPress: () => console.log('OK Pressed')}],
            {cancelable: false},
          );
          console.error('Invalid response from API:', result);
        }
      })
      .catch(error => {
        console.error('Error making API call:', error);
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
              placeholder="Enter Code"
              placeholderTextColor="#aaa"
              value={code}
              onChangeText={setCode}
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
                <Text style={styles.buttonText}>Submit</Text>
              </LinearGradient>
            </TouchableOpacity>
            {/* // )} */}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Check;

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
});
