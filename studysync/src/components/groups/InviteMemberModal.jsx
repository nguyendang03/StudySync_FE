import React, { useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { UserAddOutlined, MailOutlined, MessageOutlined, SendOutlined, CloseOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast, commonToasts } from '../../utils/toast';
import groupService from '../../services/groupService';

const { TextArea } = Input;

export default function InviteMemberModal({ open, onClose, groupId, groupName, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log('📤 Sending invitation:', { groupId, ...values });
      
      await groupService.inviteMember(groupId, {
        memberEmail: values.email,
        message: values.message || undefined // Send undefined if empty
      });

      showToast.success(`Đã gửi lời mời tham gia nhóm đến ${values.email}`, {
        duration: 4000,
      });

      form.resetFields();
      onClose();
      
      // Call success callback to refresh data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Error sending invitation:', error);
      
      if (error.response?.status === 404) {
        showToast.error(`Không tìm thấy tài khoản với email ${values.email}`);
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || 'Người dùng đã là thành viên hoặc đã được mời';
        showToast.error(`Không thể gửi lời mời: ${errorMsg}`);
      } else {
        showToast.error('Lỗi gửi lời mời. ' + (error.message || 'Vui lòng thử lại'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <Modal
          title={null}
          open={open}
          onCancel={handleCancel}
          footer={null}
          width={560}
          centered
          destroyOnClose
          closeIcon={null}
          styles={{
            content: {
              borderRadius: '24px',
              overflow: 'hidden',
              padding: 0,
            },
            body: {
              padding: 0,
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 p-8 pb-12">
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                <CloseOutlined className="text-white text-sm" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                  <UserAddOutlined className="text-white text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Mời thành viên mới</h2>
                  <p className="text-purple-100 text-sm">Gửi lời mời tham gia nhóm học tập</p>
                </div>
              </div>
            </div>

            {/* Group Info Banner */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-8 py-4 border-b border-purple-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                <span className="text-sm text-gray-600">Nhóm:</span>
                <span className="text-sm font-semibold text-purple-700">{groupName}</span>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 bg-white">
              <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical"
                size="large"
              >
                {/* Email Input with enhanced styling */}
                <Form.Item
                  name="email"
                  label={
                    <span className="text-gray-800 font-semibold flex items-center gap-2 text-base">
                      <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                        <MailOutlined className="text-purple-600 text-sm" />
                      </div>
                      Email người dùng
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Vui lòng nhập email!' },
                    { 
                      type: 'email', 
                      message: 'Email không hợp lệ!' 
                    },
                    {
                      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: 'Email không đúng định dạng!'
                    }
                  ]}
                  className="mb-6"
                >
                  <Input
                    placeholder="Ví dụ: student@fpt.edu.vn"
                    className="h-12 rounded-xl border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-colors"
                    prefix={
                      <div className="mr-2 text-gray-400">
                        <MailOutlined />
                      </div>
                    }
                  />
                </Form.Item>

                {/* Optional Message Input */}
                <Form.Item
                  name="message"
                  label={
                    <span className="text-gray-800 font-semibold flex items-center gap-2 text-base">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MessageOutlined className="text-blue-600 text-sm" />
                      </div>
                      Lời nhắn
                      <span className="text-xs font-normal text-gray-400 ml-1">(tùy chọn)</span>
                    </span>
                  }
                >
                  <TextArea
                    placeholder={`Hãy tham gia nhóm "${groupName}" cùng học tập nhé! 📚`}
                    className="rounded-xl border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors"
                    rows={4}
                    maxLength={500}
                    showCount={{
                      formatter: ({ count, maxLength }) => (
                        <span className="text-xs text-gray-400">
                          {count}/{maxLength}
                        </span>
                      )
                    }}
                  />
                </Form.Item>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-8">
                  <Button
                    onClick={handleCancel}
                    className="flex-1 h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-semibold transition-all"
                    size="large"
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 rounded-xl shadow-lg hover:shadow-xl font-semibold transition-all"
                    size="large"
                    icon={loading ? null : <SendOutlined />}
                  >
                    {loading ? 'Đang gửi...' : 'Gửi lời mời'}
                  </Button>
                </div>

                {/* Info Text */}
                <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-xs text-gray-600 text-center leading-relaxed">
                    💡 <span className="font-medium">Mẹo:</span> Người dùng sẽ nhận được thông báo qua email và có thể chấp nhận lời mời trong phần Hồ sơ
                  </p>
                </div>
              </Form>
            </div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
