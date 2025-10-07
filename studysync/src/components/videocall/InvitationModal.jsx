import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Send, X, UserPlus, Mail, 
  Phone, MessageCircle, Copy, Link as LinkIcon,
  Check, Clock, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const InvitationModal = ({ 
  groupId, 
  groupName, 
  members = [], 
  activeCall = null,
  onInviteSent, 
  onCancel 
}) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [invitationMessage, setInvitationMessage] = useState('');
  const [inviteMethod, setInviteMethod] = useState('in-app'); // 'in-app', 'email', 'link'
  const [isSending, setIsSending] = useState(false);
  const [sentInvitations, setSentInvitations] = useState([]);

  // Mock data for available users to invite
  const availableUsers = useMemo(() => [
    { id: 'user_1', name: 'Nguyễn Văn A', email: 'a.nguyen@email.com', avatar: '/avatar1.jpg', online: true },
    { id: 'user_2', name: 'Trần Thị B', email: 'b.tran@email.com', avatar: '/avatar2.jpg', online: false },
    { id: 'user_3', name: 'Lê Văn C', email: 'c.le@email.com', avatar: '/avatar3.jpg', online: true },
    { id: 'user_4', name: 'Phạm Thị D', email: 'd.pham@email.com', avatar: '/avatar4.jpg', online: true },
    { id: 'user_5', name: 'Hoàng Văn E', email: 'e.hoang@email.com', avatar: '/avatar5.jpg', online: false },
  ], []);

  // Filter users based on search term and exclude current members
  const filteredUsers = useMemo(() => {
    const memberIds = members.map(m => m.id);
    return availableUsers
      .filter(user => !memberIds.includes(user.id))
      .filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [availableUsers, members, searchTerm]);

  // Generate invitation link
  const invitationLink = useMemo(() => {
    const baseUrl = window.location.origin;
    const callId = activeCall ? activeCall.channelName : `group_${groupId}_${Date.now()}`;
    return `${baseUrl}/join-call/${callId}?group=${groupName}`;
  }, [activeCall, groupId, groupName]);

  const handleUserSelect = (user) => {
    setSelectedUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      if (exists) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleSendInvitations = async () => {
    if (inviteMethod === 'in-app' && selectedUsers.length === 0) {
      toast.error('Vui lòng chọn ít nhất một người để mời');
      return;
    }

    setIsSending(true);

    try {
      // Simulate sending invitations
      await new Promise(resolve => setTimeout(resolve, 1500));

      const invitationData = {
        method: inviteMethod,
        groupId,
        groupName,
        message: invitationMessage,
        callId: activeCall ? activeCall.channelName : `group_${groupId}_${Date.now()}`,
        link: invitationLink
      };

      if (inviteMethod === 'in-app') {
        // Send in-app invitations
        const newInvitations = selectedUsers.map(user => ({
          id: `inv_${Date.now()}_${user.id}`,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          sentAt: new Date().toISOString(),
          status: 'sent'
        }));
        
        setSentInvitations(prev => [...prev, ...newInvitations]);
        toast.success(`Đã gửi lời mời đến ${selectedUsers.length} người`);
        
        setTimeout(() => {
          onInviteSent(selectedUsers);
        }, 1000);
        
      } else if (inviteMethod === 'email') {
        // Send email invitations
        const emailList = selectedUsers.map(u => u.email).join(', ');
        toast.success(`Đã gửi email mời đến: ${emailList}`);
        
        setTimeout(() => {
          onInviteSent(selectedUsers);
        }, 1000);
        
      } else if (inviteMethod === 'link') {
        // Copy link to clipboard
        navigator.clipboard.writeText(invitationLink);
        toast.success('Đã sao chép link mời vào clipboard!');
        
        setTimeout(() => {
          onInviteSent([]);
        }, 1000);
      }

    } catch (error) {
      console.error('Failed to send invitations:', error);
      toast.error('Không thể gửi lời mời');
    } finally {
      setIsSending(false);
    }
  };

  const copyInvitationLink = () => {
    navigator.clipboard.writeText(invitationLink);
    toast.success('Đã sao chép link!');
  };

  const shareInvitationLink = () => {
    if (navigator.share) {
      navigator.share({
        title: `Tham gia cuộc gọi - ${groupName}`,
        text: invitationMessage || `Bạn được mời tham gia cuộc gọi video nhóm ${groupName}`,
        url: invitationLink,
      });
    } else {
      copyInvitationLink();
    }
  };

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Mời tham gia cuộc gọi
          </h2>
          <p className="text-sm text-gray-600">
            {activeCall ? 'Mời thêm người vào cuộc gọi đang diễn ra' : 'Gửi lời mời tham gia cuộc gọi'} - {groupName}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Invitation Methods */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Phương thức mời</h3>
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setInviteMethod('in-app')}
            className={`p-4 rounded-lg border-2 text-center transition-all ${
              inviteMethod === 'in-app'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <Phone className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Trong ứng dụng</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setInviteMethod('email')}
            className={`p-4 rounded-lg border-2 text-center transition-all ${
              inviteMethod === 'email'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <Mail className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Gửi Email</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setInviteMethod('link')}
            className={`p-4 rounded-lg border-2 text-center transition-all ${
              inviteMethod === 'link'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <LinkIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Chia sẻ Link</span>
          </motion.button>
        </div>
      </div>

      {/* Link Sharing Section */}
      {inviteMethod === 'link' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-3">Link tham gia cuộc gọi</h4>
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex-1 flex items-center space-x-2 p-3 bg-white rounded border">
              <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={invitationLink}
                readOnly
                className="flex-1 text-sm text-gray-600 bg-transparent border-none outline-none"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyInvitationLink}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              <Copy className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareInvitationLink}
              className="p-3 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </motion.button>
          </div>
          <p className="text-xs text-gray-500">
            Chia sẻ link này để mời bất kỳ ai tham gia cuộc gọi
          </p>
        </div>
      )}

      {/* User Selection (for in-app and email methods) */}
      {(inviteMethod === 'in-app' || inviteMethod === 'email') && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              {inviteMethod === 'email' ? 'Chọn người nhận email' : 'Chọn người để mời'}
            </h3>
            <span className="text-xs text-gray-500">
              {selectedUsers.length} đã chọn
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* User List */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Không tìm thấy người dùng nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const isSelected = selectedUsers.find(u => u.id === user.id);
                  return (
                    <motion.div
                      key={user.id}
                      whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.5)' }}
                      onClick={() => handleUserSelect(user)}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {user.online && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className={`w-2 h-2 rounded-full ${user.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              <span className="text-xs text-gray-500">
                                {user.online ? 'Đang trực tuyến' : 'Không trực tuyến'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Users Summary */}
          {selectedUsers.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Đã chọn {selectedUsers.length} người:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <motion.span
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    <span>{user.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserSelect(user);
                      }}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Message */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tin nhắn mời (tùy chọn)
        </label>
        <textarea
          value={invitationMessage}
          onChange={(e) => setInvitationMessage(e.target.value)}
          placeholder={`Hãy tham gia cuộc gọi video nhóm "${groupName}" với chúng tôi!`}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Recent Invitations */}
      {sentInvitations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Lời mời đã gửi</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {sentInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">{invitation.userName}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <Clock className="w-3 h-3" />
                  <span>Vừa gửi</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors"
        >
          Hủy
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSendInvitations}
          disabled={isSending || (inviteMethod !== 'link' && selectedUsers.length === 0)}
          className={`
            px-8 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
            ${isSending || (inviteMethod !== 'link' && selectedUsers.length === 0)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
            }
          `}
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Đang gửi...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>
                {inviteMethod === 'link' 
                  ? 'Sao chép link' 
                  : `Gửi lời mời${selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ''}`
                }
              </span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default InvitationModal;