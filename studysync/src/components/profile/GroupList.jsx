import React, { useState } from 'react';
import { PlusOutlined, TeamOutlined, BookOutlined, CloseOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal, Form, Input, Button, message } from 'antd';
import toast from 'react-hot-toast';

export default function GroupList() {
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'Tung Tung Tung Sahur',
      subject: 'EXE101',
      status: 'VÀO XEM',
      members: 6,
      progress: 75
    }
    // You can add more groups here
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form] = Form.useForm();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGroup = () => {
    setShowCreateForm(true);
  };

  const handleCreateSubmit = async (values) => {
    setIsCreating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newGroup = {
        id: groups.length + 1,
        name: values.groupName,
        subject: values.subject,
        status: 'VÀO XEM',
        members: 1,
        progress: 0
      };
      
      setGroups([...groups, newGroup]);
      setShowCreateForm(false);
      form.resetFields();
      toast.success('Tạo nhóm thành công!');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tạo nhóm!');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    form.resetFields();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'VÀO XEM':
        return 'bg-pink-100 text-pink-600';
      case 'EXE101':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <TeamOutlined className="text-purple-600 text-3xl" />
          Danh sách nhóm
        </h2>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateGroup}
            className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 rounded-xl h-10 px-6 shadow-lg hover:shadow-xl"
            size="large"
          >
            Tạo nhóm mới
          </Button>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
      >
        {/* Table Header */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-6 py-4 border-b border-purple-100">
          <div className="grid grid-cols-5 gap-4 font-semibold text-gray-700">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              STT
            </div>
            <div>Tên nhóm</div>
            <div>Môn học</div>
            <div>Thành viên</div>
            <div>Hành động</div>
          </div>
        </div>
        
        {/* Table Body */}
        <AnimatePresence>
          <div className="divide-y divide-gray-100">
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ backgroundColor: 'rgba(147, 51, 234, 0.02)' }}
                className="px-6 py-4 transition-all duration-200"
              >
                <div className="grid grid-cols-5 gap-4 items-center">
                  {/* STT */}
                  <div className="text-gray-600 font-medium flex items-center gap-3">
                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>
                  
                  {/* Group Name */}
                  <div className="text-gray-900 font-medium">
                    <div className="flex items-center gap-2">
                      <BookOutlined className="text-purple-500" />
                      {group.name}
                    </div>
                  </div>
                  
                  {/* Subject */}
                  <div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(group.subject)}`}>
                      {group.subject}
                    </span>
                  </div>
                  
                  {/* Members */}
                  <div className="flex items-center gap-2">
                    <TeamOutlined className="text-gray-400" />
                    <span className="text-gray-600">{group.members} thành viên</span>
                  </div>
                  
                  {/* Actions */}
                  <div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                    >
                      {group.status}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
        
        {/* Empty State */}
        {groups.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-16 text-center"
          >
            <motion.div 
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="text-purple-400 mb-6"
            >
              <TeamOutlined className="text-6xl" />
            </motion.div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có nhóm nào</h3>
            <p className="text-gray-500 mb-8">Bạn chưa tham gia hoặc tạo nhóm học nào.</p>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateGroup}
              className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 rounded-xl h-10 px-6"
              size="large"
            >
              Tạo nhóm đầu tiên
            </Button>
          </motion.div>
        )}
        
        {/* Footer */}
        {groups.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Hiển thị {groups.length} nhóm
              </div>
              <button className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors">
                HIỂN THỊ THÊM...
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Enhanced Create Group Modal using Ant Design */}
      <Modal
        title={
          <div className="flex items-center gap-3 text-xl font-bold">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <PlusOutlined className="text-white" />
            </div>
            Tạo nhóm mới
          </div>
        }
        open={showCreateForm}
        onCancel={handleCancel}
        footer={null}
        width={500}
        centered
        destroyOnClose
        className="custom-modal"
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
            onFinish={handleCreateSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="groupName"
              label={
                <span className="text-gray-700 font-medium flex items-center gap-2">
                  <BookOutlined className="text-purple-500" />
                  Tên nhóm
                </span>
              }
              rules={[
                { required: true, message: 'Vui lòng nhập tên nhóm!' },
                { min: 3, message: 'Tên nhóm phải có ít nhất 3 ký tự!' }
              ]}
            >
              <Input
                placeholder="Nhập tên nhóm học tập"
                className="rounded-xl border-gray-200 hover:border-purple-400 focus:border-purple-500"
                prefix={<TeamOutlined className="text-gray-400" />}
              />
            </Form.Item>
            
            <Form.Item
              name="subject"
              label={
                <span className="text-gray-700 font-medium flex items-center gap-2">
                  <BookOutlined className="text-blue-500" />
                  Mã môn học
                </span>
              }
              rules={[
                { required: true, message: 'Vui lòng nhập mã môn học!' },
                { pattern: /^[A-Z]{2,3}[0-9]{3}$/, message: 'Mã môn học không đúng định dạng (VD: EXE101)!' }
              ]}
            >
              <Input
                placeholder="VD: EXE101, SWP391, WDP301"
                className="rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500"
                style={{ textTransform: 'uppercase' }}
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
                loading={isCreating}
                className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-blue-600 border-0 rounded-xl shadow-lg hover:shadow-xl"
                size="large"
              >
                {isCreating ? 'Đang tạo...' : 'Tạo nhóm'}
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </motion.div>
  );
}