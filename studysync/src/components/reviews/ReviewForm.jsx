import React, { useState, useEffect } from 'react';
import { Modal, Form, Rate, Input, Button, message } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import reviewService from '../../services/reviewService';
import { toast } from 'react-hot-toast';

const { TextArea } = Input;

export default function ReviewForm({ mode = 'create', review = null, onSuccess, onCancel }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && review) {
      form.setFieldsValue({
        rating: review.rating,
        comment: review.comment || '',
      });
    } else {
      form.resetFields();
    }
  }, [mode, review, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (mode === 'create') {
        await reviewService.createReview({
          rating: values.rating,
          comment: values.comment || undefined,
        });
        toast.success('Đánh giá của bạn đã được gửi! Cảm ơn bạn đã chia sẻ.');
      } else {
        await reviewService.updateMyReview({
          rating: values.rating,
          comment: values.comment || undefined,
        });
        toast.success('Đánh giá đã được cập nhật!');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Review submit error:', error);
      const errorMessage = error.response?.data?.message || 
        (mode === 'create' 
          ? 'Không thể tạo đánh giá. Vui lòng thử lại.' 
          : 'Không thể cập nhật đánh giá. Vui lòng thử lại.');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <StarOutlined className="text-yellow-500" />
          <span>{mode === 'create' ? 'Viết đánh giá' : 'Chỉnh sửa đánh giá'}</span>
        </div>
      }
      open={true}
      onCancel={onCancel}
      footer={null}
      width={600}
      className="review-form-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          rating: review?.rating || 5,
          comment: review?.comment || '',
        }}
      >
        <Form.Item
          name="rating"
          label={
            <span className="text-base font-semibold">
              Đánh giá của bạn <span className="text-red-500">*</span>
            </span>
          }
          rules={[
            { required: true, message: 'Vui lòng chọn số sao đánh giá' },
          ]}
        >
          <Rate
            allowClear={false}
            className="text-2xl"
            tooltips={['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt']}
          />
        </Form.Item>

        <Form.Item
          name="comment"
          label={
            <span className="text-base font-semibold">
              Nhận xét của bạn
              <span className="text-gray-500 text-sm font-normal ml-2">(Tùy chọn, tối đa 1000 ký tự)</span>
            </span>
          }
          rules={[
            { max: 1000, message: 'Nhận xét không được vượt quá 1000 ký tự' },
          ]}
        >
          <TextArea
            rows={6}
            placeholder="Chia sẻ trải nghiệm của bạn về StudySync. Ví dụ: Tính năng bạn thích nhất, điều bạn muốn cải thiện, hoặc lời khuyên cho người dùng khác..."
            showCount
            maxLength={1000}
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex justify-end gap-3">
            <Button onClick={onCancel} disabled={loading}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {mode === 'create' ? 'Gửi đánh giá' : 'Cập nhật'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

