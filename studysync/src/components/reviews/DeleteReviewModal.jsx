import React, { useState } from 'react';
import { Modal, Button } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import reviewService from '../../services/reviewService';
import showToast from '../../utils/toast';

export default function DeleteReviewModal({ review, open, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await reviewService.deleteMyReview();
      showToast.success('Đánh giá đã được xóa thành công');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Delete review error:', error);
      const errorMessage = error.response?.data?.message || 
        'Không thể xóa đánh giá. Vui lòng thử lại.';
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-red-600">
          <ExclamationCircleOutlined className="text-2xl" />
          <span className="text-xl font-semibold">Xác nhận xóa đánh giá</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={500}
      centered
    >
      <div className="py-4">
        {/* Warning message */}
        <div className="mb-6">
          <p className="text-gray-700 text-base mb-4">
            Bạn có chắc chắn muốn xóa đánh giá này không?
          </p>
          
          {/* Review preview */}
          {review && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-700">Đánh giá của bạn:</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, index) => (
                    <span
                      key={index}
                      className={`text-lg ${
                        index < review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">({review.rating} sao)</span>
              </div>
              
              {review.comment && (
                <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                  "{review.comment}"
                </p>
              )}
              
              {review.createdAt && (
                <p className="text-xs text-gray-500 mt-2">
                  Đánh giá vào: {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Warning notice */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-start">
            <ExclamationCircleOutlined className="text-red-500 text-lg mt-0.5 mr-3" />
            <div>
              <p className="font-semibold text-red-800 mb-1">Lưu ý quan trọng:</p>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Đánh giá sẽ bị xóa vĩnh viễn và không thể khôi phục</li>
                <li>• Bạn có thể tạo đánh giá mới sau khi xóa</li>
                <li>• Hành động này không thể hoàn tác</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={onCancel}
            disabled={loading}
            size="large"
          >
            Hủy bỏ
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            loading={loading}
            size="large"
          >
            Xác nhận xóa
          </Button>
        </div>
      </div>
    </Modal>
  );
}
