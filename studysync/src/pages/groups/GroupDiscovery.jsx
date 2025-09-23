import React, { useState, useEffect } from 'react';
import { SearchOutlined, DownOutlined, UsergroupAddOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import CreateGroupModal from '../../components/groups/CreateGroupModal';

export default function GroupDiscovery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'Americano',
      subject: 'EXE101',
      description: 'JobBoost là nền tảng kết nối giữa người cần tuyển nhân sự với các công việc ngành hàn và sinh viên có năng lực thực hiện. Bất kỳ ai cũng có thể đăng ký tìm người làm, lộn chỉ sinh viên mà có thể ứng tuyển và thực hiện công việc.',
      subjectColor: 'bg-purple-600',
      members: 24,
      category: 'Lập trình'
    },
    {
      id: 2,
      name: 'Balerina Cappuchina',
      subject: 'EXE101',
      description: 'JobBoost là nền tảng kết nối giữa người cần tuyển nhân sự với các công việc ngành hàn và sinh viên có năng lực thực hiện. Bất kỳ ai cũng có thể đăng ký tìm người làm, lộn chỉ sinh viên mà có thể ứng tuyển và thực hiện công việc.',
      subjectColor: 'bg-purple-600',
      members: 18,
      category: 'Thiết kế'
    },
    {
      id: 3,
      name: 'IShowSpeed',
      subject: 'EXE101',
      description: 'Khóa học lập trình an toàn được thiết kế dành cho sinh viên CNTT và lập trình viên kỹ thuật trang bị kỹ đây bảo mật và kỹ năng lập trình an toàn ngay từ đầu. Khóa học các chức năng cơ bản và bảo mật trong xây dựng ứng dụng web.',
      subjectColor: 'bg-purple-600',
      members: 31,
      category: 'Bảo mật'
    }
  ]);
  const navigate = useNavigate();

  const handleViewGroup = (groupId) => {
    navigate(`/groups/${groupId}`);
  };

  const handleCreateGroup = (groupData) => {
    const newGroup = {
      id: groups.length + 1,
      name: groupData.groupName,
      subject: groupData.subject,
      description: groupData.description,
      subjectColor: 'bg-purple-600',
      members: 1, // Creator is the first member
      category: 'Mới tạo'
    };
    setGroups(prev => [newGroup, ...prev]);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const visibleGroups = showMore ? groups : groups.slice(0, 3);

  return (
    <>
      <Header />
      <div 
        className="min-h-screen p-8" 
        style={{ background: 'linear-gradient(135deg, #A640A0, #6D17AE)' }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Page Title */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Khám phá nhóm học tập
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-white/80"
            >
              Tìm kiếm và tham gia các nhóm học tập phù hợp với bạn
            </motion.p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center space-x-4">
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white/20 text-white rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm font-medium shadow-lg"
              >
                <UsergroupAddOutlined className="mr-2" style={{ fontSize: '16px' }} />
                Danh sách nhóm
              </motion.button>
              <motion.button 
                onClick={handleOpenCreateModal}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-white text-purple-600 rounded-full hover:bg-gray-100 transition-all duration-300 font-medium shadow-lg"
              >
                <PlusOutlined className="mr-2" style={{ fontSize: '16px' }} />
                Tạo nhóm
              </motion.button>
            </div>
            
            <div className="relative">
              <SearchOutlined 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70" 
                style={{ fontSize: '18px' }}
              />
              <input
                type="text"
                placeholder="Bạn tìm nhóm nào?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-white/20 text-white placeholder-white/70 rounded-full border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 w-96 backdrop-blur-sm transition-all duration-300"
              />
            </div>
          </motion.div>

          {/* Groups List */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-lg"
          >
            <div className="p-8">
              <div className="space-y-6">
                {visibleGroups.map((group, index) => (
                  <motion.div 
                    key={group.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                    whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Group Header */}
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-2xl font-bold text-gray-800">
                            {group.name}
                          </h3>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500 flex items-center">
                              <UsergroupAddOutlined className="mr-1" style={{ fontSize: '14px' }} />
                              {group.members} thành viên
                            </span>
                          </div>
                        </div>
                        
                        {/* Subject and Category Badges */}
                        <div className="flex items-center space-x-3 mb-4">
                          <span className={`inline-flex px-4 py-2 rounded-full text-white font-medium ${group.subjectColor} shadow-md`}>
                            {group.subject}
                          </span>
                          <span className="inline-flex px-4 py-2 rounded-full text-purple-700 bg-purple-100 font-medium">
                            {group.category}
                          </span>
                        </div>
                        
                        {/* Description */}
                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                          {group.description}
                        </p>
                      </div>
                      
                      {/* Join Button */}
                      <div className="ml-8 flex-shrink-0">
                        <motion.button 
                          onClick={() => handleViewGroup(group.id)}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-8 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full font-semibold hover:from-pink-500 hover:to-pink-600 transition-all duration-300 shadow-lg transform hover:scale-105"
                        >
                          VÀO XEM
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Show More Button */}
              {groups.length > 3 && (
                <div className="text-center mt-10">
                  <motion.button
                    onClick={() => setShowMore(!showMore)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center px-6 py-3 text-purple-600 font-semibold hover:text-purple-700 transition-colors bg-purple-50 rounded-full hover:bg-purple-100"
                  >
                    {showMore ? 'ẨN BỚT' : 'HIỂN THỊ THÊM...'}
                    <DownOutlined 
                      className={`ml-2 transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`}
                      style={{ fontSize: '14px' }}
                    />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onCreateGroup={handleCreateGroup}
      />
      
      <Footer />
    </>
  );
}