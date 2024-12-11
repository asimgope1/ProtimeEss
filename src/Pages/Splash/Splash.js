import React, { Fragment, useEffect, useState } from 'react';
import {
  View,
  Image,
  SafeAreaView,
  ImageBackground,
  PermissionsAndroid,
  Modal,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { BLACK, BRAND } from '../../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import { BASE, LOGO, LOGO2 } from '../../constants/imagepath';
import { HEIGHT, MyStatusBar, WIDTH } from '../../constants/config';
import { splashStyles } from './SplashStyles';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import WritingAnimation from '../../components/WritingAnimation';
import Geolocation from '@react-native-community/geolocation';
import { storeObjByKey } from '../../utils/Storage';

const Splash = ({ navigation }) => {
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Function to check if location permissions are granted
  const checkPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const locationPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        const coarseLocationPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        );
        const backgroundLocationPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        );
        if (locationPermission && coarseLocationPermission && backgroundLocationPermission) {
          return true; // All permissions are granted
        } else {
          return false; // Some permissions are missing
        }
      } else {
        return true; // iOS handles permissions automatically
      }
    } catch (error) {
      console.warn('Error checking permissions:', error);
      return false;
    }
  };

  // Function to request location permissions
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const locationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'ProTime Location Permission',
            message:
              'ProTime needs access to your location to provide attendance tracking. Your location data will only be used for this purpose and will not be shared with third parties. Tap "Allow" to grant permission or "Deny" to decline.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        const coarseLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        );
        const backgroundLocationGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        );

        if (
          locationGranted === PermissionsAndroid.RESULTS.GRANTED &&
          coarseLocationGranted === PermissionsAndroid.RESULTS.GRANTED &&
          backgroundLocationGranted === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('All permissions granted');
          getCurrentLocation();
        } else {
          console.log('One or more permissions denied');
        }
      } else {
        // For iOS, permissions are handled automatically
        getCurrentLocation();
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const getCurrentLocation = async () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          console.log('Latitude:', latitude);
          console.log('Longitude:', longitude);
          reverseGeocode(latitude, longitude);
          resolve({ latitude, longitude });
        },
        error => {
          console.error('Error getting location:', error);
          if (error.code === 1) {
            Alert.alert('Permission Denied', 'Location permission is required to access your location.');
          } else if (error.code === 2) {
            Alert.alert('Position Unavailable', 'Could not determine your location. Please try again.');
          } else if (error.code === 3) {
            Alert.alert('Request Timed Out', 'Location request timed out. Please try again.');
          } else {
            Alert.alert('Unknown Error', 'An unexpected error occurred. Please try again later.');
          }
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    });
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      );
      const result = await response.json();
      console.log('Reverse geocode result:', result);
      storeObjByKey('location', result);
    } catch (error) {
      console.error('Error fetching reverse geocode:', error);
    }
  };

  useEffect(() => {
    const checkAndRequestPermissions = async () => {
      const permissionsGranted = await checkPermissions();
      if (!permissionsGranted) {
        setShowPermissionModal(true); // Show the modal if permissions are not granted
      } else {
        getCurrentLocation(); // If permissions are granted, get the location
        setTimeout(() => {
          navigation.navigate('Check');
        }, 1000);
      }
    };

    checkAndRequestPermissions();
  }, []);

  const logoTranslateY = useSharedValue(HEIGHT);
  const logo2TranslateY = useSharedValue(-HEIGHT);

  useEffect(() => {
    logoTranslateY.value = withTiming(0, { duration: 500 });
    logo2TranslateY.value = withTiming(0, { duration: 500 });
  }, []);

  const logoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: logoTranslateY.value }],
    };
  });

  const logo2Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: logo2TranslateY.value }],
    };
  });

  return (
    <Fragment>
      <MyStatusBar backgroundColor={'transparent'} barStyle={'dark-content'} />
      <ImageBackground
        source={BASE}
        style={{
          flex: 1,
          width: WIDTH,
          alignItems: 'center',
          backgroundColor: 'rgb(255, 0, 0)',
        }}>
        <View
          style={{
            marginTop: HEIGHT * 0.3,
            width: WIDTH * 0.5,
            height: HEIGHT * 0.2,
            alignItems: 'center',
            alignSelf: 'center',
          }}>
          <Animated.View style={[styles.logoContainer1, logoStyle]}>
            <Image
              source={LOGO}
              style={{
                height: '100%',
                width: '100%',
                resizeMode: 'contain',
                alignSelf: 'center',
              }}
            />
          </Animated.View>
          <Animated.View style={[styles.logoContainer, logo2Style]}>
            <Image
              source={LOGO2}
              style={{
                height: '100%',
                width: '100%',
                resizeMode: 'contain',
                alignSelf: 'center',
              }}
            />
          </Animated.View>
        </View>
      </ImageBackground>

      <Modal
        transparent={true}
        visible={showPermissionModal}
        animationType="slide"
        onRequestClose={() => setShowPermissionModal(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <View
            style={{
              width: WIDTH * 0.8,
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 20,
              alignItems: 'center',
            }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              Location Permission
            </Text>
            <Text style={{ textAlign: 'center', marginBottom: 20, color: BLACK, fontSize: 16 }}>
              This app needs access to your location, including in the background, to provide location-based services.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#4CAF50',
                padding: 10,
                borderRadius: 5,
                marginBottom: 10,
                width: '100%',
                alignItems: 'center',
              }}
              onPress={async () => {
                await requestLocationPermission();
                setShowPermissionModal(false);

                // Add a delay for better UX before navigating
                setTimeout(() => {
                  navigation.navigate('Check');
                }, 1000);
              }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Allow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: '#f44336',
                padding: 10,
                borderRadius: 5,
                width: '100%',
                alignItems: 'center',
              }}
              onPress={() => {
                setShowPermissionModal(false);
                setTimeout(() => {
                  navigation.navigate('Check');
                }, 1000);
              }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Deny</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Fragment>
  );
};

export default Splash;

const styles = {
  logoContainer: {
    height: HEIGHT * 0.09,
    width: WIDTH * 0.75,
  },
  logoContainer1: {
    height: HEIGHT * 0.09,
    width: WIDTH * 0.35,
  },
};
