import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { UserAddOutlined, MailOutlined, MessageOutlined } from '@ant-design/icons';
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
        message: values.message || `Tôi muốn mời bạn tham gia nhóm "${groupName}"`
      });

      message.success(`Đã gửi lời mời đến ${values.email}`);
      form.resetFields();
      onClose();
      
      // Call success callback to refresh data
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Error sending invitation:', error);
      
      if (error.response?.status === 404) {
        message.error('Không tìm thấy người dùng với email này');
      } else if (error.response?.status === 400) {
        message.error(error.response?.data?.message || 'Người dùng đã là thành viên hoặc đã được mời');
      } else {
        message.error(error.message || 'Không thể gửi lời mời');
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
    <Modal
      title={
        <div className="flex items-center gap-3 text-xl font-bold">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <UserAddOutlined className="text-white text-xl" />
          </div>
          <div>
            <div>Mời thành viên</div>
            <div className="text-sm font-normal text-gray-500 mt-1">
              Nhóm: {groupName}
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={500}
      centered
      destroyOnClose
      styles={{
        content: {
          borderRadius: '16px',
          overflow: 'hidden'
        },
        header: {
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.05), rgba(59, 130, 246, 0.05))',
          borderBottom: '1px solid rgba(147, 51, 234, 0.1)',
          padding: '20px 24px'
        }
      }}
    >
      <div className="pt-6">
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label={
              <span className="text-gray-700 font-medium flex items-center gap-2">
                <MailOutlined className="text-purple-500" />
                Email người dùng
              </span>
            }
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input
              placeholder="example@email.com"
              className="rounded-xl border-gray-200 hover:border-purple-400 focus:border-purple-500"
              prefix={<MailOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            name="message"
            label={
              <span className="text-gray-700 font-medium flex items-center gap-2">
                <MessageOutlined className="text-blue-500" />
                Lời nhắn (tùy chọn)
              </span>
            }
          >
            <TextArea
              placeholder={`Hãy tham gia nhóm "${groupName}" của chúng tôi để cùng học tập!`}
              className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500"
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
            <Button
              onClick={handleCancel}
              className="flex-1 h-12 rounded-xl border-gray-300 hover:border-gray-400"
              size="large"
            >
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-blue-600 border-0 rounded-xl shadow-lg hover:shadow-xl"
              size="large"
              icon={<UserAddOutlined />}
            >
              {loading ? 'Đang gửi...' : 'Gửi lời mời'}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
