import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import React from 'react';
import {WHITE} from '../../../constants/color';
import {HEIGHT, WIDTH} from '../../../constants/config';
import Header from '../../../components/Header';

const MannualApproval = ({navigation}) => {
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
        <Header
          title="Mannual Approval"
          onBackPress={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={styles.flexGrow}
          scrollEnabled={false}></ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MannualApproval;

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
