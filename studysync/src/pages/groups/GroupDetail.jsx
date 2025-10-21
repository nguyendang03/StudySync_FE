import React, { useState, useEffect } from 'react';
import { ArrowLeftOutlined, FileTextOutlined, BookOutlined, RiseOutlined, UserOutlined, MessageOutlined, LoadingOutlined, UserAddOutlined, VideoCameraOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Spin, Button, Badge } from 'antd';
import { showToast, commonToasts } from '../../utils/toast';
import { VideoCallButton, VideoCallManager } from '../../components/videocall';
import { useAuthStore } from '../../stores';
import groupService from '../../services/groupService';
import videoCallService from '../../services/videoCallService';
import GroupInvitationsManager from '../../components/groups/GroupInvitationsManager';
import InviteMemberModal from '../../components/groups/InviteMemberModal';

export default function GroupDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [isJoined, setIsJoined] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [groupData, setGroupData] = useState(null);
  const [error, setError] = useState(null);
  const [hasFetchedDetail, setHasFetchedDetail] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);
  const [activeCalls, setActiveCalls] = useState([]);
  const [isJoiningCall, setIsJoiningCall] = useState(false);
  const [refreshInvitations, setRefreshInvitations] = useState(0);

  useEffect(() => {
    if (id && isAuthenticated && !hasFetchedDetail) {
      fetchGroupDetail();
    }
  }, [id, isAuthenticated]);

  // Check if current user is the group leader
  // Use user.id from the user object, fallback to checking members array
  const currentUserId = user?.data?.id;
  const leaderId = groupData?.leaderId;
  
  // If user.id is undefined, try to find it in the members array
  const userInGroup = !currentUserId && groupData?.members?.find(m => 
    m.user?.email === user?.email || m.userId === user?.userId
  );
  
  const effectiveUserId = currentUserId || userInGroup?.user?.id || userInGroup?.userId;
  
  const isHost = effectiveUserId && leaderId && (
    leaderId === effectiveUserId || 
    String(leaderId) === String(effectiveUserId)
  );
  

  // Poll for active calls every 10 seconds
  useEffect(() => {
    if (groupData?.id && !isHost) {
      fetchActiveCalls();
      const interval = setInterval(fetchActiveCalls, 10000);
      return () => clearInterval(interval);
    }
  }, [groupData?.id, isHost]);

  
  const fetchGroupDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching group detail for ID:', id);
      
      const response = await groupService.getGroupDetail(id);
      console.log('📝 Group detail response:', response);
      
      // Extract data from response (backend wraps in { data: {...} })
      const data = response?.data || response;
      console.log('📝 Extracted group data:', data);
      
      if (!data) {
        throw new Error('No group data received');
      }
      
      setGroupData(data);
      setIsLoaded(true);
      setHasFetchedDetail(true);
      
      // Only show toast on first successful fetch
      if (!hasFetchedDetail) {
        showToast.success(`Đã tải thông tin nhóm ${data.groupName || data.name}`);
      }
    } catch (error) {
      console.error('Error fetching group detail:', error);
      setError(error.message || 'Không thể tải thông tin nhóm');
      
      // Only show error toasts if we haven't shown them before
      if (!hasFetchedDetail) {
        if (error.response?.status === 403) {
          showToast.error('Bạn không có quyền xem nhóm này');
        } else if (error.response?.status === 404) {
          showToast.error('Không tìm thấy nhóm');
        } else {
          showToast.error('Không thể tải thông tin nhóm');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveCalls = async () => {
    try {
      console.log('🔍 Fetching active calls for group:', id);
      const response = await videoCallService.getGroupActiveCalls(id);
      console.log('📥 Active calls response:', response);
      
      // Backend transforms response to: { data: VideoCall[], statusCode, message }
      // Axios wraps it again: { data: { data: VideoCall[], ... } }
      const rawData = response?.data?.data || response?.data || response;
      console.log('🔎 Extracted raw data:', rawData);
      
      // Store the raw data directly (can be array or single object)
      setActiveCalls(rawData || []);
      console.log('✅ Set activeCalls to:', rawData);
    } catch (error) {
      console.error('❌ Error fetching active calls:', error);
      setActiveCalls([]);
    }
  };

  const handleJoinActiveCall = async (call) => {
    try {
      setIsJoiningCall(true);
      console.log('👋 Attempting to join call:', call);
      
      // Generate a peer ID for this user
      const peerId = `peer_${user?.data?.id || user?.id}_${Date.now()}`;
      console.log('🔑 Generated peerId:', peerId);
      
      // Join the call via API first
      const joinResponse = await videoCallService.joinCall(call.id, { 
        callId: call.id,
        peerId 
      });
      console.log('✅ Join response:', joinResponse);
      
      // Navigate to the call page with group name as query parameter
      const groupName = encodeURIComponent(groupData?.groupName || groupData?.name || 'Nhóm học tập');
      const callLink = `/join-call/${call.id}?group=${groupName}`;
      console.log('🔗 Navigating to:', callLink);
      navigate(callLink);
      
      commonToasts.callJoined();
    } catch (error) {
      console.error('❌ Error joining call:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Vui lòng thử lại';
      showToast.error(`Không thể tham gia cuộc gọi. ${errorMsg}`);
    } finally {
      setIsJoiningCall(false);
    }
  };

  
  console.log('🔍 Leader check:', {
    userObject: user,
    currentUserId,
    effectiveUserId,
    leaderId,
    isHost,
    userInGroup
  });

  // Transform members data from backend format to display format
  const getAvatarColor = (index) => {
    const colors = ['bg-purple-500', 'bg-gray-500', 'bg-pink-500', 'bg-yellow-500', 'bg-purple-400', 'bg-gray-400', 'bg-blue-500', 'bg-green-500'];
    return colors[index % colors.length];
  };

  const transformedMembers = groupData?.members?.map((member, index) => {
    // Backend returns member object with nested user object
    const userData = member.user || member;
    const displayName = userData.username || userData.name || userData.email?.split('@')[0] || 'User';
    const isLeader = member.role === 'leader' || userData.id === groupData.leaderId || member.userId === groupData.leaderId;
    
    return {
      id: userData.id || member.userId,
      name: displayName,
      role: isLeader ? 'Nhóm trưởng' : 'Thành viên',
      avatar: displayName.substring(0, 2).toUpperCase(),
      color: getAvatarColor(index),
    };
  }) || [];

  const handleJoinGroup = () => {
    setIsJoined(!isJoined);
  };

  const handleGoBack = () => {
    navigate('/my-groups');
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn rời khỏi nhóm này?')) {
      return;
    }

    try {
      setIsLeavingGroup(true);
      await groupService.leaveGroup(id);
      commonToasts.groupLeft(groupData.groupName || groupData.name);
      
      // Redirect to groups list after leaving
      setTimeout(() => {
        navigate('/my-groups');
      }, 1000);
    } catch (error) {
      console.error('Error leaving group:', error);
      showToast.error('Không thể rời nhóm. ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setIsLeavingGroup(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div 
        className="min-h-screen p-8 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #A640A0, #6D17AE)' }}
      >
        <div className="text-center">
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 48, color: 'white' }} spin />}
            size="large"
          />
          <p className="text-white text-xl mt-4 font-medium">Đang tải thông tin nhóm...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !groupData) {
    return (
      <div 
        className="min-h-screen p-8 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #A640A0, #6D17AE)' }}
      >
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <div className="text-6xl mb-6">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Không thể tải nhóm</h2>
          <p className="text-gray-600 mb-6">{error || 'Có lỗi xảy ra khi tải thông tin nhóm'}</p>
          <button
            onClick={handleGoBack}
            className="bg-purple-600 text-white px-6 py-3 rounded-full font-medium hover:bg-purple-700 transition-colors"
          >
            ← Quay lại danh sách nhóm
          </button>
        </div>
      </div>
    );
  }

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
                        <h1 className="text-xl font-bold text-gray-800">TÊN NHÓM: {groupData.groupName || groupData.name}</h1>
                      </div>
                    </div>
                    
                    {/* Member Avatars and Actions */}
                    <div className="flex items-center space-x-2">
                      {transformedMembers.slice(0, 3).map((member, index) => (
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
                      {transformedMembers.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium ring-2 ring-white hover:scale-110 transition-transform duration-200 cursor-pointer" style={{ marginLeft: '-8px' }}>
                          +{transformedMembers.length - 3}
                        </div>
                      )}
                      
                      {/* Invite Member Button - Only for Leaders */}
                      {isHost && (
                        <Button
                          type="primary"
                          icon={<UserAddOutlined />}
                          onClick={() => setShowInviteModal(true)}
                          className="ml-4 bg-gradient-to-r from-purple-500 to-blue-500 border-0 rounded-full shadow-lg hover:shadow-xl"
                          size="small"
                        >
                          Mời thành viên
                        </Button>
                      )}

                      {/* Leave Group Button - Only for Members (not leaders) */}
                      {!isHost && (
                        <Button
                          danger
                          onClick={handleLeaveGroup}
                          loading={isLeavingGroup}
                          className="ml-4 border-0 rounded-full shadow-lg hover:shadow-xl"
                          size="small"
                        >
                          Rời nhóm
                        </Button>
                      )}
                                           
                      <div className="ml-2 px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-600">
                        ✓ Đã tham gia
                      </div>
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

                  {/* Video Call Section - Only for Leaders */}
                  {isHost && (
                    <div className={`transition-all duration-500 delay-1000 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                      <div className="flex items-center space-x-3 mb-4 hover:scale-105 transition-transform duration-200">
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM5 8a1 1 0 000 2h8a1 1 0 100-2H5z"/>
                        </svg>
                        <h2 className="text-lg font-bold text-purple-600">Cuộc gọi video:</h2>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <VideoCallManager
                          groupId={groupData.id}
                          groupName={groupData.groupName || groupData.name}
                          members={transformedMembers}
                        />
                      </div>
                    </div>
                  )}

                  {/* Active Calls - For Members to Join */}
                  {!isHost && (() => {
                    // Convert to array: works for objects, arrays, or single object
                    const callsArray = activeCalls && typeof activeCalls === 'object' 
                      ? (activeCalls.id ? [activeCalls] : Object.values(activeCalls).filter(item => item?.id))
                      : [];
                    
                    const hasActiveCalls = callsArray.length > 0;
                    
                    return (
                      <div className={`transition-all duration-500 delay-1000 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <VideoCameraOutlined className="text-purple-600 text-xl" />
                            <h2 className="text-lg font-bold text-purple-600">Cuộc gọi video:</h2>
                            {hasActiveCalls && (
                              <Badge count={callsArray.length} className="ml-2" />
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {hasActiveCalls ? 'Đang có cuộc gọi' : 'Chưa có cuộc gọi nào'}
                          </span>
                        </div>
                        
                        {/* Render calls using Object.values() */}
                        {hasActiveCalls ? (
                          <div className="space-y-3">
                            {callsArray.map((call) => (
                              <div
                                key={call.id}
                                className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                      <h3 className="text-lg font-bold text-gray-800">
                                        {call.callTitle || 'Cuộc gọi nhóm'}
                                      </h3>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                                      <div className="flex items-center space-x-1">
                                        <UserOutlined />
                                        <span>{call.participants?.filter(p => p.isActive).length || 0} người tham gia</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <PhoneOutlined />
                                        <span>Bắt đầu {new Date(call.startedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    type="primary"
                                    size="large"
                                    icon={<VideoCameraOutlined />}
                                    onClick={() => handleJoinActiveCall(call)}
                                    loading={isJoiningCall}
                                    className="bg-gradient-to-r from-green-500 to-blue-500 border-0 rounded-full shadow-lg hover:shadow-xl px-8"
                                  >
                                    Tham gia ngay
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
                            <div className="text-gray-400 mb-3">
                              <VideoCameraOutlined style={{ fontSize: '48px' }} />
                            </div>
                            <p className="text-gray-600 font-medium">Chưa có cuộc gọi nào đang diễn ra</p>
                            <p className="text-gray-400 text-sm mt-2">Nhóm trưởng sẽ bắt đầu cuộc gọi khi sẵn sàng</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Group Invitations Manager - Only for Leaders */}
                  {isHost && (
                    <div className={`transition-all duration-500 delay-1200 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                      <GroupInvitationsManager 
                        groupId={groupData.id} 
                        refreshTrigger={refreshInvitations}
                      />
                    </div>
                  )}
                  

                  {/* Subject Section */}
                  {groupData.subject && (
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
                  )}

                  {/* Group Info Section */}
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <RiseOutlined style={{ fontSize: '20px', color: '#7c3aed' }} />
                      <h2 className="text-lg font-bold text-purple-600">Thông tin nhóm:</h2>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Số thành viên:</span>
                        <span className="text-gray-800 font-bold">{groupData.memberCount || transformedMembers.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Ngày tạo:</span>
                        <span className="text-gray-800 font-bold">
                          {groupData.createdAt ? new Date(groupData.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Cập nhật gần nhất:</span>
                        <span className="text-gray-800 font-bold">
                          {groupData.updatedAt ? new Date(groupData.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </span>
                      </div>
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
                  {transformedMembers.length > 0 ? (
                    <>
                      <div className="space-y-3">
                        {transformedMembers.map((member) => (
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
                          <div className="text-purple-600 font-medium text-sm">
                            Tổng cộng: {transformedMembers.length} thành viên
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có thành viên nào
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        groupId={groupData?.id}
        groupName={groupData?.groupName || groupData?.name}
        onSuccess={() => {
          // Refresh group data and invitations list
          fetchGroupDetail();
          setRefreshInvitations(prev => prev + 1);
        }}
      />
    </div>
  );
}