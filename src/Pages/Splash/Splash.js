import React, {Fragment, useEffect} from 'react';
import {
  View,
  Image,
  SafeAreaView,
  ImageBackground,
  PermissionsAndroid,
} from 'react-native';
import {BRAND} from '../../constants/color';
import LinearGradient from 'react-native-linear-gradient';
import {BASE, LOGO, LOGO2} from '../../constants/imagepath';
import {HEIGHT, MyStatusBar, WIDTH} from '../../constants/config';
import {splashStyles} from './SplashStyles';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import WritingAnimation from '../../components/WritingAnimation';
import Geolocation from '@react-native-community/geolocation';
import {storeObjByKey} from '../../utils/Storage';

const Splash = ({navigation}) => {
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
        if (locationGranted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
          getCurrentLocation();
        } else {
          console.log('Location permission denied');
        }
      } else {
        // For iOS, no need to request permissions manually, it's done automatically
        getCurrentLocation();
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);

        // Call the reverse geocode API
        reverseGeocode(latitude, longitude);
      },
      error => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  const reverseGeocode = async (latitude, longitude) => {
    console.log('hiii');
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
    requestLocationPermission();
  }, []);

  const logoTranslateY = useSharedValue(HEIGHT);
  const logo2TranslateY = useSharedValue(-HEIGHT);

  useEffect(() => {
    logoTranslateY.value = withTiming(0, {duration: 500});
    logo2TranslateY.value = withTiming(0, {duration: 500});

    setTimeout(() => {
      navigation.navigate('Check');
    }, 2000);
  }, []);

  const logoStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: logoTranslateY.value}],
    };
  });

  const logo2Style = useAnimatedStyle(() => {
    return {
      transform: [{translateY: logo2TranslateY.value}],
    };
  });

  return (
    <Fragment>
      <MyStatusBar backgroundColor={'transparent'} barStyle={'dark-content'} />
      {/* <SafeAreaView style={splashStyles.maincontainer}> */}
      <ImageBackground
        source={BASE}
        style={{
          flex: 1,
          width: WIDTH,
          alignItems: 'center',
          // justifyContent: 'center',
          backgroundColor: 'rgb(255, 0, 0)',
        }}>
        <View
          style={{
            marginTop: HEIGHT * 0.3,
            width: WIDTH * 0.5,
            height: HEIGHT * 0.2,
            // justifyContent: 'space-evenly',
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
        {/* <WritingAnimation text="Welcome to Our App!" /> */}
      </ImageBackground>
      {/* </SafeAreaView> */}
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
