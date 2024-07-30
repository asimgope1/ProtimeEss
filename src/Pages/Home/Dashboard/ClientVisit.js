import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {HEIGHT, MyStatusBar, WIDTH} from '../../../constants/config';
import {BLACK, GRAY, ORANGE, RED, WHITE} from '../../../constants/color';
import Header from '../../../components/Header';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {CheckBox, Icon} from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import moment from 'moment';
import SQLitePlugin from 'react-native-sqlite-2';
import {getObjByKey} from '../../../utils/Storage';
import LinearGradient from 'react-native-linear-gradient';

const ClientVisit = ({navigation}) => {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header title="Client Visit" onBackPress={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: WHITE,
        }}></ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ClientVisit;

const styles = StyleSheet.create({});
