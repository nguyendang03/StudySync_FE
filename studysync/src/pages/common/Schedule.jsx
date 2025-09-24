import React, { useState, useEffect } from 'react';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  TeamOutlined, 
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  BookOutlined,
  VideoCameraOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  SearchOutlined,
  MessageOutlined,
  SettingOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Badge, Tooltip, Modal, Form, Input, TimePicker, Select, DatePicker } from 'antd';
import { Calendar, Clock, Users, Video, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import dayjs from 'dayjs';
import Sidebar from '../../components/layout/Sidebar';

const { Option } = Select;
const { TextArea } = Input;

export default function Schedule() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [form] = Form.useForm();

  // Sample schedule data
  const [scheduleEvents, setScheduleEvents] = useState([
    {
      id: 1,
      title: 'Họp nhóm EXE101',
      description: 'Thảo luận về dự án cuối kỳ',
      day: 2, // Tuesday
      startTime: '14:00',
      endTime: '16:00',
      type: 'meeting',
      participants: ['John', 'Jane', 'Bob'],
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'Học nhóm SWP391',
      description: 'Ôn tập lý thuyết và thực hành',
      day: 4, // Thursday
      startTime: '9:00',
      endTime: '11:00',
      type: 'study',
      participants: ['Alice', 'Charlie', 'David'],
      color: 'bg-green-500'
    },
    {
      id: 3,
      title: 'Thuyết trình nhóm',
      description: 'Báo cáo tiến độ dự án',
      day: 5, // Friday
      startTime: '15:00',
      endTime: '17:00',
      type: 'presentation',
      participants: ['Team Alpha'],
      color: 'bg-purple-500'
    }
  ]);

  const timeSlots = [
    '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
    '12 AM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
  ];

  const daysOfWeek = [
    { key: 'mon', label: 'Thứ Hai', date: '30/06' },
    { key: 'tue', label: 'Thứ Ba', date: '01/07' },
    { key: 'wed', label: 'Thứ Tư', date: '02/07' },
    { key: 'thu', label: 'Thứ Năm', date: '03/07' },
    { key: 'fri', label: 'Thứ Sáu', date: '04/07' },
    { key: 'sat', label: 'Thứ Bảy', date: '05/07' },
    { key: 'sun', label: 'Chủ Nhật', date: '06/07' }
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const getEventsForTimeSlot = (day, timeIndex) => {
    return scheduleEvents.filter(event => {
      const eventStartHour = parseInt(event.startTime.split(':')[0]);
      const eventEndHour = parseInt(event.endTime.split(':')[0]);
      const currentHour = timeIndex + 1;
      
      return event.day === day && currentHour >= eventStartHour && currentHour < eventEndHour;
    });
  };

  const handleTimeSlotClick = (day, timeIndex) => {
    setSelectedTimeSlot({ day, timeIndex, time: timeSlots[timeIndex] });
    setIsModalOpen(true);
  };

  const handleCreateEvent = async (values) => {
    try {
      // Simple time parsing without dayjs
      const startTime = values.timeRange ? values.timeRange[0] : null;
      const endTime = values.timeRange ? values.timeRange[1] : null;
      
      const newEvent = {
        id: scheduleEvents.length + 1,
        title: values.title,
        description: values.description,
        day: selectedTimeSlot.day,
        startTime: startTime ? `${startTime.hour().toString().padStart(2, '0')}:${startTime.minute().toString().padStart(2, '0')}` : '09:00',
        endTime: endTime ? `${endTime.hour().toString().padStart(2, '0')}:${endTime.minute().toString().padStart(2, '0')}` : '10:00',
        type: values.type,
        participants: values.participants ? values.participants.split(',').map(p => p.trim()) : [],
        color: getEventColor(values.type)
      };

      setScheduleEvents(prev => [...prev, newEvent]);
      setIsModalOpen(false);
      form.resetFields();
      toast.success('Đã thêm sự kiện thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo sự kiện!');
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'study': return 'bg-green-500';
      case 'presentation': return 'bg-purple-500';
      case 'exam': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'meeting': return <Users className="w-3 h-3" />;
      case 'study': return <BookOutlined className="text-xs" />;
      case 'presentation': return <VideoCameraOutlined className="text-xs" />;
      case 'exam': return <EditOutlined className="text-xs" />;
      default: return <CalendarOutlined className="text-xs" />;
    }
  };

  const handlePrevWeek = () => {
    setCurrentWeek(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => prev + 1);
  };

  return (
    <>
      <Header />
      <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #A640A0, #6D17AE)' }}>
        <Sidebar />

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden fixed top-4 left-4 z-50 bg-white/20 backdrop-blur-sm border border-white/30 text-white p-3 rounded-lg"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <MenuOutlined />
        </button>

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
                <CalendarOutlined className="text-4xl" />
                THỜI KHÓA BIỂU
              </h1>
              <p className="text-white/80">Quản lý lịch học và họp nhóm của bạn</p>
            </motion.div>

            {/* Week Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center gap-4">
                <Button
                  icon={<LeftOutlined />}
                  onClick={handlePrevWeek}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  size="large"
                />
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/30">
                  <div className="flex items-center gap-3 text-white">
                    <CalendarOutlined className="text-xl" />
                    <span className="font-semibold">30/06 - 07/07/2025</span>
                  </div>
                </div>
                <Button
                  icon={<RightOutlined />}
                  onClick={handleNextWeek}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  size="large"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="text-white/80 text-sm">GMT +07</div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-purple-600 border-0 hover:bg-gray-100"
                  size="large"
                >
                  Thêm sự kiện
                </Button>
              </div>
            </motion.div>

            {/* Schedule Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Days Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                <div className="grid grid-cols-8 gap-2">
                  <div className="flex items-center justify-center">
                    <ClockCircleOutlined className="text-white text-xl" />
                  </div>
                  {daysOfWeek.map((day, index) => (
                    <motion.div
                      key={day.key}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center text-white"
                    >
                      <div className="font-semibold text-sm">{day.label}</div>
                      <div className="text-xs opacity-80">{day.date}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
                {timeSlots.map((time, timeIndex) => (
                  <div key={timeIndex} className="grid grid-cols-8 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    {/* Time Label */}
                    <div className="bg-purple-50 p-3 text-center border-r border-gray-200">
                      <div className="text-purple-600 font-medium text-sm">{time}</div>
                    </div>
                    
                    {/* Day Cells */}
                    {daysOfWeek.map((day, dayIndex) => {
                      const events = getEventsForTimeSlot(dayIndex, timeIndex);
                      return (
                        <motion.div
                          key={`${dayIndex}-${timeIndex}`}
                          whileHover={{ backgroundColor: 'rgba(147, 51, 234, 0.05)' }}
                          className="relative p-2 border-r border-gray-100 min-h-[60px] cursor-pointer"
                          onClick={() => handleTimeSlotClick(dayIndex, timeIndex)}
                        >
                          <AnimatePresence>
                            {events.map((event, eventIndex) => (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                whileHover={{ scale: 1.02 }}
                                className={`${event.color} text-white p-2 rounded-lg text-xs mb-1 shadow-sm hover:shadow-md transition-all cursor-pointer`}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  {getEventIcon(event.type)}
                                  <span className="font-semibold truncate">{event.title}</span>
                                </div>
                                <div className="text-xs opacity-90">
                                  {event.startTime} - {event.endTime}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <UserOutlined className="text-xs" />
                                  <span>{event.participants.length}</span>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30"
            >
              <div className="flex items-center justify-center gap-8 text-white">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Họp nhóm</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Học nhóm</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm">Thuyết trình</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">Kiểm tra</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 text-xl font-bold">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <PlusOutlined className="text-white" />
            </div>
            Tạo sự kiện mới
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
        centered
        destroyOnClose
        className="custom-modal"
      >
        <div className="pt-6">
          <Form
            form={form}
            onFinish={handleCreateEvent}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="title"
              label={<span className="text-gray-700 font-medium">Tiêu đề sự kiện</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
            >
              <Input
                placeholder="Nhập tiêu đề sự kiện"
                prefix={<CalendarOutlined className="text-gray-400" />}
                className="rounded-xl"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={<span className="text-gray-700 font-medium">Mô tả</span>}
            >
              <TextArea
                placeholder="Mô tả chi tiết về sự kiện"
                rows={3}
                className="rounded-xl"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="type"
                label={<span className="text-gray-700 font-medium">Loại sự kiện</span>}
                rules={[{ required: true, message: 'Vui lòng chọn loại sự kiện!' }]}
              >
                <Select placeholder="Chọn loại sự kiện" className="rounded-xl">
                  <Option value="meeting">Họp nhóm</Option>
                  <Option value="study">Học nhóm</Option>
                  <Option value="presentation">Thuyết trình</Option>
                  <Option value="exam">Kiểm tra</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="timeRange"
                label={<span className="text-gray-700 font-medium">Thời gian</span>}
                rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
              >
                <TimePicker.RangePicker 
                  format="HH:mm"
                  className="w-full rounded-xl"
                  placeholder={['Bắt đầu', 'Kết thúc']}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="participants"
              label={<span className="text-gray-700 font-medium">Thành viên tham gia</span>}
            >
              <Input
                placeholder="Nhập tên thành viên, cách nhau bởi dấu phẩy"
                prefix={<TeamOutlined className="text-gray-400" />}
                className="rounded-xl"
              />
            </Form.Item>

            <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                }}
                className="flex-1 h-12 rounded-xl"
                size="large"
              >
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 border-0 rounded-xl"
                size="large"
              >
                Tạo sự kiện
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
      </div>

      <Footer />
    </>
  );
}