import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  SettingOutlined,
  DownloadOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  MessageSquare,
  Video,
  Award,
  Target,
  Zap,
} from 'lucide-react';
import { Card, Select, DatePicker, Button, Table, Badge, Progress, Dropdown, Tooltip } from 'antd';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Mock data for statistics
  const stats = [
    {
      title: 'Tổng người dùng',
      value: '2,543',
      change: '+12.5%',
      isIncrease: true,
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      description: 'Tăng 284 người trong 7 ngày',
    },
    {
      title: 'Nhóm học tập',
      value: '486',
      change: '+8.2%',
      isIncrease: true,
      icon: <TeamOutlined className="text-2xl" />,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      description: '42 nhóm mới tuần này',
    },
    {
      title: 'Hoạt động học tập',
      value: '15,234',
      change: '+23.1%',
      isIncrease: true,
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      description: 'Bài tập, bài đăng, bình luận',
    },
    {
      title: 'Cuộc gọi video',
      value: '1,845',
      change: '-2.4%',
      isIncrease: false,
      icon: <Video className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      description: 'Giảm so với tuần trước',
    },
  ];

  // User growth data
  const userGrowthData = [
    { date: 'T2', users: 2100, newUsers: 45, activeUsers: 1850 },
    { date: 'T3', users: 2156, newUsers: 56, activeUsers: 1920 },
    { date: 'T4', users: 2198, newUsers: 42, activeUsers: 1980 },
    { date: 'T5', users: 2267, newUsers: 69, activeUsers: 2050 },
    { date: 'T6', users: 2334, newUsers: 67, activeUsers: 2100 },
    { date: 'T7', users: 2421, newUsers: 87, activeUsers: 2180 },
    { date: 'CN', users: 2543, newUsers: 122, activeUsers: 2240 },
  ];

  // Activity distribution data
  const activityData = [
    { name: 'Bài đăng', value: 5234, percentage: 34.3 },
    { name: 'Bình luận', value: 3876, percentage: 25.4 },
    { name: 'Bài tập', value: 2845, percentage: 18.7 },
    { name: 'Video call', value: 1845, percentage: 12.1 },
    { name: 'Chat', value: 1434, percentage: 9.5 },
  ];

  // Group statistics
  const groupStatsData = [
    { category: 'Toán học', groups: 142, members: 856, growth: 15 },
    { category: 'Lập trình', groups: 98, members: 654, growth: 28 },
    { category: 'Ngoại ngữ', groups: 87, members: 523, growth: 12 },
    { category: 'Khoa học', groups: 76, members: 445, growth: 8 },
    { category: 'Nghệ thuật', groups: 45, members: 287, growth: 5 },
    { category: 'Khác', groups: 38, members: 234, growth: -2 },
  ];

  // Peak hours data
  const peakHoursData = [
    { hour: '0h', activity: 45 },
    { hour: '2h', activity: 23 },
    { hour: '4h', activity: 12 },
    { hour: '6h', activity: 67 },
    { hour: '8h', activity: 234 },
    { hour: '10h', activity: 456 },
    { hour: '12h', activity: 378 },
    { hour: '14h', activity: 523 },
    { hour: '16h', activity: 678 },
    { hour: '18h', activity: 845 },
    { hour: '20h', activity: 987 },
    { hour: '22h', activity: 456 },
  ];

  // Recent activities table
  const recentActivities = [
    {
      key: '1',
      user: 'Nguyễn Văn A',
      action: 'Tạo nhóm học mới',
      category: 'Lập trình',
      time: '5 phút trước',
      status: 'active',
    },
    {
      key: '2',
      user: 'Trần Thị B',
      action: 'Tham gia cuộc gọi',
      category: 'Toán học',
      time: '12 phút trước',
      status: 'active',
    },
    {
      key: '3',
      user: 'Lê Văn C',
      action: 'Đăng bài tập mới',
      category: 'Ngoại ngữ',
      time: '23 phút trước',
      status: 'completed',
    },
    {
      key: '4',
      user: 'Phạm Thị D',
      action: 'Bình luận bài đăng',
      category: 'Khoa học',
      time: '35 phút trước',
      status: 'completed',
    },
    {
      key: '5',
      user: 'Hoàng Văn E',
      action: 'Gửi tin nhắn',
      category: 'Lập trình',
      time: '1 giờ trước',
      status: 'completed',
    },
  ];

  const activityColumns = [
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
      render: (text) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">{text.charAt(0)}</span>
          </div>
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Hoạt động',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Badge
          color="purple"
          text={category}
          className="text-sm"
        />
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      render: (time) => (
        <span className="text-gray-500 text-sm">{time}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 'active' ? 'processing' : 'success'}
          text={status === 'active' ? 'Đang diễn ra' : 'Hoàn thành'}
        />
      ),
    },
  ];

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50">
      {/* Header */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-[length:200%_100%] p-8 shadow-lg sticky top-0 z-10"
      >
        <div className="mx-auto">
          <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <Activity className="w-8 h-8" />
                  Bảng điều khiển Admin
                </h1>
                <p className="text-white/90">Tổng quan và phân tích hệ thống StudySync</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  icon={<DownloadOutlined />}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  Xuất báo cáo
                </Button>
                <Button
                  icon={<SettingOutlined />}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  Cài đặt
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <Select
                value={timeRange}
                onChange={setTimeRange}
                className="w-40"
                style={{ height: 40 }}
              >
                <Option value="24hours">24 giờ qua</Option>
                <Option value="7days">7 ngày qua</Option>
                <Option value="30days">30 ngày qua</Option>
                <Option value="90days">90 ngày qua</Option>
              </Select>

              <RangePicker className="h-10" />

              <Select
                value={selectedMetric}
                onChange={setSelectedMetric}
                className="w-48"
                style={{ height: 40 }}
              >
                <Option value="all">Tất cả chỉ số</Option>
                <Option value="users">Người dùng</Option>
                <Option value="groups">Nhóm học</Option>
                <Option value="activities">Hoạt động</Option>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center ${stat.textColor}`}>
                        {stat.icon}
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                        stat.isIncrease ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {stat.isIncrease ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span className="text-xs font-semibold">{stat.change}</span>
                      </div>
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium mb-2">{stat.title}</h3>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                    </div>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Growth Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">Tăng trưởng người dùng</span>
                  </div>
                }
                className="border-0 shadow-lg"
                extra={
                  <Dropdown
                    menu={{
                      items: [
                        { key: '1', label: 'Xem chi tiết' },
                        { key: '2', label: 'Xuất dữ liệu' },
                      ],
                    }}
                  >
                    <Button type="text" icon={<SettingOutlined />} />
                  </Dropdown>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowthData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                      name="Tổng người dùng"
                    />
                    <Area
                      type="monotone"
                      dataKey="newUsers"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorNew)"
                      name="Người dùng mới"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Activity Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold">Phân bố hoạt động</span>
                  </div>
                }
                className="border-0 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <ResponsiveContainer width="50%" height={300}>
                    <PieChart>
                      <Pie
                        data={activityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {activityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="flex-1 space-y-3">
                    {activityData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm text-gray-700">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">{item.value.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{item.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Group Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <TeamOutlined className="text-lg text-green-600" />
                    <span className="font-semibold">Thống kê nhóm học</span>
                  </div>
                }
                className="border-0 shadow-lg"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={groupStatsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="category" stroke="#888" />
                    <YAxis stroke="#888" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="groups" fill="#8b5cf6" name="Số nhóm" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="members" fill="#3b82f6" name="Thành viên" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>

            {/* Peak Hours */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span className="font-semibold">Giờ cao điểm</span>
                  </div>
                }
                className="border-0 shadow-lg"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={peakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" stroke="#888" />
                    <YAxis stroke="#888" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="activity"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', r: 5 }}
                      name="Hoạt động"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activities Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card
              title={
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Hoạt động gần đây</span>
                </div>
              }
              extra={
                <Button type="primary" icon={<EyeOutlined />} className="bg-gradient-to-r from-purple-600 to-blue-600 border-none">
                  Xem tất cả
                </Button>
              }
              className="border-0 shadow-lg"
            >
              <Table
                columns={activityColumns}
                dataSource={recentActivities}
                pagination={{ pageSize: 5, showSizeChanger: false }}
                className="custom-table"
              />
            </Card>
          </motion.div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="border-0 shadow-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Tỷ lệ hoàn thành</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-2">78.5%</div>
                  <Progress
                    percent={78.5}
                    strokeColor={{
                      '0%': '#10b981',
                      '100%': '#059669',
                    }}
                    showInfo={false}
                  />
                  <p className="text-xs text-gray-500 mt-2">Bài tập và mục tiêu học tập</p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-0 shadow-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Mức độ tương tác</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-2">92.3%</div>
                  <Progress
                    percent={92.3}
                    strokeColor={{
                      '0%': '#3b82f6',
                      '100%': '#0ea5e9',
                    }}
                    showInfo={false}
                  />
                  <p className="text-xs text-gray-500 mt-2">Người dùng hoạt động hàng ngày</p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="border-0 shadow-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">Hiệu suất hệ thống</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-2">99.2%</div>
                  <Progress
                    percent={99.2}
                    strokeColor={{
                      '0%': '#8b5cf6',
                      '100%': '#ec4899',
                    }}
                    showInfo={false}
                  />
                  <p className="text-xs text-gray-500 mt-2">Uptime và độ ổn định</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>

      <style jsx>{`
        .custom-table .ant-table-thead > tr > th {
          background: linear-gradient(to right, #f9fafb, #f3f4f6);
          font-weight: 600;
          color: #374151;
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background: #f9fafb;
        }
      `}</style>
    </div>
  );
}
