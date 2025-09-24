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
  SearchOutlined
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
  Badge
} from 'antd';
import { Users, Clock, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Sidebar from '../../components/layout/Sidebar';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

export default function TaskDistribution() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Sample groups data
  const [groups] = useState([
    {
      id: 1,
      name: 'Tung Tung Tung Sahur',
      subject: 'EXE101',
      members: [
        { id: 1, name: 'Pham Hoang', avatar: 'PH', color: 'bg-blue-500' },
        { id: 2, name: 'Thuy Dung', avatar: 'H', color: 'bg-purple-500' },
        { id: 3, name: 'Dai Khai', avatar: 'DK', color: 'bg-green-500' },
        { id: 4, name: 'Anh Long', avatar: 'L', color: 'bg-yellow-500' },
        { id: 5, name: 'Hieu Minh', avatar: 'M', color: 'bg-pink-500' },
        { id: 6, name: 'Quynh Nhu', avatar: 'N', color: 'bg-indigo-500' }
      ]
    },
    {
      id: 2,
      name: 'React Developers',
      subject: 'SWP391',
      members: [
        { id: 7, name: 'John Doe', avatar: 'JD', color: 'bg-red-500' },
        { id: 8, name: 'Jane Smith', avatar: 'JS', color: 'bg-cyan-500' },
        { id: 9, name: 'Mike Wilson', avatar: 'MW', color: 'bg-orange-500' }
      ]
    }
  ]);

  // Sample tasks data
  const [tasks, setTasks] = useState([
    {
      id: 1,
      groupId: 1,
      assignee: { id: 1, name: 'Pham Hoang', avatar: 'PH', color: 'bg-blue-500' },
      title: 'task 1',
      description: 'Complete the database design',
      status: 'completed',
      priority: 'high',
      dueDate: '2025-09-25',
      createdAt: '2025-09-20'
    },
    {
      id: 2,
      groupId: 1,
      assignee: { id: 1, name: 'Pham Hoang', avatar: 'PH', color: 'bg-blue-500' },
      title: 'task 2',
      description: 'Implement user authentication',
      status: 'pending',
      priority: 'medium',
      dueDate: '2025-09-28',
      createdAt: '2025-09-21'
    },
    {
      id: 3,
      groupId: 1,
      assignee: { id: 1, name: 'Pham Hoang', avatar: 'PH', color: 'bg-blue-500' },
      title: 'task 3',
      description: 'Create API documentation',
      status: 'pending',
      priority: 'low',
      dueDate: '2025-09-30',
      createdAt: '2025-09-22'
    },
    {
      id: 4,
      groupId: 1,
      assignee: { id: 2, name: 'Thuy Dung', avatar: 'H', color: 'bg-purple-500' },
      title: 'task 1',
      description: 'Design user interface mockups',
      status: 'completed',
      priority: 'high',
      dueDate: '2025-09-24',
      createdAt: '2025-09-19'
    },
    {
      id: 5,
      groupId: 1,
      assignee: { id: 2, name: 'Thuy Dung', avatar: 'H', color: 'bg-purple-500' },
      title: 'task 2',
      description: 'Implement responsive design',
      status: 'pending',
      priority: 'medium',
      dueDate: '2025-09-27',
      createdAt: '2025-09-20'
    },
    {
      id: 6,
      groupId: 1,
      assignee: { id: 2, name: 'Thuy Dung', avatar: 'H', color: 'bg-purple-500' },
      title: 'task 3',
      description: 'Test user experience flows',
      status: 'pending',
      priority: 'low',
      dueDate: '2025-09-29',
      createdAt: '2025-09-21'
    },
    {
      id: 7,
      groupId: 2,
      assignee: { id: 7, name: 'John Doe', avatar: 'JD', color: 'bg-red-500' },
      title: 'task 1',
      description: 'Setup React project structure',
      status: 'completed',
      priority: 'high',
      dueDate: '2025-09-23',
      createdAt: '2025-09-18'
    }
  ]);

  const handleTaskStatusChange = (taskId, checked) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: checked ? 'completed' : 'pending' }
        : task
    ));
    toast.success(checked ? 'Task đã hoàn thành!' : 'Task đã đánh dấu chưa hoàn thành');
  };

  const handleCreateTask = async (values) => {
    try {
      const selectedGroup = groups.find(g => g.id === values.groupId);
      const selectedMember = selectedGroup?.members.find(m => m.id === values.assignee);
      
      const newTask = {
        id: tasks.length + 1,
        groupId: values.groupId,
        assignee: selectedMember,
        title: values.title,
        description: values.description,
        status: 'pending',
        priority: values.priority,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
        createdAt: dayjs().format('YYYY-MM-DD')
      };

      setTasks(prev => [...prev, newTask]);
      setIsModalOpen(false);
      form.resetFields();
      toast.success('Task đã được tạo thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo task!');
    }
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast.success('Task đã được xóa!');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  const getStatusIcon = (status) => {
    return status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />;
  };

  // Filter tasks based on selected group and search query
  const filteredTasks = tasks.filter(task => {
    const matchesGroup = selectedGroup === 'all' || task.groupId === parseInt(selectedGroup);
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.assignee.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  // Group tasks by assignee for the selected group
  const getTasksByGroup = () => {
    if (selectedGroup === 'all') {
      // Show all groups with their tasks
      return groups.map(group => ({
        ...group,
        tasks: filteredTasks.filter(task => task.groupId === group.id)
      }));
    } else {
      // Show tasks grouped by members for the selected group
      const group = groups.find(g => g.id === parseInt(selectedGroup));
      if (!group) return [];

      return group.members.map(member => ({
        ...member,
        groupName: group.name,
        tasks: filteredTasks.filter(task => task.assignee.id === member.id)
      }));
    }
  };

  const groupedData = getTasksByGroup();

  return (
    <>
      <Header />
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
                    >
                      <Option value="all">Tất cả nhóm</Option>
                      {groups.map(group => (
                        <Option key={group.id} value={group.id.toString()}>
                          {group.name}
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

                  {/* Add Task Button */}
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalOpen(true)}
                    size="large"
                    className="bg-white text-purple-600 border-0 hover:bg-gray-100"
                  >
                    Thêm Task
                  </Button>
                </div>
              </motion.div>

              {/* Task Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {groupedData.map((item, index) => (
                    <motion.div
                      key={selectedGroup === 'all' ? `group-${item.id}` : `member-${item.id}`}
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
                            {selectedGroup === 'all' ? (
                              <>
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                  <TeamOutlined className="text-white text-lg" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                                  <p className="text-sm text-gray-600">{item.subject}</p>
                                </div>
                              </>
                            ) : (
                              <>
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
                              </>
                            )}
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
                                          {task.priority}
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
                                                ...task,
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
                                            onClick: () => handleDeleteTask(task.id)
                                          }
                                        ]
                                      }}
                                      trigger={['click']}
                                    >
                                      <Button type="text" size="small" className="text-gray-400 hover:text-gray-600">
                                        <EditOutlined />
                                      </Button>
                                    </Dropdown>
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
            </div>
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
          onFinish={handleCreateTask}
          className="mt-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="groupId"
              label="Nhóm"
              rules={[{ required: true, message: 'Vui lòng chọn nhóm!' }]}
            >
              <Select placeholder="Chọn nhóm" size="large">
                {groups.map(group => (
                  <Option key={group.id} value={group.id}>
                    {group.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="assignee"
              label="Người thực hiện"
              rules={[{ required: true, message: 'Vui lòng chọn người thực hiện!' }]}
            >
              <Select placeholder="Chọn thành viên" size="large">
                {groups.flatMap(group => 
                  group.members.map(member => (
                    <Option key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar size={20} className={`${member.color} text-white text-xs`}>
                          {member.avatar}
                        </Avatar>
                        {member.name}
                      </div>
                    </Option>
                  ))
                )}
              </Select>
            </Form.Item>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="priority"
              label="Độ ưu tiên"
              rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên!' }]}
            >
              <Select placeholder="Chọn độ ưu tiên" size="large">
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
            >
              <DatePicker 
                placeholder="Chọn ngày hạn" 
                size="large"
                className="w-full"
                format="DD/MM/YYYY"
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

      <Footer />
    </>
  );
}