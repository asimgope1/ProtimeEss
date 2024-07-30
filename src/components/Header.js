// Header.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {HEIGHT, WIDTH} from '../constants/config';
import {WHITE} from '../constants/color';

const Header = ({title, onBackPress}) => {
  return (
    <View>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={'transparent'}
        translucent={true}
        animated={true}
      />
      <LinearGradient
        colors={['#b4000a', '#ff6347']}
        style={styles.headerContainer}>
        <View style={styles.headerContent}>
          {onBackPress && (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    width: WIDTH,
    height: HEIGHT * 0.12,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  headerContent: {
    marginTop: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  backButtonText: {
    color: WHITE,
    fontSize: 16,
    marginTop: 10,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
