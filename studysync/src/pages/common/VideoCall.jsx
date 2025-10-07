import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Badge, Divider, Empty, Tooltip, Avatar, Progress, Statistic, Tag } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TeamOutlined, 
  UserOutlined, 
  PlayCircleOutlined,
  PlusOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  ShareAltOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  FireOutlined
} from '@ant-design/icons';
import { Video, Users, Phone, Settings, TrendingUp, Calendar, Monitor, Shield, Zap, Award } from 'lucide-react';
import VideoCallManager from '../../components/videocall/VideoCallManager';
import { useAuthStore, useGroupsStore } from '../../stores';
import toast from 'react-hot-toast';

const { Option } = Select;

export default function VideoCallPage() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const { user, isAuthenticated } = useAuthStore();
  const { myGroups } = useGroupsStore();

  // Mock data for groups with enhanced video call info
  const mockGroups = [
    {
      id: 'group_1',
      name: 'Nhóm Toán Cao Cấp A1',
      subject: 'Toán học',
      description: 'Nhóm học tập môn Toán Cao Cấp, tập trung vào giải tích và đại số tuyến tính',
      members: [
        { id: 'member_1', name: 'Nguyễn Văn A', online: true, avatar: 'A' },
        { id: 'member_2', name: 'Trần Thị B', online: false, avatar: 'B' },
        { id: 'member_3', name: 'Lê Văn C', online: true, avatar: 'C' },
        { id: 'member_4', name: 'Phạm Thị D', online: true, avatar: 'D' },
        { id: 'member_5', name: 'Hoàng Văn E', online: false, avatar: 'E' },
      ],
      memberCount: 12,
      activeMembers: 8,
      lastCall: Date.now() - 86400000, // 1 day ago
      totalCalls: 15,
      color: 'purple'
    },
    {
      id: 'group_2',
      name: 'Lập Trình Web React',
      subject: 'Công nghệ thông tin',
      description: 'Nhóm học React.js và các công nghệ web hiện đại',
      members: [
        { id: 'member_6', name: 'Vũ Thị F', online: true, avatar: 'F' },
        { id: 'member_7', name: 'Đặng Văn G', online: false, avatar: 'G' },
        { id: 'member_8', name: 'Ngô Thị H', online: true, avatar: 'H' },
      ],
      memberCount: 15,
      activeMembers: 11,
      lastCall: Date.now() - 3600000, // 1 hour ago
      totalCalls: 23,
      color: 'blue'
    },
    {
      id: 'group_3',
      name: 'Tiếng Anh TOEIC',
      subject: 'Ngoại ngữ',
      description: 'Luyện thi TOEIC và cải thiện kỹ năng tiếng Anh',
      members: [
        { id: 'member_9', name: 'Bùi Văn I', online: false, avatar: 'I' },
        { id: 'member_10', name: 'Cao Thị J', online: true, avatar: 'J' },
      ],
      memberCount: 8,
      activeMembers: 5,
      lastCall: Date.now() - 7200000, // 2 hours ago
      totalCalls: 8,
      color: 'green'
    }
  ];

  const currentGroup = mockGroups.find(g => g.id === selectedGroup) || mockGroups[0];

  useEffect(() => {
    setIsLoaded(true);
    setSelectedGroup(mockGroups[0]?.id);
  }, []);

  const formatLastCall = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    return 'Vừa xong';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          <Card className="text-center shadow-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 px-8 py-12 -mx-6 -mt-6 mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                <PhoneOutlined className="text-5xl text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Cuộc gọi video
              </h2>
              <p className="text-purple-100 text-lg">
                Kết nối và học tập cùng nhau
              </p>
            </div>
            
            <div className="px-8 pb-8">
              <p className="text-gray-600 mb-8 text-lg">
                Bạn cần đăng nhập để sử dụng tính năng gọi video nhóm và tận hưởng trải nghiệm học tập trực tuyến tuyệt vời
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Video className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">HD Video</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600">Bảo mật</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-600">Nhanh chóng</p>
                </div>
              </div>
              
              <Button 
                type="primary" 
                size="large"
                block
                className="bg-gradient-to-r from-purple-600 to-blue-600 border-none h-12 text-base font-semibold shadow-lg hover:shadow-xl"
                onClick={() => window.location.href = '/login'}
              >
                Đăng nhập ngay
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Sidebar - Group Selection & Stats */}
          <div className="xl:col-span-1 space-y-6">
            {/* Group Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card 
                title={
                  <div className="flex items-center gap-2">
                    <TeamOutlined className="text-purple-600" />
                    <span className="font-semibold">Chọn nhóm</span>
                  </div>
                }
                className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300"
              >
                <Select
                  value={selectedGroup}
                  onChange={setSelectedGroup}
                  className="w-full mb-4"
                  size="large"
                  placeholder="Chọn nhóm để gọi video"
                  suffixIcon={<TeamOutlined className="text-purple-600" />}
                >
                  {mockGroups.map(group => (
                    <Option key={group.id} value={group.id}>
                      <div className="flex items-center justify-between py-1">
                        <span className="font-medium text-gray-900">{group.name}</span>
                        <Badge 
                          count={group.activeMembers} 
                          className="ml-2"
                          style={{ backgroundColor: '#52c41a' }}
                        />
                      </div>
                    </Option>
                  ))}
                </Select>
                
                {currentGroup && (
                  <div className="space-y-3">
                    <Divider className="my-4" />
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 flex items-center gap-2">
                          <UserOutlined className="text-gray-500" />
                          Tổng thành viên
                        </span>
                        <span className="font-bold text-gray-900">{currentGroup.memberCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 flex items-center gap-2">
                          <CheckCircleOutlined className="text-green-500" />
                          Đang online
                        </span>
                        <span className="font-bold text-green-600">{currentGroup.activeMembers}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 flex items-center gap-2">
                          <ClockCircleOutlined className="text-blue-500" />
                          Gần nhất
                        </span>
                        <span className="font-medium text-gray-900">{formatLastCall(currentGroup.lastCall)}</span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Progress 
                        percent={Math.round((currentGroup.activeMembers / currentGroup.memberCount) * 100)} 
                        strokeColor={{
                          '0%': '#9333ea',
                          '100%': '#3b82f6',
                        }}
                        size="small"
                        format={percent => `${percent}% online`}
                      />
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>


            {/* Online Members */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card 
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircleOutlined className="text-green-600" />
                      <span className="font-semibold">Đang online</span>
                    </div>
                    {currentGroup && (
                      <Tag color="success">{currentGroup.members.filter(m => m.online).length}</Tag>
                    )}
                  </div>
                }
                className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300"
              >
                {currentGroup ? (
                  <div className="space-y-2">
                    {currentGroup.members
                      .filter(member => member.online)
                      .slice(0, 5)
                      .map((member, index) => (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer border border-green-100"
                        >
                          <div className="relative">
                            <Avatar 
                              size={40}
                              className="bg-gradient-to-r from-purple-500 to-blue-500 font-semibold shadow-md"
                            >
                              {member.avatar}
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse shadow-sm"></div>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">{member.name}</div>
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              <span>Đang hoạt động</span>
                            </div>
                          </div>
                          <Tooltip title="Gọi riêng">
                            <Button 
                              type="text" 
                              size="small"
                              icon={<PhoneOutlined />}
                              className="text-purple-600 hover:bg-purple-100"
                            />
                          </Tooltip>
                        </motion.div>
                      ))}
                    
                    {currentGroup.members.filter(m => m.online).length > 5 && (
                      <div className="text-center pt-3 border-t border-gray-200 mt-3">
                        <Button 
                          type="link" 
                          size="small"
                          className="text-purple-600 font-medium"
                        >
                          +{currentGroup.members.filter(m => m.online).length - 5} người khác
                        </Button>
                      </div>
                    )}
                    
                    {currentGroup.members.filter(m => m.online).length === 0 && (
                      <Empty 
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Chưa có ai online"
                        className="py-4"
                      />
                    )}
                  </div>
                ) : (
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chọn nhóm để xem thành viên"
                    className="py-4"
                  />
                )}
              </Card>
            </motion.div>
          </div>

          {/* Main Content - Video Call Manager */}
          <div className="xl:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card 
                className="shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                styles={{
                  body: { padding: 0 }
                }}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 px-8 py-8 text-white relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Tag color="purple" className="border-0 bg-white/20 text-white font-medium px-3 py-1">
                            {currentGroup?.subject || 'Môn học'}
                          </Tag>
                          <Tag color="success" className="border-0 bg-green-500/80 text-white font-medium px-3 py-1">
                            {currentGroup?.activeMembers} Online
                          </Tag>
                        </div>
                        <h2 className="text-3xl font-bold mb-2">
                          {currentGroup?.name || 'Chọn nhóm để bắt đầu'}
                        </h2>
                        <p className="text-purple-100 text-base">
                          {currentGroup?.description || 'Vui lòng chọn một nhóm từ danh sách bên trái để bắt đầu cuộc gọi video'}
                        </p>
                      </div>
                      
                      {currentGroup && (
                        <div className="text-right bg-white/10 backdrop-blur-sm rounded-2xl p-6 ml-6">
                          <div className="text-5xl font-bold mb-2">{currentGroup.activeMembers}</div>
                          <div className="text-sm text-purple-100 font-medium">Thành viên online</div>
                          <div className="text-xs text-purple-200 mt-1">
                            / {currentGroup.memberCount} tổng
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                  {currentGroup ? (
                    <VideoCallManager
                      groupId={currentGroup.id}
                      groupName={currentGroup.name}
                      members={currentGroup.members}
                    />
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <PhoneOutlined className="text-6xl text-purple-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        Chưa chọn nhóm
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Vui lòng chọn một nhóm từ danh sách bên trái để bắt đầu cuộc gọi video và kết nối với các thành viên
                      </p>
                      <Button 
                        type="primary"
                        size="large"
                        icon={<TeamOutlined />}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 border-none shadow-lg hover:shadow-xl"
                      >
                        Chọn nhóm ngay
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}