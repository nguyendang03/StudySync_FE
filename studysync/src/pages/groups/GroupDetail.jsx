import React, { useState, useEffect } from 'react';
import { ArrowLeftOutlined, FileTextOutlined, BookOutlined, RiseOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { VideoCallButton } from '../../components/videocall';
import { useAuthStore } from '../../stores';

export default function GroupDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [isJoined, setIsJoined] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Sample group data - enhanced with video call support
  const groupData = {
    id: id || 1,
    name: 'Americano',
    description: 'JobBoost là nền tảng kết nối giữa người cần tuyển nhân sự với các công việc ngành hàn và sinh viên có năng lực thực hiện. Bất kỳ ai cũng có thể đăng ký tìm người làm, lộn chỉ sinh viên mà có thể ứng tuyển và thực hiện công việc.',
    subject: 'EXE101',
    progress: '',
    members: [
      { id: 1, name: 'Pham Hoang', role: 'Nhóm trưởng', avatar: 'P', color: 'bg-purple-500' },
      { id: 2, name: 'Thuy Hang', role: 'Thành viên', avatar: 'H', color: 'bg-gray-500' },
      { id: 3, name: 'Dat Hieu', role: 'Thành viên', avatar: 'DH', color: 'bg-pink-500' },
      { id: 4, name: 'Anh Long', role: 'Thành viên', avatar: 'L', color: 'bg-yellow-500' },
      { id: 5, name: 'Huu Minh', role: 'Thành viên', avatar: 'M', color: 'bg-purple-400' },
      { id: 6, name: 'Quynh Nhu', role: 'Thành viên', avatar: 'N', color: 'bg-gray-400' },
    ]
  };

  // Check if current user is the group leader
  const isHost = user && groupData.members.find(member => 
    member.id === 1 && member.role === 'Nhóm trưởng'
  );

  const handleJoinGroup = () => {
    setIsJoined(!isJoined);
  };

  const handleGoBack = () => {
    navigate('/groups');
  };

  return (
    <div 
      className={`min-h-screen p-8 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{ background: 'linear-gradient(135deg, #A640A0, #6D17AE)' }}
    >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                {/* Header */}
                <div className={`bg-gray-50 px-6 py-4 border-b transition-all duration-500 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handleGoBack}
                        className="w-10 h-10 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                      >
                        <ArrowLeftOutlined style={{ fontSize: '16px', color: '#7c3aed' }} />
                      </button>
                      <div className="hover:scale-105 transition-transform duration-200">
                        <h1 className="text-xl font-bold text-gray-800">TÊN NHÓM: {groupData.name}</h1>
                      </div>
                    </div>
                    
                    {/* Member Avatars and Actions */}
                    <div className="flex items-center space-x-2">
                      {groupData.members.slice(0, 3).map((member, index) => (
                        <div 
                          key={member.id}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${member.color} ring-2 ring-white hover:scale-110 transition-transform duration-200 cursor-pointer`}
                          style={{ 
                            marginLeft: index > 0 ? '-8px' : '0',
                            animationDelay: `${600 + index * 100}ms`
                          }}
                        >
                          {member.avatar}
                        </div>
                      ))}
                      {groupData.members.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium ring-2 ring-white hover:scale-110 transition-transform duration-200 cursor-pointer" style={{ marginLeft: '-8px' }}>
                          +{groupData.members.length - 3}
                        </div>
                      )}
                      
                      {/* Video Call Button */}
                      <div className="ml-4">
                        <VideoCallButton
                          groupId={groupData.id}
                          groupName={groupData.name}
                          members={groupData.members}
                          isHost={isHost}
                          className="text-sm"
                        />
                      </div>
                      
                      <button
                        onClick={handleJoinGroup}
                        className={`ml-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                          isJoined 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {isJoined ? '✓ ĐÃ THAM GIA NHÓM' : 'THAM GIA NHÓM'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`p-8 space-y-8 transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  {/* Description Section */}
                  <div className={`transition-all duration-500 delay-800 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                    <div className="flex items-center space-x-3 mb-4 hover:scale-105 transition-transform duration-200">
                      <FileTextOutlined style={{ fontSize: '20px', color: '#7c3aed' }} />
                      <h2 className="text-lg font-bold text-purple-600">Mô tả:</h2>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                      <p className="text-gray-700 leading-relaxed">
                        {groupData.description}
                      </p>
                    </div>
                  </div>

                  {/* Subject Section */}
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <BookOutlined style={{ fontSize: '20px', color: '#7c3aed' }} />
                      <h2 className="text-lg font-bold text-purple-600">Môn học:</h2>
                    </div>
                    <div>
                      <span className="inline-flex px-4 py-2 bg-purple-600 text-white rounded-full font-medium">
                        {groupData.subject}
                      </span>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <RiseOutlined style={{ fontSize: '20px', color: '#7c3aed' }} />
                      <h2 className="text-lg font-bold text-purple-600">Tiến trình:</h2>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-6">
                      <p className="text-gray-500 text-center py-8">
                        Chưa có thông tin tiến trình
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Members Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Members Header */}
                <div className="bg-purple-600 px-6 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <UserOutlined style={{ fontSize: '16px', color: 'white' }} />
                    <h3 className="text-white font-bold">THÀNH VIÊN</h3>
                  </div>
                </div>

                {/* Members List */}
                <div className="p-6">
                  <div className="space-y-3">
                    {groupData.members.map((member) => (
                      <div 
                        key={member.id}
                        className="flex items-center space-x-3 p-3 bg-pink-100 rounded-xl hover:bg-pink-200 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${member.color}`}>
                          {member.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.role}</div>
                        </div>
                        <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors">
                          <MessageOutlined style={{ fontSize: '14px', color: '#7c3aed' }} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                        Tổng cộng: {groupData.members.length} thành viên
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}