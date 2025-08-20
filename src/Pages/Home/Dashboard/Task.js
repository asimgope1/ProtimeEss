import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../components/Header';

// Complete Color Palette Definition
const COLORS = {
  // Primary Colors
  PRIMARY: '#4361EE', // Vibrant blue for primary actions
  PRIMARY_LIGHT: '#4895EF', // Lighter blue for highlights
  PRIMARY_DARK: '#3A0CA3', // Dark blue for contrasts

  // Secondary Colors
  SECONDARY: '#7209B7', // Purple for secondary elements
  SECONDARY_LIGHT: '#B5179E', // Pink for accents

  // Status Colors
  SUCCESS: '#4CC9F0', // Teal for positive actions
  WARNING: '#F72585', // Magenta for warnings
  DANGER: '#FB5607', // Orange for errors/destructive actions

  // Neutral Colors
  WHITE: '#FFFFFF',
  LIGHT_GRAY: '#F8F9FA',
  MEDIUM_GRAY: '#E9ECEF',
  GRAY: '#DEE2E6',
  DARK_GRAY: '#ADB5BD',
  BLACK: '#212529',

  // Background Colors
  BACKGROUND: '#F8F9FA',
  CARD_BACKGROUND: '#FFFFFF',

  // Text Colors
  TEXT_PRIMARY: '#212529',
  TEXT_SECONDARY: '#6C757D',
  TEXT_LIGHT: '#FFFFFF',

  // Additional Colors
  LIGHT_BLUE: '#E8F4FD', // Light blue for comments
  LIGHT_GREEN: '#E6F4EA', // Light green for success states
  LIGHT_PURPLE: '#F3E8FD', // Light purple for special elements
};

const Task = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    setRefreshing(true);
    // Simulate API fetch
    setTimeout(() => {
      setTasks([
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
        {
          id: 2,
          title: 'API Integration',
          description:
            'Integrate user login API with proper error handling and validation',
          dueDate: '2025-08-22',
          status: 'In Progress',
          priority: 'Medium',
          progress: 50,
          timeline: [
            {
              date: '2025-08-10',
              detail: 'Task Created',
              user: 'Project Manager',
            },
            {date: '2025-08-12', detail: 'Started by Dev', user: 'Developer'},
          ],
          comments: [
            {
              user: 'Jane Smith',
              comment: 'The endpoint documentation has been updated',
              time: '1 day ago',
            },
          ],
          attachments: [
            {name: 'api_specs.json', size: '1.2 MB'},
            {name: 'endpoints.png', size: '3.1 MB'},
          ],
        },
        {
          id: 3,
          title: 'Testing & Debugging',
          description:
            'Perform comprehensive testing and fix any critical bugs',
          dueDate: '2025-08-28',
          status: 'Pending',
          priority: 'low',
          progress: 0,
          timeline: [
            {date: '2025-08-18', detail: 'Task Created', user: 'QA Lead'},
          ],
          comments: [],
          attachments: [],
        },
      ]);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

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

  const updateTaskStatus = (taskId, newStatus, progress) => {
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
                  detail: `Status changed to ${newStatus}`,
                  user: 'You',
                },
              ],
            }
          : task,
      ),
    );
  };

  const handleStartTask = taskId => {
    updateTaskStatus(taskId, 'In Progress', 50);
  };

  const handlePauseTask = taskId => {
    updateTaskStatus(taskId, 'Paused', 50);
  };

  const handleResumeTask = taskId => {
    updateTaskStatus(taskId, 'In Progress', 50);
  };

  const handleCompleteTask = taskId => {
    updateTaskStatus(taskId, 'Completed', 100);
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === selectedTask.id
          ? {
              ...task,
              comments: [
                ...task.comments,
                {
                  user: 'You',
                  comment: newComment,
                  time: 'Just now',
                },
              ],
            }
          : task,
      ),
    );

    setNewComment('');
  };

  const getStatusColor = status => {
    switch (status) {
      case 'Pending':
        return COLORS.WARNING;
      case 'In Progress':
        return COLORS.PRIMARY;
      case 'Paused':
        return COLORS.DANGER;
      case 'Completed':
        return COLORS.SUCCESS;
      default:
        return COLORS.SECONDARY;
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

  const getActionButtons = task => {
    switch (task.status) {
      case 'Pending':
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
      case 'In Progress':
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
      case 'Paused':
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
      case 'Completed':
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
        return null;
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
            <Text style={styles.statusText}>{item.status}</Text>
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

      {/* Priority Indicator */}
      <View style={styles.priorityContainer}>
        <View
          style={[
            styles.priorityDot,
            {backgroundColor: getPriorityColor(item.priority)},
          ]}
        />
        <Text style={styles.priorityText}>{item.priority} Priority</Text>
      </View>

      {/* Card Body */}
      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.dueDateContainer}>
        <Icon name="calendar-clock" size={16} color={COLORS.SECONDARY} />
        <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${item.progress}%`}]} />
        </View>
        <Text style={styles.progressText}>{item.progress}% Complete</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>{getActionButtons(item)}</View>
    </View>
  );

  const renderModalContent = () => {
    switch (modalType) {
      case 'log':
        return (
          <>
            <Text style={styles.modalSectionTitle}>Timeline</Text>
            {selectedTask?.timeline.map((t, i) => (
              <View key={i} style={styles.timelineItem}>
                <View style={styles.timelineIcon}>
                  <Icon name="circle-medium" size={24} color={COLORS.PRIMARY} />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineDate}>{t.date}</Text>
                  <Text style={styles.timelineDetail}>{t.detail}</Text>
                  <Text style={styles.timelineUser}>By: {t.user}</Text>
                </View>
              </View>
            ))}
          </>
        );
      case 'comment':
        return (
          <>
            <Text style={styles.modalSectionTitle}>Comments</Text>
            <ScrollView style={styles.commentsContainer}>
              {selectedTask?.comments.length > 0 ? (
                selectedTask.comments.map((c, i) => (
                  <View key={i} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUser}>{c.user}</Text>
                      <Text style={styles.commentTime}>{c.time}</Text>
                    </View>
                    <Text style={styles.commentText}>{c.comment}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyState}>No comments yet</Text>
              )}
            </ScrollView>

            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
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
      case 'attachment':
        return (
          <>
            <Text style={styles.modalSectionTitle}>Attachments</Text>
            {selectedTask?.attachments.length > 0 ? (
              selectedTask.attachments.map((a, i) => (
                <TouchableOpacity key={i} style={styles.attachmentItem}>
                  <Icon
                    name="file-document-outline"
                    size={24}
                    color={COLORS.SECONDARY}
                  />
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentName}>{a.name}</Text>
                    <Text style={styles.attachmentSize}>{a.size}</Text>
                  </View>
                  <TouchableOpacity style={styles.downloadBtn}>
                    <Icon name="download" size={20} color={COLORS.PRIMARY} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyState}>No attachments yet</Text>
            )}
            <TouchableOpacity style={styles.addAttachmentBtn}>
              <Icon name="plus" size={16} color={COLORS.WHITE} />
              <Text style={styles.addAttachmentText}>Add Attachment</Text>
            </TouchableOpacity>
          </>
        );
      default:
        return null;
    }
  };

  const handleRefresh = () => {
    loadTasks();
  };

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
                {modalType?.charAt(0).toUpperCase() + modalType?.slice(1)}
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

export default Task;

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
    flex: 1,
    marginBottom: 15,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 12,
  },

  // Timeline
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIcon: {
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
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
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
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
});
