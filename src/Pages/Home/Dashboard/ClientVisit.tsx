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
import {GestureHandlerRootView, Switch} from 'react-native-gesture-handler';
import DropDownPicker from 'react-native-dropdown-picker';

const ClientVisit = ({navigation}) => {
  const [fromTime, setFromTime] = useState(new Date());
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [toTime, setToTime] = useState(new Date());
  const [open, setOpen] = useState(false); // Controls dropdown visibility
  const [value, setValue] = useState(null); // Holds the selected value
  const [items, setItems] = useState([
    {label: 'Organization 1', value: 'org1'},
    {label: 'Organization 2', value: 'org2'},
    {label: 'Organization 3', value: 'org3'},
  ]);
  return (
    <GestureHandlerRootView style={styles.flex}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Header title="Client Visit" onBackPress={() => navigation.goBack()} />
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          scrollEnabled={false}>
          <View
            style={{
              width: WIDTH * 0.95,
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'center',
              marginVertical: 10,
              alignSelf: 'center',
            }}>


            {/* Date Picker */}
            <TouchableOpacity
              onPress={() => setShowFromDatePicker(true)}
              style={{
                width: '50%',
                padding: 10,
                borderColor: '#ccc',
                borderWidth: 1,
                borderRadius: 5,
              }}>
              <Text style={{color: GRAY}}>DATE</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.dateText}>{fromDate.toDateString()}</Text>
                <Icon name="calendar-today" size={HEIGHT * 0.03} />
              </View>
            </TouchableOpacity>

            {showFromDatePicker && (
              <DateTimePicker
                value={fromDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowFromDatePicker(false);
                  if (selectedDate) {
                    setFromDate(selectedDate);
                  }
                }}
              />
            )}



            {/* Time Picker */}
            <TouchableOpacity
              onPress={() => setShowFromTimePicker(true)}
              style={{
                width: '50%',
                padding: 10,
                borderColor: '#ccc',
                borderWidth: 1,
                borderRadius: 5,
              }}>
              <Text style={{color: GRAY}}>TIME</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.dateText}>
                  {moment(fromTime).format('hh:mm A')}
                </Text>
                <Icon name="watch-later" size={HEIGHT * 0.03} />
              </View>
            </TouchableOpacity>

            {showFromTimePicker && (
              <DateTimePicker
                value={fromTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowFromTimePicker(false);
                  if (selectedTime) {
                    setFromTime(selectedTime);
                  }
                }}
              />
            )}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organization Name</Text>
            <DropDownPicker
              open={open}
              value={value}
              items={items}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setItems}
              placeholder="Select Organization"
              searchContainerStyle={{borderColor: WHITE}}
              searchable={true}
              searchPlaceholder="Search Organization..."
              searchTextInputStyle={{borderColor: WHITE}}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={{fontSize: 14, color: '#888'}}
              theme="DARK"
              multiple={true}
              mode="BADGE"
              badgeDotColors={[
                '#e76f51',
                '#00b4d8',
                '#e9c46a',
                '#e76f51',
                '#8ac926',
                '#00b4d8',
                '#e9c46a',
              ]}
            />
          </View>
          <View
            style={{
              width: WIDTH * 0.95,
              height: HEIGHT * 0.038,
              marginTop: 5,
              alignSelf: 'center',
            }}>
            <Text
              style={{
                color: BLACK,
                fontSize: 14,
                fontFamily: 'Poppins-Bold',
              }}>
              Address
            </Text>
          </View>
          <TextInput
            style={{
              color: 'black',
              width: WIDTH * 0.95,
              height: HEIGHT * 0.07,
              borderColor: '#ccc',
              borderWidth: 1,
              alignSelf: 'center',
              paddingHorizontal: 20,
              fontSize: 14,
              backgroundColor: '#f9f9f9',
            }}
            placeholder="Enter Your Address"
            placeholderTextColor="#888"
            maxLength={150}
          />

          <View
            style={{
              width: WIDTH * 0.95,
              height: HEIGHT * 0.038,
              marginTop: 10,
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}>
            <Text
              style={{
                color: BLACK,
                fontSize: 14,
                fontFamily: 'Poppins-Bold',
              }}>
              Contact
            </Text>
            <Text
              style={{
                color: BLACK,
                fontSize: 14,
                fontFamily: 'Poppins-Bold',
              }}>
              Designation
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignSelf: 'center',
              width: WIDTH * 0.95,
              height: HEIGHT * 0.038,
              marginTop: 10,
            }}>
            <TextInput
              style={{
                color: 'black',
                width: WIDTH * 0.47,
                height: HEIGHT * 0.07,
                borderColor: '#ccc',
                borderWidth: 1,
                alignSelf: 'center',
                paddingHorizontal: 20,

                fontSize: 14,
                backgroundColor: '#f9f9f9',
              }}
              placeholder="Enter Your Contact"
              placeholderTextColor="#888"
              maxLength={150}
            />

            <TextInput
              style={{
                color: 'black',
                width: WIDTH * 0.47,
                height: HEIGHT * 0.07,
                borderColor: '#ccc',
                borderWidth: 1,
                alignSelf: 'center',
                textAlign: 'center',

                paddingHorizontal: 20,
                fontSize: 14,
                backgroundColor: '#f9f9f9',
              }}
              placeholder="Enter Your Desig..."
              placeholderTextColor="#888"
              maxLength={150}
            />
          </View>

          <View
            style={{
              width: WIDTH * 0.95,
              height: HEIGHT * 0.038,
              marginTop: 20,
              alignSelf: 'center',
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}>
            <Text
              style={{
                color: BLACK,
                fontSize: 14,
                fontFamily: 'Poppins-Bold',
              }}>
              Phone No.
            </Text>
            <Text
              style={{
                color: BLACK,
                fontSize: 14,
                fontFamily: 'Poppins-Bold',
              }}>
              Email ID
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignSelf: 'center',
              width: WIDTH * 0.95,
              height: HEIGHT * 0.038,
              marginTop: 10,
            }}>
            <TextInput
              style={{
                color: 'black',
                width: WIDTH * 0.47,
                height: HEIGHT * 0.07,
                borderColor: '#ccc',
                borderWidth: 1,
                alignSelf: 'center',
                paddingHorizontal: 20,
                paddingVertical: 5,
                textAlign: 'center',
                fontSize: 14,
                backgroundColor: '#f9f9f9',
              }}
              placeholder="Enter Your Phone No."
              placeholderTextColor="#888"
              maxLength={10}
            />

            <TextInput
              style={{
                color: 'black',
                width: WIDTH * 0.47,
                height: HEIGHT * 0.07,
                borderColor: '#ccc',
                borderWidth: 1,
                alignSelf: 'center',

                textAlign: 'center',
                paddingHorizontal: 20,
                paddingVertical: 5,
                fontSize: 14,
                backgroundColor: '#f9f9f9',
              }}
              placeholder="Enter Your Email ID"
              placeholderTextColor="#888"
              maxLength={150}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              // alignSelf:'center',
              padding: 20,
              justifyContent: 'space-between',
              marginTop: HEIGHT * 0.05,
            }}>
            <TouchableOpacity style={styles.button}>
              <LinearGradient
                colors={['#b4000a', '#ff6347']}
                style={styles.buttonBackground}>
                <Text style={styles.buttonText}>Submit</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Switch
              trackColor={{false: '#D3D3D3', true: ORANGE}} // Change the track color
              thumbColor={WHITE} // Set thumb color
              // ios_backgroundColor="#CCCCCC" // Background color for iOS when off
              style={{
                transform: [{scaleX: 1.5}, {scaleY: 1.3}], // Scale up the size
                // marginLeft: 10, // Add space from adjacent components
                // borderWidth: 1, // Optional border
                // borderColor: 'pink', // Border color
                // borderRadius: 20, // Rounded edges for a modern look
                // padding: 10, // Add padding around the switch
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};

export default ClientVisit;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
 
  button: {
    width: WIDTH * 0.5,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  section: {
    width: '95%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  sectionTitle: {
    color: 'black',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    marginBottom: 5,
  },
  dropdown: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
    borderRadius: 5,
    height: 50,
    color: WHITE,
  },
  dropdownContainer: {
    borderColor: '#888',
    zIndex: 999,

  },
  buttonText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  sectionContainer: {
    width: WIDTH * 0.9,
    height: HEIGHT * 0.038,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },

  dateTimeContainer: {
    width: WIDTH * 0.95,
    height: HEIGHT * 0.1,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 10,
    paddingTop: 25,
  },
  datePicker: {
    width: '45%',
    height: HEIGHT * 0.1,
  },
  dateLabel: {
    color: GRAY,
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    color: BLACK,
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
  },
  timePicker: {
    width: '45%',
    height: HEIGHT * 0.1,
  },
  timeLabel: {
    color: GRAY,
  },
  picker: {
    width: WIDTH * 0.95,
    color: BLACK,
    backgroundColor: WHITE,

    borderWidth: 1,
    elevation: 4,
    borderColor: RED,
  },
});
