import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Rate, Button, Pagination, Select, Spin, Empty, Tag } from 'antd';
import { StarOutlined, MessageOutlined, UserOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import reviewService from '../../services/reviewService';
import ReviewForm from '../../components/reviews/ReviewForm';
import DeleteReviewModal from '../../components/reviews/DeleteReviewModal';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const { Option } = Select;

export default function Reviews() {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filterRating, setFilterRating] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [page, filterRating, isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load reviews
      const params = {
        page,
        limit,
        ...(filterRating && { rating: parseInt(filterRating) }),
      };
      
      const reviewsResponse = await reviewService.getReviews(params);
      
      // API response structure: { data: { data: { items, total, stats, ... }, statusCode, timestamp }, ... }
      const reviewsData = reviewsResponse?.data?.data || reviewsResponse?.data;
      
      if (reviewsData) {
        setReviews(reviewsData.items || []);
        setTotal(reviewsData.total || 0);
        setStats(reviewsData.stats || null);
      }

      // Load stats if not included
      if (!reviewsData?.stats) {
        try {
          const statsResponse = await reviewService.getReviewStats();
          // API response structure: { data: { data: { stats object }, statusCode, timestamp }, ... }
          const statsData = statsResponse?.data?.data || statsResponse?.data;
          if (statsData) {
            setStats(statsData);
          }
        } catch (err) {
          console.error('Failed to load stats:', err);
        }
      }

      // Load user's review if authenticated
      if (isAuthenticated) {
        try {
          const myReviewData = await reviewService.getMyReview();
          // API response structure: { data: { data: { review object }, statusCode, timestamp }, ... }
          // Handle case where user has no review (404 returns null)
          if (myReviewData) {
            const reviewData = myReviewData?.data?.data || myReviewData?.data || null;
            setMyReview(reviewData);
          } else {
            setMyReview(null);
          }
        } catch (err) {
          console.error('Failed to load my review:', err);
          setMyReview(null);
        }
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toast.error(error.response?.data?.message || 'Không thể tải đánh giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }
    if (myReview) {
      toast.error('Bạn đã có đánh giá. Vui lòng chỉnh sửa đánh giá hiện có.');
      setFormMode('edit');
      setShowForm(true);
      return;
    }
    setFormMode('create');
    setShowForm(true);
  };

  const handleEditReview = () => {
    setFormMode('edit');
    setShowForm(true);
  };

  const handleDeleteReview = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setMyReview(null);
    setShowForm(false);
    loadData();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    loadData();
  };

  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-purple-800 mb-4 flex items-center justify-center gap-3">
            <StarOutlined className="text-yellow-500" />
            Đánh giá từ người dùng
          </h1>
          <p className="text-gray-600 text-lg">
            Chia sẻ trải nghiệm của bạn về StudySync
          </p>
        </motion.div>

        {/* Stats Section */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {(() => {
                      const avgRating = Number(stats.averageRating);
                      return isNaN(avgRating) ? '0.0' : avgRating.toFixed(1);
                    })()}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Rate disabled value={Number(stats.averageRating) || 0} allowHalf />
                  </div>
                  <div className="text-sm opacity-90">Đánh giá trung bình</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{stats.total || 0}</div>
                  <div className="text-sm opacity-90">Tổng số đánh giá</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {stats.total > 0 ? Math.round((stats.stars?.[5] || 0) / stats.total * 100) : 0}%
                  </div>
                  <div className="text-sm opacity-90">Khuyến nghị</div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* My Review Section */}
        {isAuthenticated && myReview && !showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card
              className="shadow-lg border-2 border-purple-200"
              title={
                <div className="flex items-center gap-2">
                  <UserOutlined className="text-purple-600" />
                  <span className="font-semibold">Đánh giá của tôi</span>
                </div>
              }
              extra={
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEditReview}
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteReview}
                  >
                    Xóa
                  </Button>
                </div>
              }
            >
              <div className="flex items-start gap-4">
                <Rate disabled value={myReview.rating} className="text-lg" />
                <div className="flex-1">
                  {myReview.comment && (
                    <p className="text-gray-700 mb-2">{myReview.comment}</p>
                  )}
                  <div className="text-sm text-gray-500">
                    {formatDate(myReview.createdAt)}
                  </div>
                  {myReview.adminReply && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="font-semibold text-blue-700 mb-1">Phản hồi từ quản trị viên:</div>
                      <div className="text-blue-600">{myReview.adminReply}</div>
                      {myReview.repliedAt && (
                        <div className="text-xs text-blue-500 mt-1">
                          {formatDate(myReview.repliedAt)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Create Review Button */}
        {isAuthenticated && !myReview && !showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 text-center"
          >
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreateReview}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Viết đánh giá
            </Button>
          </motion.div>
        )}

        {/* Review Form Modal */}
        {showForm && (
          <ReviewForm
            mode={formMode}
            review={myReview}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Delete Review Modal */}
        {showDeleteModal && (
          <DeleteReviewModal
            review={myReview}
            open={showDeleteModal}
            onSuccess={handleDeleteSuccess}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}

        {/* Filters */}
        <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
          <Select
            value={filterRating || 'all'}
            onChange={(value) => {
              setFilterRating(value === 'all' ? null : value);
              setPage(1);
            }}
            style={{ width: 150 }}
            placeholder="Lọc theo đánh giá"
          >
            <Option value="all">Tất cả</Option>
            <Option value="5">5 sao</Option>
            <Option value="4">4 sao</Option>
            <Option value="3">3 sao</Option>
            <Option value="2">2 sao</Option>
            <Option value="1">1 sao</Option>
          </Select>
          <div className="text-gray-600">
            Hiển thị {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} / {total} đánh giá
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <Empty
              description="Chưa có đánh giá nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <div className="space-y-4 mb-8">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-semibold">
                        {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {review.user?.name || 'Người dùng ẩn danh'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Rate disabled value={review.rating} className="text-sm" />
                          <Tag color={review.rating >= 4 ? 'green' : review.rating >= 3 ? 'gold' : 'red'}>
                            {review.rating} sao
                          </Tag>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                          {review.comment}
                        </p>
                      )}
                      {review.adminReply && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <div className="font-semibold text-blue-700 mb-1 flex items-center gap-2">
                            <MessageOutlined />
                            Phản hồi từ quản trị viên:
                          </div>
                          <div className="text-blue-600">{review.adminReply}</div>
                          {review.repliedAt && (
                            <div className="text-xs text-blue-500 mt-1">
                              {formatDate(review.repliedAt)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex justify-center">
            <Pagination
              current={page}
              total={total}
              pageSize={limit}
              onChange={setPage}
              showSizeChanger={false}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} / ${total} đánh giá`
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

