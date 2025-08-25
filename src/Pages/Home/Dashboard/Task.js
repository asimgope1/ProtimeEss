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
import Header from '../../../components/Header';
import { getObjByKey } from '../../../utils/Storage';
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
const VerticalTimeline = ({timeline}) => {
  return (
    <View style={styles.timelineContainer}>
      <Text style={styles.modalSectionTitle}>Timeline</Text>
      {timeline.map((item, index) => {
        // Handle both API format and UI-generated format
        const date = item.ActionTime 
          ? new Date(item.ActionTime).toLocaleDateString() 
          : item.date;
        const detail = item.comments || item.detail;
        const user = item.staf_nm || item.user;

        return (
          <View key={index} style={styles.timelineItem}>
            {/* Timeline connector line */}
            {index < timeline.length - 1 && (
              <View style={styles.timelineConnector} />
            )}

            {/* Timeline icon */}
            <View
              style={[
                styles.timelineIconContainer,
                index === 0 && styles.timelineFirstIcon,
                index === timeline.length - 1 && styles.timelineLastIcon,
              ]}>
              <Icon
                name={index === 0 ? 'flag-variant' : 'circle'}
                size={16}
                color={index === 0 ? COLORS.SUCCESS : COLORS.PRIMARY}
              />
            </View>

            {/* Timeline content */}
            <View style={styles.timelineContent}>
              <Text style={styles.timelineDate}>{date}</Text>
              <Text style={styles.timelineDetail}>{detail}</Text>
              <Text style={styles.timelineUser}>By: {user}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const Task = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [clientUrl, setClientUrl] = useState('');
  const [Id, setID] = useState();
  const [Sl, setSl] = useState();
  const [userData, setUserData] = useState(null);

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
        console.log('value', value);
        setID(value[0]?.loc_cd);
        setSl(value[0]?.staf_sl);
        setUserData(value[0]); // Store user data for comment submission
        return value[0]?.staf_sl;
      }
    } catch (e) {
      console.error('Error retrieving details:', e);
      throw e;
    }
  };

const fetchTasksFromAPI = async (staffSl, baseUrl) => {
  try {
    const response = await fetch(
      `${baseUrl}/api/GetTaskData?staf_sl=${staffSl}`,
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
        // Normalize status values from API
        const normalizeStatus = status => {
          switch (status) {
            case 'Start':
            case 'Not Started':
              return 'Start'; // Unified as 'Start' for not started
            case 'Resume':
              return 'Resume'; // In Progress
            case 'Pause':
              return 'Pause'; // Paused
            case 'Complete':
              return 'Complete'; // Completed
            default:
              return 'Start'; // Default to not started
          }
        };

        return {
          id: task.TaskID,
          title: task.Title,
          description: task.Description,
          dueDate: task.DueDate
            ? new Date(task.DueDate).toLocaleDateString()
            : 'No due date',
          status: normalizeStatus(task.Status), // Use normalized status
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
        console.log('test', staffSl, baseUrl);
        const tasksData = await fetchTasksFromAPI(staffSl, baseUrl);
        setTasks(tasksData);
      } else {
        console.error('Missing staffSl or baseUrl');
        // Fallback to mock data if API fails
        setTasks(getMockTasks());
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Fallback to mock data if API fails
      setTasks(getMockTasks());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mock data fallback
  const getMockTasks = () => {
    return [
      {
        id: 1,
        title: 'Design Dashboard',
        description:
          'Create UI for admin dashboard with modern components and smooth animations',
        dueDate: '2025-08-25',
        status: 'Pending',
        priority: 'High',
        progress: 0,
        timeline: [
          {
            date: '2025-08-15',
            detail: 'Task Created',
            user: 'Project Manager',
          },
          {date: '2025-08-16', detail: 'Assigned to you', user: 'Team Lead'},
        ],
        comments: [
          {
            user: 'John Doe',
            comment: 'Please check the latest design guidelines',
            time: '2 hours ago',
          },
        ],
        attachments: [{name: 'design_reference.pdf', size: '2.4 MB'}],
      },
    ];
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const openModal = (type, task) => {
    setModalType(type);
    setSelectedTask(task);
    setNewComment('');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedTask(null);
    setNewComment('');
  };

  //   taskId,
  //   newStatus,
  //   progress,
  //   comments = '',
  // ) => {
  //   try {
  //     // First update the UI optimistically
  //     setTasks(prevTasks =>
  //       prevTasks.map(task =>
  //         task.id === taskId
  //           ? {
  //               ...task,
  //               status: newStatus,
  //               progress: progress,
  //               timeline: [
  //                 ...task.timeline,
  //                 {
  //                   date: new Date().toISOString().split('T')[0],
  //                   detail: `Status changed to ${newStatus}`,
  //                   user: 'You',
  //                 },
  //               ],
  //             }
  //           : task,
  //       ),
  //     );

  //     // Determine the action type based on status
  //     let actionType;
  //     switch (newStatus) {
  //       case 'In Progress':
  //         actionType = 'Start';
  //         break;
  //       case 'Paused':
  //         actionType = 'Pause';
  //         break;
  //       case 'Completed':
  //         actionType = 'Complete';
  //         break;
  //       default:
  //         actionType = 'Start';
  //     }

  //     // Make API call
  //     const myHeaders = new Headers();
  //     myHeaders.append('Content-Type', 'application/json');

  //     const raw = JSON.stringify({
  //       TaskID: taskId,
  //       staf_sl: Sl,
  //       comments: comments || `${actionType} task ${taskId}`,
  //       ActionType: actionType,
  //       Date: new Date().toISOString(),
  //     });

  //     const requestOptions = {
  //       method: 'POST',
  //       headers: myHeaders,
  //       body: raw,
  //       redirect: 'follow',
  //     };

  //     const response = await fetch(
  //       `${clientUrl}api/updatetask`,
  //       requestOptions,
  //     );
  //     const result = await response.text();

  //     console.log('API Response:', result);

  //     // If you need to handle the API response data, you can do it here
  //     // For example, if the API returns updated task data, you might want to sync it

  //     return result;
  //   } catch (error) {
  //     console.log('API Error:', error);

  //     // Optional: Revert the UI change if the API call fails
  //     // You might want to implement a rollback mechanism here

  //     throw error;
  //   }
  // };

  // UI Handlers with API integration
  // UI Handlers with API integration
const handleStartTask = async taskId => {
  try {
    await updateTaskStatus(
      taskId,
      'Resume', // This maps to 'Start' action in API
      50,
      'Started working on the task',
    );
  } catch (error) {
    console.error('Failed to start task:', error);
  }
};

const handlePauseTask = async taskId => {
  try {
    await updateTaskStatus(
      taskId,
      'Pause', // This maps to 'Pause' action in API
      50,
      'Paused the task',
    );
  } catch (error) {
    console.error('Failed to pause task:', error);
  }
};

const handleResumeTask = async taskId => {
  try {
    await updateTaskStatus(
      taskId,
      'Resume', // This maps to 'Start' action in API
      50,
      'Resumed the task',
    );
  } catch (error) {
    console.error('Failed to resume task:', error);
  }
};

const handleCompleteTask = async taskId => {
  try {
    await updateTaskStatus(
      taskId,
      'Complete', // This maps to 'Complete' action in API
      100,
      'Completed the task',
    );
  } catch (error) {
    console.error('Failed to complete task:', error);
  }
};


  const updateTaskStatus = async (
    taskId,
    newStatus,
    progress,
    comments = '',
  ) => {
    try {
      // Determine the action type based on UI status
      let actionType;
      switch (newStatus) {
        case 'Resume': // In Progress
          actionType = 'Start';
          break;
        case 'Pause': // Paused
          actionType = 'Pause';
          break;
        case 'Complete': // Completed
          actionType = 'Complete';
          break;
        case 'Start': // Not Started - should not happen but handle it
          actionType = 'Start';
          break;
        default:
          actionType = 'Start';
      }

      // Make API call
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const raw = JSON.stringify({
        TaskID: taskId,
        staf_sl: Sl,
        comments: comments || `${actionType} task ${taskId}`,
        ActionType: actionType,
        Date: new Date().toISOString(),
      });

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      console.log('Sending API request:', raw);

      const response = await fetch(
        `${clientUrl}api/updatetask`,
        requestOptions,
      );
      const result = await response.json();

      console.log('API Response:', result);

      // Only update UI if API call was successful
      if (result.status === 'success' || result.Code === '200') {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId
              ? {
                  ...task,
                  status: newStatus,
                  progress: progress,
                  timeline: [
                    ...task.timeline,
                    {
                      date: new Date().toISOString().split('T')[0],
                      detail: comments || `Status changed to ${newStatus}`,
                      user: 'You',
                      ActionType: actionType,
                      ActionTime: new Date().toISOString(),
                    },
                  ],
                }
              : task,
          ),
        );
        Alert.alert('Success', 'Task status updated successfully');
      } else {
        throw new Error(result.msg || 'API call failed');
      }

      return result;
    } catch (error) {
      console.log('API Error:', error);
      Alert.alert('Error', 'Failed to update task status: ' + error.message);
      throw error;
    }
  };

  // Fixed getActionButtons function
  const getActionButtons = task => {
    console.log('Task status for buttons:', task.status);

    switch (task.status) {
      case 'Start': // Not Started
        return (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, styles.startBtn]}
              onPress={() => handleStartTask(task.id)}>
              <Icon name="play" size={16} color={COLORS.WHITE} />
              <Text style={styles.btnText}>Start</Text>
            </TouchableOpacity>
            <View style={[styles.actionBtn, styles.disabledBtn]}>
              <Icon name="pause" size={16} color={COLORS.DARK_GRAY} />
              <Text style={[styles.btnText, {color: COLORS.DARK_GRAY}]}>
                Pause
              </Text>
            </View>
            <View style={[styles.actionBtn, styles.disabledBtn]}>
              <Icon name="play-circle" size={16} color={COLORS.DARK_GRAY} />
              <Text style={[styles.btnText, {color: COLORS.DARK_GRAY}]}>
                Resume
              </Text>
            </View>
            <View style={[styles.actionBtn, styles.disabledBtn]}>
              <Icon name="check-circle" size={16} color={COLORS.DARK_GRAY} />
              <Text style={[styles.btnText, {color: COLORS.DARK_GRAY}]}>
                Complete
              </Text>
            </View>
          </>
        );

      case 'Resume': // In Progress
        return (
          <>
            <View style={[styles.actionBtn, styles.disabledBtn]}>
              <Icon name="play" size={16} color={COLORS.DARK_GRAY} />
              <Text style={[styles.btnText, {color: COLORS.DARK_GRAY}]}>
                Start
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.actionBtn, styles.pauseBtn]}
              onPress={() => handlePauseTask(task.id)}>
              <Icon name="pause" size={16} color={COLORS.WHITE} />
              <Text style={styles.btnText}>Pause</Text>
            </TouchableOpacity>
            <View style={[styles.actionBtn, styles.disabledBtn]}>
              <Icon name="play-circle" size={16} color={COLORS.DARK_GRAY} />
              <Text style={[styles.btnText, {color: COLORS.DARK_GRAY}]}>
                Resume
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.actionBtn, styles.completeBtn]}
              onPress={() => handleCompleteTask(task.id)}>
              <Icon name="check-circle" size={16} color={COLORS.WHITE} />
              <Text style={styles.btnText}>Complete</Text>
            </TouchableOpacity>
          </>
        );

      case 'Pause': // Paused
        return (
          <>
            <View style={[styles.actionBtn, styles.disabledBtn]}>
              <Icon name="play" size={16} color={COLORS.DARK_GRAY} />
              <Text style={[styles.btnText, {color: COLORS.DARK_GRAY}]}>
                Start
              </Text>
            </View>
            <View style={[styles.actionBtn, styles.disabledBtn]}>
              <Icon name="pause" size={16} color={COLORS.DARK_GRAY} />
              <Text style={[styles.btnText, {color: COLORS.DARK_GRAY}]}>
                Pause
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.actionBtn, styles.resumeBtn]}
              onPress={() => handleResumeTask(task.id)}>
              <Icon name="play-circle" size={16} color={COLORS.WHITE} />
              <Text style={styles.btnText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.completeBtn]}
              onPress={() => handleCompleteTask(task.id)}>
              <Icon name="check-circle" size={16} color={COLORS.WHITE} />
              <Text style={styles.btnText}>Complete</Text>
            </TouchableOpacity>
          </>
        );

      case 'Complete': // Completed
        return (
          <>
            <View style={[styles.actionBtn, styles.disabledBtn]}>
              <Icon name="play" size={16} color={COLORS.DARK_GRAY} />
              <Text style={[styles.btnText, {color: COLORS.DARK_GRAY}]}>
                Start
              </Text>
            </View>
            <View style={[styles.actionBtn, styles.disabledBtn]}>
              <Icon name="pause" size={16} color={COLORS.DARK_GRAY} />
              <Text style={[styles.btnText, {color: COLORS.DARK_GRAY}]}>
                Pause
              </Text>
            </View>
            <View style={[styles.actionBtn, styles.disabledBtn]}>
              <Icon name="play-circle" size={16} color={COLORS.DARK_GRAY} />
              <Text style={[styles.btnText, {color: COLORS.DARK_GRAY}]}>
                Resume
              </Text>
            </View>
            <View style={[styles.actionBtn, styles.disabledBtn]}>
              <Icon name="check-circle" size={16} color={COLORS.DARK_GRAY} />
              <Text style={[styles.btnText, {color: COLORS.DARK_GRAY}]}>
                Complete
              </Text>
            </View>
          </>
        );

      default:
        console.warn('Unknown task status:', task.status);
        return null;
    }
  };

  // Fixed getStatusColor function to use API status values
  const getStatusColor = status => {
    switch (status) {
      case 'Start': // Not Started
        return COLORS.WARNING;
      case 'Resume': // In Progress
        return COLORS.PRIMARY;
      case 'Pause': // Paused
        return COLORS.DANGER;
      case 'Complete': // Completed
        return COLORS.SUCCESS;
      default:
        return COLORS.SECONDARY;
    }
  };

  // Fixed getStatusText function for display
  const getStatusText = status => {
    switch (status) {
      case 'Start':
        return 'Not Started';
      case 'Resume':
        return 'In Progress';
      case 'Pause':
        return 'Paused';
      case 'Complete':
        return 'Completed';
      default:
        return status;
    }
  };
  const addComment = async () => {
    if (!newComment.trim() || !selectedTask || !userData) return;

    try {
      // Prepare the request
      const myHeaders = new Headers();
      myHeaders.append('Content-Type', 'application/json');

      const raw = JSON.stringify({
        TaskID: selectedTask.id,
        CommentBy: userData.staf_sl, // Using staff SL from user data
        Comment: newComment.trim(),
      });

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      };

      // Make the API call
      const response = await fetch(
        `${clientUrl}api/addtaskcomments`,
        requestOptions,
      );
      const result = await response.json();

      if (result.status === 'success') {
        // Update local state immediately for better UX
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === selectedTask.id
              ? {
                  ...task,
                  comments: [
                    ...task.comments,
                    {
                      user: userData.staf_nm || 'You',
                      comment: newComment.trim(),
                      time: 'Just now',
                    },
                  ],
                }
              : task,
          ),
        );

        setNewComment('');
        Alert.alert('Success', 'Comment added successfully');
      } else {
        throw new Error(result.msg || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
  };



  const getPriorityColor = priority => {
    switch (priority) {
      case 'Critical':
        return COLORS.DANGER;
      case 'High':
        return '#e74c3c';
      case 'Medium':
        return COLORS.WARNING;
      case 'Low':
        return COLORS.SUCCESS;
      default:
        return COLORS.SECONDARY;
    }
  };

  const renderTask = ({item}) => (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor(item.status)},
            ]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => openModal('log', item)}>
            <Icon name="clock-outline" size={20} color={COLORS.PRIMARY} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => openModal('comment', item)}>
            <Icon
              name="comment-text-outline"
              size={20}
              color={COLORS.SUCCESS}
            />
            {item.comments.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.comments.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => openModal('attachment', item)}>
            <Icon name="paperclip" size={20} color={COLORS.WARNING} />
            {item.attachments.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.attachments.length}</Text>
              </View>
            )}
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

      {/* Progress Bar */}
      {/* <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${item.progress}%`}]} />
        </View>
        <Text style={styles.progressText}>{item.progress}% Complete</Text>
      </View> */}

      {/* Action Buttons */}
      <View style={styles.actionRow}>{getActionButtons(item)}</View>
    </View>
  );

  const renderModalContent = () => {
    switch (modalType) {
      case 'log':
        return <VerticalTimeline timeline={selectedTask?.timeline || []} />;
      case 'comment':
        return (
          <>
            <Text style={styles.modalSectionTitle}>Comments</Text>
            <ScrollView style={styles.commentsContainer}>
              {selectedTask?.comments?.length > 0 ? (
                selectedTask.comments.map((c, i) => (
                  <View key={i} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUser}>{c.staf_nm}</Text>
                      <Text style={styles.commentTime}>
                        {new Date(c.CreatedAt).toLocaleString()}
                      </Text>
                    </View>
                    <Text style={styles.commentText}>{c.Comment}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyState}>No comments yet</Text>
              )}
            </ScrollView>

            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholderTextColor={COLORS.SECONDARY}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.addCommentBtn,
                  !newComment.trim() && styles.disabledButton,
                ]}
                onPress={addComment}
                disabled={!newComment.trim()}>
                <Icon name="send" size={16} color={COLORS.WHITE} />
              </TouchableOpacity>
            </View>
          </>
        );
      default:
        return null;
    }
  };

  const handleRefresh = () => {
    loadTasks();
  };
  console.log('selectedTask', selectedTask);

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
        <Header title="My Tasks" onBackPress={() => navigation.goBack()} />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Loading your tasks...</Text>
          </View>
        ) : (
          <FlatList
            data={tasks}
            renderItem={renderTask}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon
                  name="check-circle-outline"
                  size={60}
                  color={COLORS.LIGHT_GRAY}
                />
                <Text style={styles.emptyText}>No tasks assigned</Text>
                <Text style={styles.emptySubtext}>You're all caught up!</Text>
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>

      {/* Modal */}
      <Modal visible={!!modalType} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTask?.title}</Text>
              <Text style={styles.modalSubtitle}>
                {/* {modalType?.charAt(0).toUpperCase() + modalType?.slice(1)} */}
              </Text>
              <TouchableOpacity style={styles.closeIcon} onPress={closeModal}>
                <Icon name="close" size={24} color={COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}>
              {renderModalContent()}
            </ScrollView>

            <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};




const styles = StyleSheet.create({
  flex: {flex: 1},
  container: {flex: 1, backgroundColor: COLORS.BACKGROUND},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.SECONDARY,
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },

  // Card
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
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.DANGER,
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Priority
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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

  // Progress
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'right',
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  disabledBtn: {
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  startBtn: {
    backgroundColor: COLORS.SUCCESS,
  },
  pauseBtn: {
    backgroundColor: COLORS.WARNING,
  },
  resumeBtn: {
    backgroundColor: COLORS.PRIMARY,
  },
  completeBtn: {
    backgroundColor: '#28a745',
  },
  btnText: {
    color: COLORS.WHITE,
    fontWeight: '600',
    fontSize: 12,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: COLORS.WHITE,
    width: '90%',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    paddingBottom: 15,
    marginBottom: 15,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    paddingRight: 30,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  closeIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 4,
  },
  modalContent: {
    // flex: 1,
    marginBottom: 15,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },

  // Timeline
  timelineContainer: {
    marginBottom: 15,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },
  timelineConnector: {
    position: 'absolute',
    left: 11,
    top: 24,
    bottom: -16,
    width: 2,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    zIndex: 0,
  },
  timelineIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    zIndex: 1,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY_LIGHT,
  },
  timelineFirstIcon: {
    backgroundColor: COLORS.LIGHT_GREEN,
    borderColor: COLORS.SUCCESS,
  },
  timelineLastIcon: {
    borderColor: COLORS.PRIMARY,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 8,
  },
  timelineDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  timelineDetail: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
  },
  timelineUser: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
  },

  // Comments
  commentsContainer: {
    maxHeight: 200,
    marginBottom: 15,
  },
  commentItem: {
    backgroundColor: COLORS.LIGHT_BLUE,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  commentTime: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  commentText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    color: COLORS.BLACK,
    borderWidth: 1,
    borderColor: COLORS.BLACK,
    borderRadius: 6,
    padding: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  addCommentBtn: {
    backgroundColor: COLORS.PRIMARY,
    padding: 10,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: COLORS.DARK_GRAY,
  },

  // Attachments
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    marginBottom: 10,
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  attachmentName: {
    fontSize: 14,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  downloadBtn: {
    padding: 4,
  },
  addAttachmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.PRIMARY,
    padding: 12,
    borderRadius: 6,
    gap: 6,
    marginTop: 10,
  },
  addAttachmentText: {
    color: COLORS.WHITE,
    fontWeight: '600',
  },

  // Empty states
  emptyState: {
    textAlign: 'center',
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
    marginVertical: 20,
  },
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
    color: COLORS.LIGHT_GRAY,
  },

  closeBtn: {
    backgroundColor: COLORS.PRIMARY,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
   metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
});

export default Task;
