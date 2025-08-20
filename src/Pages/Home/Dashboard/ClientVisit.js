import React, {useCallback, useEffect, useState} from 'react';
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
  Alert,
  Image,
  Modal,
} from 'react-native';
import {HEIGHT, MyStatusBar, WIDTH} from '../../../constants/config';
import {BLACK, GRAY, ORANGE, RED, WHITE} from '../../../constants/color';
import Header from '../../../components/Header';
import {CheckBox, Icon} from '@rneui/themed';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import SQLitePlugin from 'react-native-sqlite-2';
import {getObjByKey} from '../../../utils/Storage';
import LinearGradient from 'react-native-linear-gradient';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import DropDownPicker from 'react-native-dropdown-picker';
import Geolocation from '@react-native-community/geolocation';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const ClientVisit = ({navigation}) => {
  const [fromTime, setFromTime] = useState(new Date());
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([]);
  const [clientUrl, setClientUrl] = useState('');
  const [Id, setID] = useState();
  const [Sl, setSl] = useState();
  const [staffName, setStaffName] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [location, setLocation] = useState({
    latitude: '',
    longitude: '',
    address: '',
  });
  const [visits, setVisits] = useState([]);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [endVisitModalVisible, setEndVisitModalVisible] = useState(false);
  const [visitStatus, setVisitStatus] = useState('');


  // Form state
  const [formData, setFormData] = useState({
    org_name: '',
    org_address: '',
    org_cont_prsn: '',
    org_cont: '',
    org_desig: '',
    org_email: '',
    visit_status: '',
    visit_img: '',
  });

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
            resolve(url);
          },
          error => reject(error),
        );
      });
    });
  };

  const RetrieveDetails = async () => {
    try {
      const value = await getObjByKey('loginResponse');
      if (value !== null) {
        setID(value[0]?.loc_cd);
        setSl(value[0]?.staf_sl);
        setStaffName(value[0]?.staf_nm || '');
      }
    } catch (e) {
      console.error('Error retrieving details:', e);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
          address: 'Current location',
        });
      },
      error => {
        console.log(error);
        Alert.alert('Error', 'Unable to fetch location');
      },
      {enableHighAccuracy: false, timeout: 15000, maximumAge: 10000},
    );
  };

  const selectImage = () => {
    launchCamera({mediaType: 'photo'}, response => {
      if (!response.didCancel && !response.error) {
        setImageUri(response.assets[0].uri);
        setFormData({...formData, visit_img: response.assets[0].uri});
        handleImageSelection(response.assets[0].uri);
      } else {
        Alert.alert('Error', 'Unable to select image');

      }
    });
  };

  // image is selected or not call handlesubmit
  const handleImageSelection = (res) => {
    if (res) {
      handleSubmit();
    } else {
      Alert.alert('Error', 'Please select an image');
    }
  };

  const initialize = async () => {
    try {
      const url = await fetchClientUrlFromSQLite();
      await RetrieveDetails();
      getCurrentLocation();
      getVisitList();
    } catch (error) {
      console.error('Initialization error:', error);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.org_name || !formData.org_address) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const visitData = {
        staf_sl: Sl,
        loc_cd: Id,
        visit_dt: moment(fromDate).format('YYYY-MM-DD'),
        visit_stime: moment(fromTime).format('HH:mm'),
        visit_etime: '',
        visit_longitude: location.longitude,
        visit_lattitude: location.latitude,
        visit_location: location.address,
        ...formData,
      };

      console.log('Visit Data:', JSON.stringify(visitData));

      const response = await fetch(`${clientUrl}api/visitentry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitData),
      });

      const result = await response.json();

      if (result.status === 'success') {
        Alert.alert('Success', result.msg);
        setShowVisitForm(false);
        getVisitList();
        resetForm();
      } else {
        Alert.alert('Error', result.msg || 'Something went wrong');
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'Failed to submit visit details');
    } finally {
      setLoading(false);
    }
  };

const getVisitList = useCallback(async () => {
  // Check if required dependencies are available
  if (!clientUrl || !Sl || !Id) {
    console.warn('Missing required parameters for getVisitList');
    return;
  }

  try {
    const response = await fetch(
      `${clientUrl}api/GetPendingVisits?staf_sl=${Sl}&loc_cd=${Id}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status === 'success') {
      setVisits(result.data_value || []);
    } else {
      Alert.alert('Error', result.msg || 'Failed to fetch visits');
    }
  } catch (error) {
    console.error('Fetch error:', error);
    Alert.alert('Error', 'Failed to load visits');
  }
}, [clientUrl, Sl, Id]); // Dependencies array

// Call this whenever dependencies change
useEffect(() => {
  if (clientUrl && Sl && Id) {
    getVisitList();
  }
}, [clientUrl, Sl, Id, getVisitList]);

const handleEndVisit = async (visitId,) => {
  try {
    // 1. Get current time
    const endTime = moment().format('HH:mm');

    // 2. Prepare request data
    const requestData = {
      id: visitId.toString(),
      visit_etime: endTime,
      visit_status: visitStatus, // Default or custom status
    };

    // 3. Make API call
    const response = await fetch(
      `${clientUrl}/api/endvisitentry`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add other headers if needed (auth tokens, etc.)
        },
        body: JSON.stringify(requestData),
      },
    );

    // 4. Handle response
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.msg || 'Failed to end visit');
    }

    // 5. Check for success response
    if (result.status === 'success' && result.Code === '200') {
      console.log('Visit ended successfully:', result);
      Alert.alert('Success', result.msg || 'Visit ended successfully');
      // end visit modal close
      setEndVisitModalVisible(false);

      // 6. Refresh visits list if callback exists
      if (typeof fetchPendingVisits === 'function') {
        await fetchPendingVisits();
      }

      return result; // Return the result for further processing
    } else {
      throw new Error(result.msg || 'Unexpected response format');
        //  setEndVisitModalVisible(false);
    }
  } catch (error) {
    console.error('Error ending visit:', error);
       setEndVisitModalVisible(false);

    // 7. Show user-friendly error with retry option
    Alert.alert('Error', error.message || 'Failed to end visit', [
      {
        text: 'Try Again',
        onPress: () => handleEndVisit(visitId, visitStatus),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);

    throw error; // Re-throw for additional error handling
  }
};

  const resetForm = () => {
    setFormData({
      org_name: '',
      org_address: '',
      org_cont_prsn: '',
      org_cont: '',
      org_desig: '',
      org_email: '',
      visit_status: '',
      visit_img: '',
    });
    setImageUri(null);
    setFromTime(new Date());
    setFromDate(new Date());
  };

  const renderVisitItem = ({item}) => (
    <View style={styles.visitCard}>
      <View style={styles.visitHeader}>
        <Text style={styles.visitOrgName}>{item.org_name}</Text>
        <Text style={styles.visitDate}>
          {moment(item.visit_dt).format('DD MMM YYYY')} •{' '}
          {moment(item.visit_stime, 'HH:mm').format('hh:mm A')}
        </Text>
      </View>
      <Text style={styles.visitAddress}>{item.org_address}</Text>
      <Text style={styles.visitContact}>
        {item.org_cont_prsn} • {item.org_cont}
      </Text>
      {item.visit_img && (
        <Image
          source={{uri: item.visit_img}}
          style={styles.visitImagePreview}
          resizeMode="cover"
        />
      )}
      <Text style={styles.visitStatus}>{item.visit_status}</Text>

      <View style={styles.visitActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.endButton]}
          onPress={() => 
          {
            setEndVisitModalVisible(true);
            setSelectedVisit(item.id);
          }
             }
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={WHITE} />
          ) : (
            <Text style={styles.actionButtonText}>End Visit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <GestureHandlerRootView style={styles.flex}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <Header title="Client Visit" onBackPress={() => navigation.goBack()} />

        {/* Start New Visit Button */}
        {
          <TouchableOpacity
            disabled={visits.length > 0}
            style={{
              ...styles.startVisitButton,
              opacity: visits.length > 0 ? 0.5 : 1,
            }}
            onPress={() => setShowVisitForm(true)}>
            <Text style={styles.startVisitButtonText}>Start New Visit</Text>
          </TouchableOpacity>
        }

        {/* List of Visits */}
        {visits.length > 0 ? (
          <FlatList
            data={visits}
            renderItem={renderVisitItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.visitList}
          />
        ) : (
          <View style={styles.noVisitsContainer}>
            <Text style={styles.noVisitsText}>No pending visits found</Text>
          </View>
        )}

        {/* New Visit Form Modal */}
        <Modal
          visible={showVisitForm}
          animationType="slide"
          onRequestClose={() => setShowVisitForm(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Client Visit</Text>
              <TouchableOpacity onPress={() => setShowVisitForm(false)}>
                <Icon name="close" size={24} color={BLACK} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              keyboardShouldPersistTaps="handled">
              {/* Date and Time Picker */}
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  onPress={() => setShowFromDatePicker(true)}
                  style={styles.datePicker}>
                  <Text style={styles.dateLabel}>DATE</Text>
                  <View style={styles.datePickerContent}>
                    <Text style={styles.dateText}>
                      {moment(fromDate).format('DD MMM YYYY')}
                    </Text>
                    <Icon name="calendar-today" size={HEIGHT * 0.03} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowFromTimePicker(true)}
                  style={styles.timePicker}>
                  <Text style={styles.dateLabel}>TIME</Text>
                  <View style={styles.datePickerContent}>
                    <Text style={styles.dateText}>
                      {moment(fromTime).format('hh:mm A')}
                    </Text>
                    <Icon name="watch-later" size={HEIGHT * 0.03} />
                  </View>
                </TouchableOpacity>
              </View>

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

              {/* Phone and Email */}
              <View style={styles.sectionContainer}>
                <View style={{width: '48%'}}>
                  <Text style={styles.sectionTitle}>Phone No.*</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor="#888"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={formData.org_cont}
                    onChangeText={text => handleInputChange('org_cont', text)}
                  />
                </View>
                <View style={{width: '48%'}}>
                  <Text style={styles.sectionTitle}>Email ID</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    value={formData.org_email}
                    onChangeText={text => handleInputChange('org_email', text)}
                  />
                </View>
              </View>

              {/* Organization Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Organization Name*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Organization Name"
                  placeholderTextColor="#888"
                  value={formData.org_name}
                  onChangeText={text => handleInputChange('org_name', text)}
                />
              </View>

              {/* Address Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Address*</Text>
                <TextInput
                  style={[styles.input, {height: HEIGHT * 0.1}]}
                  placeholder="Enter Address"
                  placeholderTextColor="#888"
                  multiline
                  value={formData.org_address}
                  onChangeText={text => handleInputChange('org_address', text)}
                />
              </View>

              {/* Contact Person and Designation */}
              <View style={styles.sectionContainer}>
                <View style={{width: '48%'}}>
                  <Text style={styles.sectionTitle}>Contact Person*</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contact Person"
                    placeholderTextColor="#888"
                    value={formData.org_cont_prsn}
                    onChangeText={text =>
                      handleInputChange('org_cont_prsn', text)
                    }
                  />
                </View>
                <View style={{width: '48%'}}>
                  <Text style={styles.sectionTitle}>Designation</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Designation"
                    placeholderTextColor="#888"
                    value={formData.org_desig}
                    onChangeText={text => handleInputChange('org_desig', text)}
                  />
                </View>
              </View>

              {/* Visit Status */}
              {/* <View style={styles.section}>
                <Text style={styles.sectionTitle}>Visit Status</Text>
                <TextInput
                  style={[styles.input, {height: HEIGHT * 0.1}]}
                  placeholder="Enter visit details"
                  placeholderTextColor="#888"
                  multiline
                  value={formData.visit_status}
                  onChangeText={text => handleInputChange('visit_status', text)}
                />
              </View> */}

              {/* Location Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Location Details</Text>
                <View style={styles.locationContainer}>
                  <Text style={styles.locationText}>
                    Lat: {location.latitude || 'Not available'}
                  </Text>
                  <Text style={styles.locationText}>
                    Long: {location.longitude || 'Not available'}
                  </Text>
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={getCurrentLocation}>
                    <Icon name="refresh" size={20} color={WHITE} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Image Upload */}
              {/* <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upload Image</Text>
                <TouchableOpacity
                  style={styles.imageUploadButton}
                  onPress={selectImage}>
                  <Text style={styles.imageUploadText}>
                    {imageUri ? 'Change Image' : 'Select Image'}
                  </Text>
                </TouchableOpacity>
                {imageUri && (
                  <Image
                    source={{uri: imageUri}}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                )}
              </View> */}

              {/* Submit Button */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={selectImage}
                  disabled={loading}>
                  <LinearGradient
                    colors={['#b4000a', '#ff6347']}
                    style={styles.buttonBackground}>
                    {loading ? (
                      <ActivityIndicator color={WHITE} />
                    ) : (
                      <Text style={styles.buttonText}>Submit</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>
        {/* {end visit modal with status textinput} */}
        <Modal
          visible={endVisitModalVisible}
          onRequestClose={() => setEndVisitModalVisible(false)}
          animationType="fade"
          transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer1}>
              <Text style={styles.modalTitle1}>End Visit Confirmation</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Visit Status</Text>
                <TextInput
                  style={styles.modalInput}
                  color={BLACK}
                  multiline={true}
                  placeholder="Enter status (e.g., Completed, Rescheduled)"
                  placeholderTextColor="#999"
                  value={visitStatus}
                  onChangeText={text => setVisitStatus(text)}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEndVisitModalVisible(false)}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleEndVisit}
                  disabled={!visitStatus}>
                  <Text style={{...styles.modalButtonText, color: WHITE}}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: WHITE,
  },
  startVisitButton: {
    backgroundColor: ORANGE,
    padding: 15,
    margin: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  startVisitButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  visitCard: {
    backgroundColor: WHITE,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  visitOrgName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BLACK,
    flex: 1,
  },
  visitDate: {
    fontSize: 12,
    color: GRAY,
    marginLeft: 10,
  },
  visitAddress: {
    fontSize: 14,
    color: BLACK,
    marginBottom: 5,
  },
  visitContact: {
    fontSize: 14,
    color: GRAY,
    marginBottom: 10,
  },
  visitStatus: {
    fontSize: 14,
    color: BLACK,
    marginTop: 10,
    fontStyle: 'italic',
  },
  visitImagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    marginTop: 10,
  },
  visitActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: RED,
  },
  actionButtonText: {
    color: WHITE,
    fontWeight: 'bold',
  },
  emptyText: {
    color: GRAY,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: WHITE,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BLACK,
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    color: BLACK,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    fontSize: 14,
    color: BLACK,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  datePicker: {
    width: '48%',
  },
  timePicker: {
    width: '48%',
  },
  dateLabel: {
    color: GRAY,
    fontSize: 12,
    marginBottom: 5,
  },
  datePickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
  },
  dateText: {
    color: BLACK,
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: WHITE,
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
  },
  locationText: {
    color: BLACK,
    fontSize: 12,
  },
  refreshButton: {
    backgroundColor: ORANGE,
    borderRadius: 20,
    padding: 8,
  },
  imageUploadButton: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  imageUploadText: {
    color: BLACK,
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer1: {
    width: '100%',
    height: '60%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle1: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color:'black',
    backgroundColor: '#f9f9f9',
    
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#2e7d32', // Green color
  },
  modalButtonText: {
    color: 'gray',
    fontWeight: '600',
    fontSize: 16,
  },
  // For the submit button when disabled
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});

export default ClientVisit;
