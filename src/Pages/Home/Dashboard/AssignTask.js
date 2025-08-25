import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Header from '../../../components/Header';
import {getObjByKey} from '../../../utils/Storage';
import SQLitePlugin from 'react-native-sqlite-2';

const COLORS = {
  PRIMARY: '#4361EE',
  PRIMARY_LIGHT: '#4895EF',
  PRIMARY_DARK: '#3A0CA3',
  SECONDARY: '#7209B7',
  SECONDARY_LIGHT: '#B5179E',
  SUCCESS: '#4CC9F0',
  WARNING: '#F72585',
  DANGER: '#FB5607',
  WHITE: '#FFFFFF',
  LIGHT_GRAY: '#F8F9FA',
  MEDIUM_GRAY: '#E9ECEF',
  GRAY: '#DEE2E6',
  DARK_GRAY: '#ADB5BD',
  BLACK: '#212529',
  BACKGROUND: '#F8F9FA',
  CARD_BACKGROUND: '#FFFFFF',
  TEXT_PRIMARY: '#212529',
  TEXT_SECONDARY: '#6C757D',
  TEXT_LIGHT: '#FFFFFF',
  LIGHT_BLUE: '#E8F4FD',
  LIGHT_GREEN: '#E6F4EA',
  LIGHT_PURPLE: '#F3E8FD',
};

const AssignTask = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [clientUrl, setClientUrl] = useState('');
  const [Id, setID] = useState();
  const [Sl, setSl] = useState();
  const [userData, setUserData] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date');
  const [dateField, setDateField] = useState('');

  // Dropdown states
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryValue, setCategoryValue] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);

  const [staffOpen, setStaffOpen] = useState(false);
  const [staffValue, setStaffValue] = useState([]);
  const [staffItems, setStaffItems] = useState([]);

  const [assignedToOpen, setAssignedToOpen] = useState(false);
  const [assignedToValue, setAssignedToValue] = useState([]);
  const [assignedToItems, setAssignedToItems] = useState([]);

  const [priorityOpen, setPriorityOpen] = useState(false);
  const [priorityValue, setPriorityValue] = useState('Medium');
  const [priorityItems, setPriorityItems] = useState([
    {label: 'High', value: 'High'},
    {label: 'Medium', value: 'Medium'},
    {label: 'Low', value: 'Low'},
  ]);

  const [statusOpen, setStatusOpen] = useState(false);
  const [statusValue, setStatusValue] = useState('Open');
  const [statusItems, setStatusItems] = useState([
    {label: 'Open', value: 'Open'},
    {label: 'In Progress', value: 'In Progress'},
    {label: 'Completed', value: 'Completed'},
  ]);

  const [formData, setFormData] = useState({
    Title: '',
    Description: '',
    CategoryId: '',
    Priority: 'Medium',
    Status: 'Open',
    DueDate: '',
    EstimatedHours: '',
    AssignedTo: [],
  });

  // Format date as YYYY-MM-DD
  const formatDate = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
          error => {
            console.error('Error fetching client_url:', error);
            reject(error);
          },
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
        setUserData(value[0]);
        return value[0]?.staf_sl;
      }
    } catch (e) {
      console.error('Error retrieving details:', e);
      throw e;
    }
  };

  // Fetch categories from API
  const fetchCategories = async baseUrl => {
    try {
      const response = await fetch(`${baseUrl}/api/GetTaskCategory`, {
        method: 'GET',
        headers: {
          'Content-Type': 'text/plain',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' && result.Code === '200') {
        const categoryOptions = result.data_value.map(category => ({
          label: category.CategoryName,
          value: category.CategoryID.toString(),
        }));
        setCategoryItems(categoryOptions);
        return categoryOptions;
      } else {
        throw new Error(result.msg || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      const defaultCategories = [
        {label: 'Sales', value: '1'},
        {label: 'HR', value: '2'},
        {label: 'Client Visit', value: '3'},
      ];
      setCategoryItems(defaultCategories);
      return defaultCategories;
    }
  };

  // Fetch staff members from API
  const fetchStaffMembers = async (baseUrl, loc_cd) => {
    try {
      const response = await fetch(`${baseUrl}/api/locationstaf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loc_cd: loc_cd || 1,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' && result.Code === '200') {
        const staffOptions = result.data_value.map(staff => ({
          label: staff.staf_nm,
          value: staff.staf_sl.toString(),
        }));
        setStaffItems(staffOptions);
        return staffOptions;
      } else {
        throw new Error(result.msg || 'Failed to fetch staff members');
      }
    } catch (error) {
      console.error('Error fetching staff members:', error);
      const defaultStaff = [
        {label: 'Paraswar Panda', value: '1'},
        {label: 'Sadhu Charan Jena', value: '2'},
        {label: 'Saroj Kumar Satpathy', value: '3'},
        {label: 'Harsha Kumar Mishra', value: '4'},
        {label: 'Sumanta Kumar Mallick', value: '5'},
        {label: 'Rinki Das', value: '6'},
      ];
      setStaffItems(defaultStaff);
      return defaultStaff;
    }
  };

  const fetchTasksFromAPI = async (staffSl, baseUrl) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/GetTaskbyme?staf_sl=${staffSl}`,
        {
          method: 'GET',
          redirect: 'follow',
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success' && result.Code === '200') {
        return result.data_value.map(task => {
          const normalizeStatus = status => {
            switch (status) {
              case 'Start':
              case 'Not Started':
                return 'Start';
              case 'Resume':
                return 'Resume';
              case 'Pause':
                return 'Pause';
              case 'Complete':
                return 'Complete';
              default:
                return 'Start';
            }
          };

          return {
            id: task.TaskID,
            title: task.Title,
            description: task.Description,
            dueDate: task.DueDate
              ? new Date(task.DueDate).toLocaleDateString()
              : 'No due date',
            status: normalizeStatus(task.Status),
            priority: task.Priority || 'Medium',
            progress: 0,
            timeline: task.logs_details
              ? task.logs_details.map(log => ({
                  date: new Date(log.ActionTime).toLocaleDateString(),
                  detail: log.comments,
                  user: log.staf_nm,
                  ActionTime: log.ActionTime,
                  comments: log.comments,
                  staf_nm: log.staf_nm,
                  ActionType: log.ActionType,
                }))
              : [],
            comments: task.comments_details || [],
            attachments: task.attachment_details || [],
            category: task.CategoryName,
            estimatedHours: task.EstimatedHours,
            actualHours: task.ActualHours,
          };
        });
      } else {
        throw new Error(result.msg || 'Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  };

  const loadTasks = async () => {
    setRefreshing(true);
    try {
      const staffSl = await RetrieveDetails();
      const baseUrl = await fetchClientUrlFromSQLite();

      if (staffSl && baseUrl) {
        const tasksData = await fetchTasksFromAPI(staffSl, baseUrl);
        setTasks(tasksData);

        // Load categories and staff members
        await fetchCategories(baseUrl);
        await fetchStaffMembers(baseUrl, Id);
      } else {
        console.error('Missing staffSl or baseUrl');
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const openModal = (type, task) => {
    setModalType(type);
    setSelectedTask(task);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedTask(null);
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (dateField === 'DueDate') {
        setFormData({
          ...formData,
          DueDate: formatDate(selectedDate),
        });
      }
    }
  };

  const openDatePicker = field => {
    setDateField(field);
    setShowDatePicker(true);
  };

  const submitTask = async () => {
    if (
      !formData.Title ||
      !formData.Description ||
      !categoryValue ||
      staffValue.length === 0
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const staffSl = await RetrieveDetails();
      if (!staffSl) {
        throw new Error('Could not retrieve user information');
      }

      const requestData = {
        Title: formData.Title,
        Description: formData.Description,
        CategoryId: parseInt(categoryValue, 10),
        Priority: priorityValue,
        Status: statusValue,
        AssignedTo: staffValue.map(id => parseInt(id, 10)),
        AssignedBy: parseInt(staffSl, 10),
        DueDate: formData.DueDate || new Date().toISOString().split('T')[0],
        EstimatedHours: formData.EstimatedHours || 0,
      };

      const response = await fetch(`${clientUrl}/api/taskentry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        Alert.alert('Success', 'Task created successfully');
        setShowCreateForm(false);
        setFormData({
          Title: '',
          Description: '',
          CategoryId: '',
          Priority: 'Medium',
          Status: 'Open',
          DueDate: '',
          EstimatedHours: '',
          AssignedTo: [],
        });
        setCategoryValue(null);
        setStaffValue([]);
        setPriorityValue('Medium');
        setStatusValue('Open');
        loadTasks();
      } else {
        throw new Error(result.msg || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', error.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  // Get status color based on task status
  const getStatusColor = status => {
    switch (status) {
      case 'Start':
        return COLORS.WARNING;
      case 'Resume':
        return COLORS.PRIMARY;
      case 'Pause':
        return COLORS.DANGER;
      case 'Complete':
        return COLORS.SUCCESS;
      default:
        return COLORS.SECONDARY;
    }
  };

  // Get priority color based on priority level
  const getPriorityColor = priority => {
    switch (priority) {
      case 'High':
        return COLORS.DANGER;
      case 'Medium':
        return COLORS.WARNING;
      case 'Low':
        return COLORS.SUCCESS;
      default:
        return COLORS.SECONDARY;
    }
  };

  const renderTaskItem = ({item}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openModal('details', item)}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor(item.status)},
            ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => openModal('log', item)}>
            <Icon name="clock-outline" size={20} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category and Priority */}
      <View style={styles.metaContainer}>
        <View style={styles.priorityContainer}>
          <View
            style={[
              styles.priorityDot,
              {backgroundColor: getPriorityColor(item.priority)},
            ]}
          />
          <Text style={styles.priorityText}>{item.priority} Priority</Text>
        </View>
        {item.category && (
          <View style={styles.categoryContainer}>
            <Icon name="tag-outline" size={14} color={COLORS.SECONDARY} />
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
      </View>

      {/* Card Body */}
      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.dueDateContainer}>
        <Icon name="calendar-clock" size={16} color={COLORS.SECONDARY} />
        <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
      </View>

      {/* Hours Information */}
      {(item.estimatedHours || item.actualHours) && (
        <View style={styles.hoursContainer}>
          {item.estimatedHours && (
            <View style={styles.hoursItem}>
              <Icon name="clock-outline" size={14} color={COLORS.PRIMARY} />
              <Text style={styles.hoursText}>Est: {item.estimatedHours}h</Text>
            </View>
          )}
          {item.actualHours && (
            <View style={styles.hoursItem}>
              <Icon name="clock-check" size={14} color={COLORS.SUCCESS} />
              <Text style={styles.hoursText}>Actual: {item.actualHours}h</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderCreateForm = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>Create New Task</Text>

      <TextInput
        style={styles.input}
        placeholderTextColor={COLORS.TEXT_SECONDARY}
        placeholder="Task Title *"
        value={formData.Title}
        onChangeText={text => handleInputChange('Title', text)}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description *"
        placeholderTextColor={COLORS.TEXT_SECONDARY}
        multiline
        numberOfLines={4}
        value={formData.Description}
        onChangeText={text => handleInputChange('Description', text)}
      />

      <Text style={styles.dropdownLabel}>Category *</Text>
      <DropDownPicker
        open={categoryOpen}
        value={categoryValue}
        items={categoryItems}
        setOpen={setCategoryOpen}
        setValue={setCategoryValue}
        setItems={setCategoryItems}
        placeholder="Select a category"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownList}
        zIndex={3000}
        zIndexInverse={1000}
      />

      <Text style={styles.dropdownLabel}>Assign To *</Text>
      <DropDownPicker
        searchable={true}
        open={staffOpen}
        value={staffValue}
        items={staffItems}
        setOpen={setStaffOpen}
        setValue={setStaffValue}
        setItems={setStaffItems}
        multiple={true}
        min={1}
        mode="BADGE"
        placeholder="Select staff members"
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownList}
        zIndex={2000}
        zIndexInverse={2000}
      />

      <Text style={styles.dropdownLabel}>Priority</Text>
      <DropDownPicker
        open={priorityOpen}
        value={priorityValue}
        items={priorityItems}
        setOpen={setPriorityOpen}
        setValue={setPriorityValue}
        setItems={setPriorityItems}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownList}
        zIndex={1500}
        zIndexInverse={2500}
      />


      <Text style={styles.dropdownLabel}>Due Date</Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => openDatePicker('DueDate')}>
        <Text style={styles.dateInputText}>
          {formData.DueDate || 'Select due date'}
        </Text>
        <Icon name="calendar" size={20} color={COLORS.TEXT_SECONDARY} />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholderTextColor={COLORS.TEXT_SECONDARY}
        placeholder="Estimated Hours"
        keyboardType="numeric"
        value={formData.EstimatedHours}
        onChangeText={text => handleInputChange('EstimatedHours', text)}
      />

      <View style={styles.formButtons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => setShowCreateForm(false)}>
          <Text style={[styles.buttonText, {color: COLORS.DANGER}]}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={submitTask}
          disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color={COLORS.WHITE} />
          ) : (
            <Text style={styles.buttonText}>Create Task</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderTaskList = () => (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Assigned Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateForm(true)}>
          <Icon name="plus" size={24} color={COLORS.WHITE} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id.toString()}
        refreshing={refreshing}
        onRefresh={loadTasks}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon
              name="clipboard-list-outline"
              size={60}
              color={COLORS.LIGHT_GRAY}
            />
            <Text style={styles.emptyText}>No tasks assigned yet</Text>
            <Text style={styles.emptySubtext}>
              Create a new task or check back later
            </Text>
          </View>
        }
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Header title="Assign Task" onBackPress={() => navigation.goBack()} />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Loading your tasks...</Text>
          </View>
        ) : showCreateForm ? (
          renderCreateForm()
        ) : (
          renderTaskList()
        )}
      </KeyboardAvoidingView>

      {/* Task Details Modal */}
      <Modal visible={!!modalType} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTask?.title}</Text>
              <TouchableOpacity style={styles.closeIcon} onPress={closeModal}>
                <Icon name="close" size={24} color={COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}>
              {selectedTask && (
                <>
                  <Text style={styles.modalSectionTitle}>Description</Text>
                  <Text style={styles.modalText}>
                    {selectedTask.description}
                  </Text>

                  <View style={styles.modalDetails}>
                    <View style={styles.detailRow}>
                      <Icon name="calendar" size={18} color={COLORS.PRIMARY} />
                      <Text style={styles.detailText}>
                        Due: {selectedTask.dueDate}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Icon
                        name="clock-outline"
                        size={18}
                        color={COLORS.PRIMARY}
                      />
                      <Text style={styles.detailText}>
                        Estimated: {selectedTask.estimatedHours} hours
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Icon name="flag" size={18} color={COLORS.PRIMARY} />
                      <Text style={styles.detailText}>
                        Priority: {selectedTask.priority}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Icon
                        name="progress-check"
                        size={18}
                        color={COLORS.PRIMARY}
                      />
                      <Text style={styles.detailText}>
                        Status: {selectedTask.status}
                      </Text>
                    </View>
                  </View>

                  {selectedTask.timeline &&
                    selectedTask.timeline.length > 0 && (
                      <>
                        <Text style={styles.modalSectionTitle}>Timeline</Text>
                        {selectedTask.timeline.map((event, index) => (
                          <View key={index} style={styles.timelineItem}>
                            <View style={styles.timelineDot} />
                            <View style={styles.timelineContent}>
                              <Text style={styles.timelineDate}>
                                {event.date}
                              </Text>
                              <Text style={styles.timelineText}>
                                {event.detail}
                              </Text>
                              <Text style={styles.timelineUser}>
                                - {event.user}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </>
                    )}
                </>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showDatePicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}>
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={
                  formData.DueDate ? new Date(formData.DueDate) : new Date()
                }
                mode={datePickerMode}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.datePickerDoneButton}
                  onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerDoneText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  addButton: {
    backgroundColor: COLORS.PRIMARY,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },

  // Card Styles (matching the Task component)
  card: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: COLORS.BLACK,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
    position: 'relative',
  },

  // Meta information
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '500',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.SECONDARY,
    marginLeft: 4,
  },

  // Card body
  description: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 12,
    lineHeight: 20,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dueDate: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 6,
  },
  hoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  hoursItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hoursText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },

  // Form Styles
  formContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.BACKGROUND,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    color: COLORS.BLACK,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderColor: COLORS.GRAY,
    borderRadius: 8,
    marginBottom: 16,
  },
  dropdownList: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderColor: COLORS.GRAY,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.GRAY,
  },
  dateInputText: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 26,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    paddingBottom: 15,
    marginBottom: 15,
    padding: 16,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    paddingRight: 30,
  },
  closeIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    marginLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.PRIMARY,
    marginRight: 12,
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  timelineUser: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.TEXT_SECONDARY,
  },
  closeBtn: {
    backgroundColor: COLORS.PRIMARY,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    margin: 16,
  },
  closeText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },

  // Date Picker
  datePickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContainer: {
    backgroundColor: COLORS.WHITE,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  datePickerDoneButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.MEDIUM_GRAY,
  },
  datePickerDoneText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AssignTask;
