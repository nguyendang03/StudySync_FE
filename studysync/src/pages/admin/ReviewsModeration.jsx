import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Table, Card, Input, Select, Button, Tag, Badge, Space, Rate, Modal, Input as AntInput, Statistic, Row, Col, Empty, Avatar, Tooltip } from 'antd';
import { SearchOutlined, EyeOutlined, EyeInvisibleOutlined, MessageOutlined, DeleteOutlined, StarOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { Star, MessageSquare } from 'lucide-react';
import reviewService from '../../services/reviewService';
import { showToast } from '../../utils/toast';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = AntInput;

const ReviewsModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stars, setStars] = useState('all');
  const [query, setQuery] = useState('');
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [statsData, setStatsData] = useState({
    total: 0,
    visible: 0,
    hidden: 0,
    avgRating: 0,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = reviews;
    if (stars !== 'all') list = list.filter(r => Number(r.rating) === Number(stars));
    if (!q) return list;
    return list.filter(r => 
      `${r.user?.username || ''} ${r.comment || r.content || ''}`.toLowerCase().includes(q)
    );
  }, [reviews, stars, query]);

  const load = async (page = 1, limit = 50, rating = null) => {
    try {
      setLoading(true);
      const params = { page, limit };
      if (rating && rating !== 'all') params.rating = Number(rating);
      
      const res = await reviewService.getAllReviews(params);
      // Backend returns: { data: { items, total, page, limit, totalPages }, ... }
      const result = res?.data?.data || res?.data || res || {};
      const items = result.items || result.data || result || [];
      
      setReviews(Array.isArray(items) ? items : []);
      setPagination(prev => ({
        ...prev,
        current: result.page || page,
        total: result.total || items.length,
      }));
    } catch (e) {
      console.error('Load reviews error:', e);
      showToast.error('Không tải được danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await reviewService.getAdminStats();
      const stats = res?.data?.data || res?.data || res || {};
      setStatsData({
        total: stats.total || 0,
        visible: stats.visible || stats.public || 0,
        hidden: stats.hidden || stats.private || 0,
        avgRating: stats.avgRating || stats.averageRating || 0,
      });
    } catch (e) {
      console.error('Load stats error:', e);
      // Fallback to computed stats from reviews
      const total = reviews.length;
      const visible = reviews.filter(r => r.isPublic).length;
      const hidden = reviews.filter(r => !r.isPublic).length;
      const avgRating = total > 0 
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total).toFixed(1)
        : 0;
      setStatsData({ total, visible, hidden, avgRating: parseFloat(avgRating) });
    }
  };

  useEffect(() => {
    load();
    loadStats();
  }, []);

  useEffect(() => {
    // Reload when filter changes
    if (stars !== 'all') {
      load(1, pagination.pageSize, stars);
    } else {
      load(1, pagination.pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stars]);

  const onToggleVisibility = async (id, isPublic) => {
    try {
      await reviewService.toggleReviewVisibility(id, !isPublic);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, isPublic: !isPublic } : r));
      showToast.success('Cập nhật hiển thị thành công');
      // Reload stats after visibility change
      loadStats();
    } catch (e) {
      console.error('Toggle visibility error:', e);
      showToast.error('Thao tác thất bại');
    }
  };

  const onDelete = (review) => {
    Modal.confirm({
      title: 'Xác nhận xóa đánh giá',
      content: (
        <div>
          <p>Bạn có chắc muốn xóa đánh giá này?</p>
          <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
            <p style={{ margin: 0, fontSize: '13px' }}><strong>Người dùng:</strong> {review.user?.username || '-'}</p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}><strong>Nội dung:</strong> {(review.comment || review.content || '').substring(0, 100)}...</p>
          </div>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      width: 500,
      onOk: async () => {
        try {
          await reviewService.adminDeleteReview(review.id);
          setReviews(prev => prev.filter(r => r.id !== review.id));
          showToast.success('Đã xóa đánh giá');
          // Reload stats after deletion
          loadStats();
        } catch (e) {
          console.error('Delete review error:', e);
          showToast.error('Xóa thất bại');
        }
      },
    });
  };

  const openReplyModal = (review) => {
    setSelectedReview(review);
    setReplyText(review.adminReply || '');
    setReplyModalVisible(true);
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      showToast.error('Vui lòng nhập phản hồi');
      return;
    }
    try {
      await reviewService.adminReplyReview(selectedReview.id, replyText);
      setReviews(prev => prev.map(r => r.id === selectedReview.id ? { ...r, adminReply: replyText } : r));
      setReplyModalVisible(false);
      setReplyText('');
      showToast.success('Đã gửi phản hồi');
      // Reload to get updated data
      load(pagination.current, pagination.pageSize);
    } catch (e) {
      console.error('Reply error:', e);
      showToast.error('Gửi phản hồi thất bại');
    }
  };

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'user',
      key: 'user',
      width: 150,
      ellipsis: true,
      render: (user) => (
        <Tooltip title={user?.username || user?.name || '-'}>
          <Space size="small">
            <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#7269ef' }}>
              {user?.username?.charAt(0)?.toUpperCase() || '?'}
            </Avatar>
            <span style={{ fontWeight: 500 }}>
              {user?.username || user?.name || '-'}
            </span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 120,
      render: (rating) => (
        <div>
          <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} />
          <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: 4 }}>
            {rating} sao
          </div>
        </div>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: {
        showTitle: false,
      },
      render: (content, record) => {
        const comment = record.comment || record.content || content || '';
        return (
          <Tooltip title={comment}>
            <div>
              <div style={{ marginBottom: record.adminReply ? 8 : 0, lineHeight: '1.6', fontSize: '13px' }}>
                {comment}
              </div>
              {record.adminReply && (
                <Tag color="purple" icon={<MessageOutlined />} style={{ marginTop: 4, padding: '4px 8px', fontSize: '12px' }}>
                  <strong>Phản hồi:</strong> {record.adminReply}
                </Tag>
              )}
              {record.createdAt && (
                <div style={{ fontSize: '11px', color: '#8c8c8c', marginTop: 4 }}>
                  {dayjs(record.createdAt).format('DD/MM/YY HH:mm')}
                </div>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublic',
      key: 'isPublic',
      width: 100,
      render: (isPublic) => (
        <Badge
          status={isPublic ? 'success' : 'default'}
          text={isPublic ? 'Hiển thị' : 'Ẩn'}
        />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={record.isPublic ? 'Ẩn đánh giá' : 'Hiển thị đánh giá'}>
            <Button
              type={record.isPublic ? 'default' : 'primary'}
              icon={record.isPublic ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              size="small"
              onClick={() => onToggleVisibility(record.id, record.isPublic)}
            >
              {record.isPublic ? 'Ẩn' : 'Hiện'}
            </Button>
          </Tooltip>
          <Tooltip title="Phản hồi">
            <Button
              type="primary"
              icon={<MessageOutlined />}
              size="small"
              onClick={() => openReplyModal(record)}
            >
              Phản hồi
            </Button>
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => onDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Tổng đánh giá"
                  value={statsData.total}
                  prefix={<MessageSquare className="w-5 h-5" style={{ color: '#7269ef' }} />}
                  valueStyle={{ color: '#7269ef', fontWeight: 600 }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Điểm trung bình"
                  value={statsData.avgRating}
                  precision={1}
                  prefix={<StarOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14', fontWeight: 600 }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Đang hiển thị"
                  value={statsData.visible}
                  prefix={<EyeOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a', fontWeight: 600 }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Đã ẩn"
                  value={statsData.hidden}
                  prefix={<EyeInvisibleOutlined style={{ color: '#8c8c8c' }} />}
                  valueStyle={{ color: '#8c8c8c', fontWeight: 600 }}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Main Table Card */}
        <Card
          className="border-0 shadow-lg"
          title={
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-500" />
              <div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Quản lý đánh giá</h1>
                <p style={{ margin: '4px 0 0 0', color: '#8c8c8c', fontSize: '14px' }}>
                  Lọc theo sao, ẩn/hiện, trả lời, xóa.
                </p>
              </div>
            </div>
          }
          extra={
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  load();
                  loadStats();
                }}
                loading={loading}
              >
                Làm mới
              </Button>
              <Select
                value={stars}
                onChange={setStars}
                style={{ width: 150 }}
                placeholder="Lọc theo sao"
              >
                <Option value="all">Tất cả</Option>
                <Option value="5">5 sao</Option>
                <Option value="4">4 sao</Option>
                <Option value="3">3 sao</Option>
                <Option value="2">2 sao</Option>
                <Option value="1">1 sao</Option>
              </Select>
              <Input
                placeholder="Tìm theo nội dung/người dùng"
                prefix={<SearchOutlined />}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />
            </Space>
          }
          style={{ borderRadius: '16px' }}
        >
          <Table
            columns={columns}
            dataSource={filtered}
            loading={loading}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đánh giá`,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: (page, pageSize) => {
                setPagination(prev => ({ ...prev, current: page, pageSize }));
                load(page, pageSize, stars !== 'all' ? stars : null);
              },
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Không có đánh giá nào"
                />
              ),
            }}
          />
        </Card>
      </motion.div>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <MessageOutlined style={{ color: '#7269ef' }} />
            <span>Phản hồi đánh giá</span>
          </div>
        }
        open={replyModalVisible}
        onOk={handleReply}
        onCancel={() => {
          setReplyModalVisible(false);
          setReplyText('');
        }}
        okText="Gửi phản hồi"
        cancelText="Hủy"
        width={600}
      >
        {selectedReview && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              Đánh giá từ: {selectedReview.user?.username || '-'}
            </div>
            <Rate disabled defaultValue={selectedReview.rating} style={{ fontSize: 14, marginBottom: 8 }} />
            <div style={{ fontSize: '13px', color: '#595959' }}>{selectedReview.comment || selectedReview.content}</div>
          </div>
        )}
        <TextArea
          rows={4}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Nhập phản hồi của quản trị viên..."
          maxLength={500}
          showCount
        />
      </Modal>
    </div>
  );
};

export default ReviewsModeration;
