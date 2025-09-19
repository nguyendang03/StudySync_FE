import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, Card, Divider } from 'antd';
import { TeamOutlined, BookOutlined, FileTextOutlined, CloseOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

export default function CreateGroupModal({ isOpen, onClose, onCreateGroup }) {
  const [form] = Form.useForm();

  const subjects = [
    'EXE101',
    'PRN212',
    'SWP391',
    'PRO192',
    'MAD101',
    'OSG202',
    'NJS1804',
    'WED201c'
  ];

  const handleSubmit = (values) => {
    onCreateGroup({
      groupName: values.groupName,
      subject: values.subject,
      description: values.description
    });
    form.resetFields();
    onClose();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={null}
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
      destroyOnClose
      className="create-group-modal"
      closeIcon={<CloseOutlined style={{ color: 'white', fontSize: '18px' }} />}
    >
      {/* Custom Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 -m-6 mb-6 p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <TeamOutlined style={{ fontSize: '28px', color: 'white' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Tạo mới một nhóm</h2>
            <p className="text-white/80 text-sm">Tạo nhóm học tập để cùng học và chia sẻ kiến thức</p>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          subject: 'EXE101'
        }}
        className="px-2"
      >
        {/* Group Information Card */}
        <Card 
          className="mb-6 shadow-lg border-0"
          style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <BookOutlined style={{ fontSize: '18px', color: '#7c3aed' }} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 m-0">Thông tin cơ bản</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Group Name */}
            <Form.Item
              label={
                <span className="font-semibold text-gray-700 flex items-center">
                  <TeamOutlined className="mr-2 text-purple-600" />
                  Tên nhóm
                </span>
              }
              name="groupName"
              rules={[
                { required: true, message: 'Vui lòng nhập tên nhóm!' },
                { min: 3, message: 'Tên nhóm phải có ít nhất 3 ký tự!' }
              ]}
            >
              <Input
                placeholder="Nhập tên nhóm của bạn..."
                size="large"
                className="rounded-xl shadow-sm hover:shadow-md transition-shadow"
                style={{ 
                  borderColor: '#e2e8f0',
                  padding: '12px 16px',
                  fontSize: '15px'
                }}
              />
            </Form.Item>

            {/* Subject */}
            <Form.Item
              label={
                <span className="font-semibold text-gray-700 flex items-center">
                  <BookOutlined className="mr-2 text-purple-600" />
                  Môn học
                </span>
              }
              name="subject"
              rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
            >
              <Select
                placeholder="Chọn môn học"
                size="large"
                className="rounded-xl"
                style={{ 
                  borderRadius: '12px'
                }}
                dropdownStyle={{ 
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}
              >
                {subjects.map((subject) => (
                  <Option key={subject} value={subject}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{subject}</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs">
                        Môn học
                      </span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          {/* Subject Preview */}
          <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.subject !== currentValues.subject}>
            {({ getFieldValue }) => {
              const selectedSubject = getFieldValue('subject');
              return selectedSubject ? (
                <div className="mt-4 p-4 bg-white rounded-xl border border-purple-200">
                  <span className="text-sm font-medium text-gray-600 block mb-3">Xem trước môn học:</span>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full text-sm font-semibold shadow-lg">
                      {selectedSubject}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      Badge hiển thị
                    </span>
                  </div>
                </div>
              ) : null;
            }}
          </Form.Item>
        </Card>

        {/* Description Card */}
        <Card 
          className="mb-6 shadow-lg border-0"
          style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileTextOutlined style={{ fontSize: '18px', color: '#3b82f6' }} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 m-0">Mô tả nhóm</h3>
          </div>

          <Form.Item
            name="description"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả nhóm!' },
              { min: 20, message: 'Mô tả phải có ít nhất 20 ký tự!' }
            ]}
          >
            <TextArea
              placeholder="Mô tả chi tiết về nhóm học tập của bạn. Ví dụ: mục tiêu học tập, phương pháp học, thời gian hoạt động..."
              rows={5}
              className="rounded-xl shadow-sm hover:shadow-md transition-shadow"
              showCount
              maxLength={500}
              style={{ 
                borderColor: '#e2e8f0',
                padding: '16px',
                fontSize: '15px',
                lineHeight: '1.6'
              }}
            />
          </Form.Item>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 pt-4">
          <Button
            size="large"
            onClick={handleCancel}
            className="px-8 py-6 h-auto rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              minWidth: '120px'
            }}
          >
            <CloseOutlined className="mr-2" />
            Hủy bỏ
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="px-8 py-6 h-auto rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              minWidth: '120px'
            }}
          >
            <TeamOutlined className="mr-2" />
            Tạo nhóm
          </Button>
        </div>
      </Form>

      <style jsx>{`
        .create-group-modal .ant-modal-content {
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .create-group-modal .ant-modal-header {
          display: none;
        }
        .create-group-modal .ant-modal-close {
          top: 20px;
          right: 20px;
          z-index: 10;
        }
        .create-group-modal .ant-input:focus,
        .create-group-modal .ant-select-focused .ant-select-selector {
          border-color: #7c3aed !important;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1) !important;
        }
        .create-group-modal .ant-form-item-label > label {
          height: auto;
          margin-bottom: 8px;
        }
        .create-group-modal .ant-btn:hover {
          transform: translateY(-1px);
        }
        .create-group-modal .ant-card {
          border: 1px solid #e2e8f0;
        }
        .create-group-modal .ant-select-dropdown {
          border-radius: 12px;
        }
      `}</style>
    </Modal>
  );
}