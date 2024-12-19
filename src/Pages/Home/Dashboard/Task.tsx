import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Button,
  TextInput,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {HEIGHT, MyStatusBar, WIDTH} from '../../../constants/config';
import {BLACK, GRAY, ORANGE, RED, WHITE} from '../../../constants/color';
import Header from '../../../components/Header';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import LinearGradient from 'react-native-linear-gradient';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import moment from 'moment';
import {Icon} from 'react-native-elements';

const Tab = createMaterialTopTabNavigator();
const DATASET = [
  {
    name: 'XYZ',
    task: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    date: '25/06/2002',
    status: 'started',
  },
  {
    name: 'mmm',
    task: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    date: '25/06/2002',
    status: 'completed',
  },
  {
    name: 'lll',
    task: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    date: '25/06/2002',
    status: 'started',
  },
];

const OWN = () => {
  const [tasks, setTasks] = useState(DATASET);

  const toggleStatus = id => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id
          ? {
              ...task,
              status: task.status === 'started' ? 'completed' : 'started',
            }
          : task,
      ),
    );
  };
  return (
    <View style={styles.loginContainer}>
      <View style={{height: HEIGHT * 0.8}}>
        <FlatList
          data={DATASET}
          ListFooterComponent={<View style={{height: HEIGHT * 0.1}}></View>}
          renderItem={({item}) => (
            <View style={styles.card}>
              <Text style={{fontFamily: 'Poppins-Medium', color: BLACK}}>
                {item.name}
              </Text>
              <Text style={{fontFamily: 'Poppins-Medium', color: BLACK}}>
                {item.task}
              </Text>
              <Text style={{fontFamily: 'Poppins-Medium', color: BLACK}}>
                {item.date}
              </Text>
              <Text style={{fontFamily: 'Poppins-Medium', color: BLACK}}>
                {item.status}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  marginTop: 5,
                }}>
                <TouchableOpacity onPress={() => toggleStatus(item.id)}>
                  <LinearGradient
                    colors={
                      item.status === 'completed'
                        ? ['#ff6347', '#b4000a']
                        : ['#32CD32', '#228B22']
                    }
                    style={styles.button}>
                    <Text style={styles.buttonText}>
                      {item.status === 'started' ? 'Completed' : 'Start'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
};
const Others = () => {
  const [fromTime, setFromTime] = useState(new Date());
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);

  const [showForm, setShowForm] = useState(false); // State to control form visibility
  const [selectedValue, setSelectedValue] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState('');

  const handleAddTask = () => {
    setShowForm(true); // Show the form when the button is pressed
  };

  const [open, setOpen] = useState(false); // Controls dropdown visibility
  const [value, setValue] = useState(null); // Holds the selected value
  const [items, setItems] = useState([
    {label: 'Manager', value: 'Manager'},
    {label: 'Director', value: 'Director'},
    {label: 'Producer', value: 'Producer'},
  ]);
  const handleSubmit = () => {
    const newTask = {
      id: Date.now().toString(),
      assignTo: value,
      task: taskText,
      priority: selectedValue,
      date: moment(fromDate).format('DD/MM/YYYY'),
      time: moment(fromTime).format('hh:mm A'),
    };
    setTasks([...tasks, newTask]); // Add task to state
    setShowForm(false); // Hide the form
    setTaskText(''); // Clear the task text input
    setValue(null); // Clear the selected value
    setSelectedValue(''); // Clear the selected priority
  };

  const handleDelete = id => {
    setTasks(tasks.filter(task => task.id !== id)); // Delete task by id
  };

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        alignSelf: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
      {!showForm && ( // Render the "Apply" button only when the form is not visible
        <TouchableOpacity style={styles.button} onPress={()=>{
          handleAddTask()
        }}>
          <LinearGradient
            colors={['#b4000a', '#ff6347']}
            style={styles.othersButton}>
            <Text style={styles.buttonText}>Add Task</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {showForm && (
        <GestureHandlerRootView>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.formContainer}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Assign To</Text>
                <DropDownPicker
                  open={open}
                  value={value}
                  items={items}
                  setOpen={setOpen}
                  setValue={setValue}
                  setItems={setItems}
                  placeholder="Assign To"
                  searchContainerStyle={{borderColor: WHITE}}
                  searchable={true}
                  searchPlaceholder="Assign To"
                  searchTextInputStyle={{borderColor: WHITE}}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  textStyle={{fontSize: 14, color: '#888'}}
                  theme="DARK"
                  multiple={true}
                  mode="BADGE"
                  
                />
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Task</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Add Your Task"
                  placeholderTextColor="#999"
                  maxLength={200}
                  onChangeText={txt => {
                    setTaskText(txt);
                  }}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Priority</Text>
                <Picker
                  dropdownIconColor={BLACK}
                  style={styles.picker}
                  selectedValue={selectedValue}
                  onValueChange={(itemValue, itemIndex) =>
                    setSelectedValue(itemValue)
                  }>
                  <Picker.Item
                    label="Select an option"
                    value=""
                    enabled={false}
                  />

                  <Picker.Item label="High" value="High" />
                  <Picker.Item label="Medium" value="Medium" />
                  <Picker.Item label="Low" value="Low" />
                </Picker>
              </View>

              <View>
                <Text style={styles.sectionTitle}>Validity</Text>
              </View>
              <View
                style={{
                  width: WIDTH * 0.95,
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  // marginVertical: 5,
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
                    <Text style={styles.dateText}>
                      {fromDate.toDateString()}
                    </Text>
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

              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowForm(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </GestureHandlerRootView>
      )}
      <GestureHandlerRootView>
        <FlatList
          style={{height: HEIGHT * 0.1}}
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>Assign To: {item.assignTo}</Text>
              <Text style={styles.cardText}>Task: {item.task}</Text>
              <Text style={styles.cardText}>Priority: {item.priority}</Text>
              <Text style={styles.cardText}>Date: {item.date}</Text>
              <Text style={styles.cardText}>Time: {item.time}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </GestureHandlerRootView>
    </View>
  );
};

const TopTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Own"
      screenOptions={{
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarIndicatorStyle: {
          backgroundColor: RED,
        },
        tabBarPressOpacity: 0.1,
        tabBarPressColor: 'white',

        tabBarStyle: {
          height: HEIGHT * 0.06,
          width: WIDTH * 0.95,
          alignSelf: 'center',
          marginTop: 10,
          borderWidth: 0.2,
          borderColor: 'gray',

          // backgroundColor: 'white',
        },
      }}>
      <Tab.Screen name="OWN" component={OWN} />
      <Tab.Screen name="Others" component={Others} />
    </Tab.Navigator>
  );
};

const Task = ({navigation}) => {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Header title="Task" onBackPress={() => navigation.goBack()} />
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          scrollEnabled={false}>
          <TopTabs />
        </ScrollView>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};

export default Task;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  loginContainer: {
    flex: 1,
    width: WIDTH * 0.95,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  card: {
    width: WIDTH * 0.9,
    padding: 10,
    marginVertical: 5,
    borderLeftWidth: 5,
    borderRadius: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    width: WIDTH * 0.3,
    height: 40,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: HEIGHT * 0.01,
    marginBottom: 10,
    overflow: 'visible',
  },
  othersButton: {
    width: WIDTH * 0.9,
    height: 50,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: HEIGHT * 0.02,
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
  formContainer: {
    marginTop: 20,
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: BLACK,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    color: BLACK,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  submitButton: {
    backgroundColor: '#b4000a',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
  },
  section: {
    width: '100%',
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
  picker: {
    color: BLACK,
    backgroundColor: WHITE,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 4,
    borderColor: GRAY,
  },
  dateText: {
    color: BLACK,
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
  },
  taskItem: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  taskText: {
    fontSize: 14,
  },

  bold: {
    fontWeight: 'bold',
  },

  deleteButton: {
    marginTop: 10,
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
  },

  deleteButtonText: {
    color: '#fff',
    textAlign: 'center',
  },

  cardText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    fontFamily: 'Poppins-Medium',
  },
});
