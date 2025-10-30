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
import { Card, Select, DatePicker, Button, Table, Badge, Progress, Dropdown, Tooltip, Statistic, Tag } from 'antd';
import paymentService from '../../services/paymentService';
import reviewService from '../../services/reviewService';
import adminService from '../../services/adminService';
import {
  BarChart,
  Bar,
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
  const [payments, setPayments] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ total: 0, stars: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [loadingKpis, setLoadingKpis] = useState(false);
  const [subscriptionByPlan, setSubscriptionByPlan] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [selectedStarFilter, setSelectedStarFilter] = useState('all');
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadKpis = async () => {
      try {
        setLoadingKpis(true);
        // Use local variables to avoid stale state fallback overriding correct values
        let computedRevenue = null;
        let computedTransactions = null;

        // Prefer admin aggregates when available
        try {
          const dash = await adminService.getDashboard();
          const d = dash?.data?.data || dash?.data || dash || {};
          console.log(d);
          if (typeof d.totalRevenue === 'number') computedRevenue = d.totalRevenue;
          if (typeof d.subscriptionStats?.total === 'number') computedTransactions = d.subscriptionStats.total;
          if (Array.isArray(d.subscriptionStats?.byPlan)) setSubscriptionByPlan(d.subscriptionStats.byPlan);
          if (d.reviewStats) {
            const dist = d.reviewStats.distribution || {};
            setReviewStats({
              total: d.reviewStats.totalReviews ?? d.reviewStats.publicReviews ?? 0,
              stars: { 5: dist[5] ?? 0, 4: dist[4] ?? 0, 3: dist[3] ?? 0, 2: dist[2] ?? 0, 1: dist[1] ?? 0 },
            });
          }
        } catch {}

        try {
          const subsStats = await adminService.getSubscriptionStats();
          const s = subsStats?.data?.data || subsStats?.data || subsStats || {};
          if (s.totalRevenue != null && computedRevenue == null) computedRevenue = s.totalRevenue;
          if (s.totalTransactions != null && computedTransactions == null) computedTransactions = s.totalTransactions;
          if (Array.isArray(s.byPlan) && subscriptionByPlan.length === 0) setSubscriptionByPlan(s.byPlan);
        } catch {}

        // Always fetch recent transactions for the table/section
        try {
          const pay = await paymentService.getPaymentHistory();
          const payData = pay?.data?.data || pay?.data || pay || [];
          const list = Array.isArray(payData) ? payData : [];
          setPayments(list);
          const paidOnly = list.filter(p => (p.status || p?.data?.status || '').toString().toUpperCase() === 'PAID' || (p.status || '').toString().toLowerCase() === 'success');
          if (computedRevenue == null) computedRevenue = paidOnly.reduce((sum, p) => sum + (p.amount || p?.data?.amount || 0), 0);
          if (computedTransactions == null) computedTransactions = paidOnly.length;
        } catch {
          // ignore, KPIs may still be set from admin stats
        }

        // Finally set state once (only if still mounted)
        if (isMounted) {
          setRevenue(computedRevenue ?? 0);
          setTransactionsCount(computedTransactions ?? 0);
        }

        // Reviews (optional backend)
        try {
          const rev = await reviewService.getReviews({ limit: 20 });
          const listWrap = rev?.data?.data || rev?.data || rev || [];
          if (isMounted) setReviews(Array.isArray(listWrap?.items) ? listWrap.items : (Array.isArray(listWrap) ? listWrap : []));
        } catch (_) {
          if (isMounted) setReviews(prev => prev);
        }
        try {
          // Prefer admin review stats if available
          let stats = null;
          try {
            stats = await adminService.getAdminReviewStats();
          } catch {
            stats = await reviewService.getReviewStats();
          }
          const s = stats?.data?.data || stats?.data || stats || {};
          if (isMounted && (s.total != null || s.stars)) {
            setReviewStats(prev => ({
              total: s.total ?? prev.total ?? 0,
              stars: s.stars ?? prev.stars ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            }));
          }
        } catch (_) {
          // keep previous stats on error
        }
      } finally {
        if (isMounted) setLoadingKpis(false);
      }
    };
    loadKpis();
    return () => { isMounted = false; };
  }, []);

  const loadFilteredReviews = async (stars) => {
    try {
      setLoadingReviews(true);
      const response = await reviewService.getReviewsByStars(stars === 'all' ? undefined : stars, 20);
      const reviewsData = response?.data?.data?.items || response?.data?.data || response?.data || response || [];
      const list = Array.isArray(reviewsData) ? reviewsData : [];
      const normalized = list.map((r, idx) => ({
        id: r.id || idx,
        user: { name: r?.user?.username || r?.user?.name || r?.user?.email || r?.user?.fullName || '—' },
        rating: r?.rating ?? r?.stars ?? 0,
        content: r?.comment ?? r?.content ?? '',
        createdAt: r?.createdAt ?? r?.updatedAt ?? null,
      }));
      setFilteredReviews(normalized);
    } catch (error) {
      console.error('Failed to load filtered reviews:', error);
      setFilteredReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadFilteredReviews(selectedStarFilter);
  }, [selectedStarFilter]);

  // Normalize payments for table display
  const normalizePayment = (p, idx) => {
    const orderCode = p?.orderCode ?? p?.data?.orderCode ?? p?.code ?? p?.id ?? `order-${idx}`;
    const planName = p?.planName ?? p?.plan?.name ?? p?.data?.planName ?? p?.subscription?.plan?.name ?? '-';
    const amount = p?.amount ?? p?.data?.amount ?? p?.total ?? 0;
    const status = (p?.status ?? p?.data?.status ?? '').toString().toUpperCase();
    const createdAt = p?.createdAt ?? p?.data?.createdAt ?? p?.timestamp ?? p?.paidAt ?? null;
    return { key: orderCode, orderCode, planName, amount, status, createdAt };
  };

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
        <div className="p-8 space-y-10">
          {/* Section: KPIs */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Hiệu suất tổng quan
              </h2>
              <p className="text-sm text-gray-500">Các chỉ số chính trong hệ thống</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="shadow-lg border-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center">
                    <span className="text-lg font-semibold">₫</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Doanh thu</div>
                    <div className="text-2xl font-bold text-gray-900">{revenue.toLocaleString('vi-VN')} VND</div>
                  </div>
                </div>
              </Card>
              <Card className="shadow-lg border-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center">
                    <CheckCircleOutlined />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Số lượng giao dịch</div>
                    <div className="text-2xl font-bold text-gray-900">{transactionsCount.toLocaleString('vi-VN')}</div>
                  </div>
                </div>
              </Card>
              <Card className="shadow-lg border-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Số lượng review</div>
                    <div className="text-2xl font-bold text-gray-900">{(reviewStats.total || 0).toLocaleString('vi-VN')}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {[5,4,3,2,1].map(star => (
                        <Tag key={star} color={star >= 4 ? 'green' : star === 3 ? 'gold' : 'red'}>{star}★ {reviewStats.stars[star] || 0}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>


          {/* Section: Subscriptions by Plan */}
          <div>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <TeamOutlined className="text-lg text-green-600" />
                Đăng ký theo gói
              </h2>
              <p className="text-sm text-gray-500">Số lượng đăng ký đang hoạt động theo từng gói</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
              {/* Subscriptions by Plan (bound to backend) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <TeamOutlined className="text-lg text-green-600" />
                    <span className="font-semibold">Gói đăng ký theo gói</span>
                  </div>
                }
                className="border-0 shadow-lg"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subscriptionByPlan.map(p => ({
                    planName: p.planName,
                    active: p.activeSubscriptions ?? 0,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="planName" stroke="#888" />
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
                    <Bar dataKey="active" fill="#8b5cf6" name="Đang hoạt động" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
            
              {/* Removed peak hours mock chart */}
            </div>
          </div>

          {/* Section: Reviews */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Đánh giá
            </h2>
            <p className="text-sm text-gray-500">Tổng quan và danh sách đánh giá theo mức sao</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Reviews Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold">Thống kê đánh giá</span>
                  </div>
                }
                className="border-0 shadow-lg"
              >
                <div className="space-y-4">
                  <div className="text-center">
                    <Statistic
                      title="Tổng số đánh giá"
                      value={reviewStats.total}
                      valueStyle={{ color: '#8b5cf6', fontSize: '24px' }}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviewStats.stars[stars] || 0;
                      const percentage = reviewStats.total > 0 ? (count / reviewStats.total * 100).toFixed(1) : 0;
                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-12">
                            <span className="text-sm font-medium">{stars}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                          <Progress
                            percent={percentage}
                            strokeColor={stars >= 4 ? '#10b981' : stars >= 3 ? '#f59e0b' : '#ef4444'}
                            showInfo={false}
                            size="small"
                          />
                          <div className="text-sm text-gray-600 w-16 text-right">
                            {count} ({percentage}%)
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Reviews Filter Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <FilterOutlined className="text-lg text-blue-600" />
                    <span className="font-semibold">Đánh giá theo sao</span>
                  </div>
                }
                extra={
                  <Select
                    value={selectedStarFilter}
                    onChange={setSelectedStarFilter}
                    style={{ width: 120 }}
                    size="small"
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="5">5 sao</Option>
                    <Option value="4">4 sao</Option>
                    <Option value="3">3 sao</Option>
                    <Option value="2">2 sao</Option>
                    <Option value="1">1 sao</Option>
                  </Select>
                }
                className="border-0 shadow-lg"
              >
                <Table
                  columns={[
                    {
                      title: 'Người dùng',
                      dataIndex: 'user',
                      key: 'user',
                      render: (user) => (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {user?.name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-sm">{user?.name || 'Người dùng'}</span>
                        </div>
                      ),
                    },
                    {
                      title: 'Đánh giá',
                      dataIndex: 'rating',
                      key: 'rating',
                      render: (rating) => (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="ml-1 text-sm text-gray-600">({rating})</span>
                        </div>
                      ),
                    },
                    {
                      title: 'Nội dung',
                      dataIndex: 'content',
                      key: 'content',
                      render: (content) => (
                        <div className="max-w-xs truncate text-sm" title={content}>
                          {content || 'Không có nội dung'}
                        </div>
                      ),
                    },
                    {
                      title: 'Thời gian',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (date) => (
                        <span className="text-sm text-gray-600">
                          {date ? new Date(date).toLocaleDateString('vi-VN') : '-'}
                        </span>
                      ),
                    },
                  ]}
                  dataSource={filteredReviews}
                  loading={loadingReviews}
                  pagination={{ pageSize: 5, showSizeChanger: false }}
                  className="custom-table"
                  rowKey="id"
                />
              </Card>
            </motion.div>
          </div>

          {/* Section: Recent Payments */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Giao dịch gần đây</h2>
            <p className="text-sm text-gray-500">Theo dõi các thanh toán mới nhất</p>
          </div>
          {/* Recent Payments Table (bound to backend) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card
              title={
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Giao dịch gần đây</span>
                </div>
              }
              className="border-0 shadow-lg"
              extra={
                <Button onClick={async () => {
                  try {
                    // Prefer admin endpoint if available
                    let recent = null;
                    try {
                      const dash = await adminService.getDashboard();
                      const paymentsRaw = dash?.data?.recentPayments || dash?.recentPayments || [];
                      recent = Array.isArray(paymentsRaw) ? paymentsRaw : [];
                    } catch {
                      const hist = await paymentService.getPaymentHistory();
                      const list = hist?.data || hist || [];
                      recent = Array.isArray(list) ? list : [];
                    }
                    setPayments(recent);
                  } catch {}
                }}>Làm mới</Button>
              }
            >
              <Table
                columns={[
                  { title: 'Mã đơn', dataIndex: 'orderCode', key: 'orderCode' },
                  { title: 'Gói', dataIndex: 'planName', key: 'planName' },
                  { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: (v) => (v || 0).toLocaleString('vi-VN') + ' VND' },
                  { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (s) => (
                    <Badge status={s === 'PAID' ? 'success' : s === 'PENDING' ? 'processing' : 'error'} text={s} />
                  )},
                  { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', render: (d) => d ? new Date(d).toLocaleString('vi-VN') : '-' },
                ]}
                dataSource={(Array.isArray(payments) ? payments : []).map(normalizePayment)}
                pagination={{ pageSize: 5, showSizeChanger: false }}
                className="custom-table"
                rowKey={(row) => row.orderCode}
              />
            </Card>
          </motion.div>

          {/* Removed mock Recent Activities Table (fully) */}
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
