import React, { useState, useEffect } from 'react';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  UserOutlined,
  CalendarOutlined,
  TagOutlined,
  TeamOutlined,
  FilterOutlined,
  SearchOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Button, 
  Card, 
  Checkbox, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Avatar,
  Tooltip,
  Dropdown,
  Badge,
  Spin
} from 'antd';
import { Users, Clock, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { showToast, commonToasts } from '../../utils/toast';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../../components/layout/Sidebar';
import dayjs from 'dayjs';
import taskService from '../../services/taskService';
import groupService from '../../services/groupService';

const { Option } = Select;
const { TextArea } = Input;

export default function TaskDistribution() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();
  const [groups, setGroups] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Fetch user's groups on mount
  useEffect(() => {
    setIsLoaded(true);
    if (isAuthenticated) {
      fetchMyGroups();
    }
  }, [isAuthenticated]);

  // Fetch tasks when group changes
  useEffect(() => {
    if (selectedGroup) {
      fetchGroupTasks(selectedGroup);
      fetchTaskStatistics(selectedGroup);
    }
  }, [selectedGroup]);

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching user groups...');
      const response = await groupService.getMyGroups();
      console.log('📝 Groups API response:', response);
      
      // Extract data from response (axios already extracts response.data)
      let groupsData = response?.data || response || [];
      
      // Convert object with numeric keys to array if needed
      if (groupsData && typeof groupsData === 'object' && !Array.isArray(groupsData)) {
        groupsData = Object.values(groupsData);
      }
      
      console.log('📝 Groups data after extraction:', groupsData);
      
      // Ensure we have an array before mapping
      if (!Array.isArray(groupsData)) {
        console.error('❌ Groups data is not an array:', groupsData);
        setGroups([]);
        setLoading(false);
        return;
      }
      
      // Fetch members for each group
      const groupsWithMembers = await Promise.all(
        groupsData.map(async (group) => {
          try {
            const membersResponse = await groupService.getGroupMembers(group.id);
            const membersData = membersResponse?.data || membersResponse;
            const members = membersData?.members || [];
            
            return {
              ...group,
              members: members.map((member, index) => ({
                id: member.id,
                userId: member.id,
                name: member.username || member.email?.split('@')[0] || 'User',
                email: member.email,
                avatar: (member.username || 'U').substring(0, 2).toUpperCase(),
                color: getAvatarColor(index),
                role: member.role,
                isLeader: member.isLeader
              }))
            };
          } catch (error) {
            console.error('Error fetching members for group:', group.id, error);
            return { ...group, members: [] };
          }
        })
      );

      setGroups(groupsWithMembers);
      
      // Auto-select first group
      if (groupsWithMembers.length > 0 && !selectedGroup) {
        setSelectedGroup(groupsWithMembers[0].id);
      }
    } catch (error) {
      console.error('❌ Error fetching groups:', error);
      showToast.error('Không thể tải danh sách nhóm');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupTasks = async (groupId) => {
    try {
      setLoading(true);
      console.log('🔄 Fetching tasks for group:', groupId);
      const response = await taskService.getGroupTasks(groupId);
      console.log('📝 Tasks API response:', response);
      
      // Extract data from response
      let tasksData = response?.data || response || [];
      
      // Convert object with numeric keys to array if needed
      if (tasksData && typeof tasksData === 'object' && !Array.isArray(tasksData)) {
        tasksData = Object.values(tasksData);
      }
      
      console.log('📝 Tasks data after extraction:', tasksData);
      
      // Ensure we have an array before mapping
      if (!Array.isArray(tasksData)) {
        console.error('❌ Tasks data is not an array:', tasksData);
        setTasks([]);
        setLoading(false);
        return;
      }
      
      // Transform tasks to match UI format
      const transformedTasks = tasksData.map(task => ({
        id: task.id,
        groupId: task.groupId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.deadline ? dayjs(task.deadline).format('YYYY-MM-DD') : null,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
        assignee: task.assignee ? {
          id: task.assignee.id,
          userId: task.assignee.id,
          name: task.assignee.username || task.assignee.email?.split('@')[0] || 'User',
          email: task.assignee.email,
          avatar: (task.assignee.username || 'U').substring(0, 2).toUpperCase(),
        } : null,
        assigner: task.assigner ? {
          id: task.assigner.id,
          name: task.assigner.username || task.assigner.email?.split('@')[0] || 'User',
        } : null
      }));

      setTasks(transformedTasks);
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      showToast.error('Không thể tải danh sách task');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskStatistics = async (groupId) => {
    try {
      const response = await taskService.getTaskStatistics(groupId);
      const stats = response?.data || response;
      setStatistics(stats);
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      setStatistics(null);
    }
  };

  const getAvatarColor = (index) => {
    const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-cyan-500'];
    return colors[index % colors.length];
  };

  const handleTaskStatusChange = async (taskId, checked) => {
    if (!selectedGroup) return;
    
    try {
      const newStatus = checked ? 'completed' : 'pending';
      await taskService.updateTaskStatus(selectedGroup, taskId, newStatus);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, completedAt: checked ? new Date() : null }
          : task
      ));
      
      showToast.success(checked ? 'Task đã hoàn thành' : 'Task đã đánh dấu chưa hoàn thành');
      
      // Refresh statistics
      fetchTaskStatistics(selectedGroup);
    } catch (error) {
      console.error('❌ Error updating task status:', error);
      showToast.error('Không thể cập nhật trạng thái task');
    }
  };

  const handleCreateTask = async (values) => {
    if (!selectedGroup) {
      showToast.error('Vui lòng chọn nhóm');
      return;
    }

    try {
      // Get the selected member's UUID
      const selectedMember = groups
        .find(g => g.id === selectedGroup)
        ?.members.find(m => m.userId === values.assignee);

      if (!selectedMember) {
        showToast.error('Không tìm thấy thành viên được chọn');
        return;
      }

      const payload = {
        title: values.title,
        description: values.description,
        assignedTo: selectedMember.userId, // UUID from backend
        deadline: values.dueDate ? values.dueDate.toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: values.priority || 'medium'
      };

      console.log('📤 Creating task with payload:', payload);
      await taskService.createTask(selectedGroup, payload);
      
      commonToasts.taskCreated();
      setIsModalOpen(false);
      form.resetFields();
      
      // Refresh tasks and statistics
      await fetchGroupTasks(selectedGroup);
      await fetchTaskStatistics(selectedGroup);
    } catch (error) {
      console.error('❌ Error creating task:', error);
      showToast.error(error.message || 'Không thể tạo task');
    }
  };

  const handleUpdateTask = async (values) => {
    if (!editingTask || !selectedGroup) return;

    try {
      const payload = {
        title: values.title,
        description: values.description,
        deadline: values.dueDate ? values.dueDate.toISOString() : undefined,
        priority: values.priority
      };

      await taskService.updateTask(selectedGroup, editingTask.id, payload);
      
      commonToasts.taskUpdated();
      setIsModalOpen(false);
      setEditingTask(null);
      form.resetFields();
      
      // Refresh tasks
      await fetchGroupTasks(selectedGroup);
    } catch (error) {
      console.error('❌ Error updating task:', error);
      showToast.error(error.message || 'Không thể cập nhật task');
    }
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedGroup || !taskToDelete) return;

    try {
      await taskService.deleteTask(selectedGroup, taskToDelete.id);
      commonToasts.taskDeleted();
      
      // Close modal and reset
      setDeleteModalVisible(false);
      setTaskToDelete(null);
      
      // Refresh tasks and statistics
      await fetchGroupTasks(selectedGroup);
      await fetchTaskStatistics(selectedGroup);
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      showToast.error(error.message || 'Không thể xóa task');
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setTaskToDelete(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'volcano';
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'Khẩn cấp';
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return priority;
    }
  };

  const getStatusIcon = (status) => {
    return status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />;
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.assignee?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Group tasks by assignee for the selected group
  const getTasksByGroup = () => {
    const group = groups.find(g => g.id === selectedGroup);
    if (!group) return [];

    return group.members.map(member => ({
      ...member,
      groupName: group.groupName || group.name,
      tasks: filteredTasks.filter(task => task.assignee?.userId === member.userId || task.assignee?.id === member.userId)
    }));
  };

  const groupedData = getTasksByGroup();

  // Check if current user is leader
  const currentUserId = user?.data?.id || user?.id;
  const currentGroup = groups.find(g => g.id === selectedGroup);
  const isLeader = currentGroup?.leaderId === currentUserId;

  if (loading && groups.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(135deg, #A640A0, #6D17AE)' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: 'white' }} spin />} />
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #A640A0, #6D17AE)' }}>
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1">
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                  <Target className="w-8 h-8" />
                  PHÂN CHIA TASK
                </h1>
                <p className="text-white/80">Quản lý và phân chia công việc trong nhóm</p>
              </motion.div>

              {/* Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/30"
              >
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Group Filter */}
                    <Select
                      value={selectedGroup}
                      onChange={setSelectedGroup}
                      className="w-64"
                      size="large"
                      placeholder="Chọn nhóm"
                    >
                      {groups.map(group => (
                        <Option key={group.id} value={group.id}>
                          {group.groupName || group.name}
                        </Option>
                      ))}
                    </Select>

                    {/* Search */}
                    <Input
                      placeholder="Tìm kiếm task..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      prefix={<SearchOutlined />}
                      className="w-64"
                      size="large"
                    />
                  </div>

                  {/* Add Task Button - Only for leaders */}
                  {isLeader && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        setEditingTask(null);
                        form.resetFields();
                        setIsModalOpen(true);
                      }}
                      size="large"
                      className="bg-white text-purple-600 border-0 hover:bg-gray-100"
                      disabled={!selectedGroup}
                    >
                      Thêm Task
                    </Button>
                  )}
                </div>

                {/* Statistics */}
                {statistics && selectedGroup && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-white/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">{statistics.total || 0}</div>
                      <div className="text-xs text-white/80">Tổng số</div>
                    </div>
                    <div className="bg-yellow-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">{statistics.pending || 0}</div>
                      <div className="text-xs text-white/80">Chưa làm</div>
                    </div>
                    <div className="bg-blue-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">{statistics.inProgress || 0}</div>
                      <div className="text-xs text-white/80">Đang làm</div>
                    </div>
                    <div className="bg-green-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">{statistics.completed || 0}</div>
                      <div className="text-xs text-white/80">Hoàn thành</div>
                    </div>
                    <div className="bg-red-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">{statistics.overdue || 0}</div>
                      <div className="text-xs text-white/80">Quá hạn</div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Task Grid */}
              {!selectedGroup ? (
                <div className="text-center text-white py-12">
                  <TeamOutlined className="text-6xl mb-4 opacity-50" />
                  <p className="text-xl">Vui lòng chọn nhóm để xem tasks</p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <AnimatePresence>
                    {groupedData.map((item, index) => (
                      <motion.div
                        key={`member-${item.userId || item.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                      >
                        <Card
                          className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden"
                          bodyStyle={{ padding: 0 }}
                        >
                          {/* Card Header */}
                          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                              <Avatar
                                size={40}
                                className={`${item.color} flex items-center justify-center text-white font-bold`}
                              >
                                {item.avatar}
                              </Avatar>
                              <div>
                                <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                                <p className="text-sm text-gray-600">{item.groupName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                {item.tasks?.length || 0} tasks
                              </span>
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                {item.tasks?.filter(t => t.status === 'completed').length || 0} hoàn thành
                              </span>
                            </div>
                          </div>

                        {/* Task List */}
                        <div className="p-6 max-h-80 overflow-y-auto">
                          {item.tasks && item.tasks.length > 0 ? (
                            <div className="space-y-3">
                              {item.tasks.map((task) => (
                                <motion.div
                                  key={task.id}
                                  whileHover={{ scale: 1.02 }}
                                  className={`p-3 rounded-lg border transition-all ${
                                    task.status === 'completed' 
                                      ? 'bg-green-50 border-green-200' 
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <Checkbox
                                      checked={task.status === 'completed'}
                                      onChange={(e) => handleTaskStatusChange(task.id, e.target.checked)}
                                      className="mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-medium ${
                                          task.status === 'completed' 
                                            ? 'line-through text-gray-500' 
                                            : 'text-gray-800'
                                        }`}>
                                          {task.title}
                                        </span>
                                        <Tag color={getPriorityColor(task.priority)} size="small">
                                          {getPriorityLabel(task.priority)}
                                        </Tag>
                                      </div>
                                      <p className={`text-sm mb-2 ${
                                        task.status === 'completed' 
                                          ? 'line-through text-gray-400' 
                                          : 'text-gray-600'
                                      }`}>
                                        {task.description}
                                      </p>
                                      {task.dueDate && (
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                          <CalendarOutlined />
                                          {dayjs(task.dueDate).format('DD/MM/YYYY')}
                                        </div>
                                      )}
                                    </div>
                                    {isLeader && (
                                      <Dropdown
                                        menu={{
                                          items: [
                                            {
                                              key: 'edit',
                                              icon: <EditOutlined />,
                                              label: 'Chỉnh sửa',
                                              onClick: () => {
                                                setEditingTask(task);
                                                form.setFieldsValue({
                                                  title: task.title,
                                                  description: task.description,
                                                  priority: task.priority,
                                                  dueDate: task.dueDate ? dayjs(task.dueDate) : null
                                                });
                                                setIsModalOpen(true);
                                              }
                                            },
                                            {
                                              key: 'delete',
                                              icon: <DeleteOutlined />,
                                              label: 'Xóa',
                                              danger: true,
                                              onClick: () => handleDeleteClick(task)
                                            }
                                          ]
                                        }}
                                        trigger={['click']}
                                      >
                                        <Button type="text" size="small" className="text-gray-400 hover:text-gray-600">
                                          <EditOutlined />
                                        </Button>
                                      </Dropdown>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>Chưa có task nào</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Task Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <PlusOutlined className="text-white" />
            </div>
            {editingTask ? 'Chỉnh sửa Task' : 'Tạo Task Mới'}
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingTask(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        className="task-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingTask ? handleUpdateTask : handleCreateTask}
          className="mt-6"
          initialValues={editingTask ? {
            title: editingTask.title,
            description: editingTask.description,
            priority: editingTask.priority,
            dueDate: editingTask.dueDate ? dayjs(editingTask.dueDate) : null
          } : undefined}
        >
          <Form.Item
            name="title"
            label="Tiêu đề task"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Nhập tiêu đề task" size="large" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea
              placeholder="Mô tả chi tiết về task"
              rows={3}
              size="large"
            />
          </Form.Item>

          {!editingTask && (
            <Form.Item
              name="assignee"
              label="Người thực hiện"
              rules={[{ required: true, message: 'Vui lòng chọn người thực hiện!' }]}
            >
              <Select placeholder="Chọn thành viên" size="large">
                {currentGroup?.members?.map(member => (
                  <Option key={member.userId} value={member.userId}>
                    <div className="flex items-center gap-2">
                      <Avatar size={20} className={`${member.color} text-white text-xs`}>
                        {member.avatar}
                      </Avatar>
                      {member.name}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="priority"
              label="Độ ưu tiên"
              rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên!' }]}
            >
              <Select placeholder="Chọn độ ưu tiên" size="large">
                <Option value="urgent">
                  <Tag color="volcano">Khẩn cấp</Tag>
                </Option>
                <Option value="high">
                  <Tag color="red">Cao</Tag>
                </Option>
                <Option value="medium">
                  <Tag color="orange">Trung bình</Tag>
                </Option>
                <Option value="low">
                  <Tag color="green">Thấp</Tag>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dueDate"
              label="Hạn hoàn thành"
              rules={[{ required: true, message: 'Vui lòng chọn deadline!' }]}
            >
              <DatePicker 
                placeholder="Chọn ngày hạn" 
                size="large"
                className="w-full"
                format="DD/MM/YYYY"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </div>

          <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
            <Button
              onClick={() => {
                setIsModalOpen(false);
                setEditingTask(null);
                form.resetFields();
              }}
              size="large"
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 border-0"
            >
              {editingTask ? 'Cập nhật' : 'Tạo Task'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold">Xác nhận xóa task</span>
          </div>
        }
        open={deleteModalVisible}
        onCancel={handleCancelDelete}
        footer={null}
        width={500}
      >
        <div className="mt-4">
          <p className="text-gray-700 mb-4">
            Bạn có chắc chắn muốn xóa task này không? Hành động này không thể hoàn tác.
          </p>
          
          {taskToDelete && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <div className="flex items-start gap-2 mb-2">
                <span className="font-semibold text-gray-700">Tên task:</span>
                <span className="text-gray-600">{taskToDelete.title}</span>
              </div>
              <div className="flex items-start gap-2 mb-2">
                <span className="font-semibold text-gray-700">Mô tả:</span>
                <span className="text-gray-600">{taskToDelete.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Người được giao:</span>
                <span className="text-gray-600">{taskToDelete.assignee?.name || 'N/A'}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleCancelDelete}
              size="large"
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              danger
              onClick={handleConfirmDelete}
              size="large"
              className="flex-1"
            >
              Xóa Task
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </>
  );
}