import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Send, X, UserPlus, Mail, 
  Phone, MessageCircle, Copy, Link as LinkIcon,
  Check, Clock, ExternalLink, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import groupService from '../../services/groupService';

const InvitationModal = ({ 
  groupId, 
  groupName, 
  members = [], 
  activeCall = null,
  onInviteSent, 
  onCancel 
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [invitationMessage, setInvitationMessage] = useState('');
  const [inviteMethod, setInviteMethod] = useState('email'); // 'email', 'link'
  const [isSending, setIsSending] = useState(false);
  const [sentInvitations, setSentInvitations] = useState([]);
  const [emailError, setEmailError] = useState('');

  // Generate invitation link
  const invitationLink = useMemo(() => {
    const baseUrl = window.location.origin;
    const callId = activeCall ? activeCall.channelName : `group_${groupId}_${Date.now()}`;
    return `${baseUrl}/join-call/${callId}?group=${groupName}`;
  }, [activeCall, groupId, groupName]);

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Add email to list
  const handleAddEmail = () => {
    const trimmedEmail = emailInput.trim();
    
    if (!trimmedEmail) {
      setEmailError('Vui lòng nhập email');
      return;
    }
    
    if (!isValidEmail(trimmedEmail)) {
      setEmailError('Email không hợp lệ');
      return;
    }
    
    if (emailList.includes(trimmedEmail)) {
      setEmailError('Email đã được thêm');
      return;
    }
    
    setEmailList(prev => [...prev, trimmedEmail]);
    setEmailInput('');
    setEmailError('');
  };

  // Remove email from list
  const handleRemoveEmail = (emailToRemove) => {
    setEmailList(prev => prev.filter(email => email !== emailToRemove));
  };

  // Handle Enter key press
  const handleEmailKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleSendInvitations = async () => {
    if (inviteMethod === 'email' && emailList.length === 0) {
      toast.error('Vui lòng thêm ít nhất một email');
      return;
    }

    setIsSending(true);

    try {
      if (inviteMethod === 'email') {
        // Send invitations to all emails using real backend API
        console.log('📤 Sending invitations to:', emailList);
        
        const results = await Promise.allSettled(
          emailList.map(email => 
            groupService.inviteMember(groupId, {
              memberEmail: email,
              message: invitationMessage || undefined
            })
          )
        );

        // Count successes and failures
        const successful = results.filter(r => r.status === 'fulfilled');
        const failed = results.filter(r => r.status === 'rejected');

        // Track sent invitations
        const newInvitations = successful.map((result, index) => ({
          id: `inv_${Date.now()}_${index}`,
          email: emailList[index],
          sentAt: new Date().toISOString(),
          status: 'sent'
        }));
        
        setSentInvitations(prev => [...prev, ...newInvitations]);

        // Show results
        if (successful.length > 0) {
          toast.success(`Đã gửi lời mời đến ${successful.length} người 📧`);
        }
        
        if (failed.length > 0) {
          const failedEmails = failed.map((r, i) => {
            const failedIndex = results.findIndex(result => result === r);
            return emailList[failedIndex];
          });
          console.error('❌ Failed to send to:', failedEmails);
          toast.error(`Không thể gửi đến ${failed.length} email. Vui lòng kiểm tra lại.`);
        }

        // Clear email list after sending
        if (successful.length === emailList.length) {
          setEmailList([]);
          setTimeout(() => {
            onInviteSent(successful.map((_, i) => ({ email: emailList[i] })));
          }, 1000);
        }
        
      } else if (inviteMethod === 'link') {
        // Copy link to clipboard
        navigator.clipboard.writeText(invitationLink);
        toast.success('Đã sao chép link mời vào clipboard! 📋');
        
        setTimeout(() => {
          onInviteSent([]);
        }, 1000);
      }

    } catch (error) {
      console.error('❌ Failed to send invitations:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể gửi lời mời';
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const copyInvitationLink = () => {
    navigator.clipboard.writeText(invitationLink);
    toast.success('Đã sao chép link! 📋');
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
        <div className="grid grid-cols-2 gap-3">
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
            <span className="text-sm font-medium">Mời qua Email</span>
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

      {/* Email Input (for email method) */}
      {inviteMethod === 'email' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              Nhập email người nhận
            </h3>
            <span className="text-xs text-gray-500">
              {emailList.length} email đã thêm
            </span>
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="Nhập email (ví dụ: user@example.com)"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setEmailError('');
                  }}
                  onKeyPress={handleEmailKeyPress}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {emailError && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddEmail}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Thêm
              </motion.button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Nhập email và nhấn "Thêm" hoặc Enter để thêm vào danh sách
            </p>
          </div>

          {/* Email List */}
          {emailList.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Danh sách email ({emailList.length}):
              </h4>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {emailList.map((email, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white border border-blue-200 text-blue-800 rounded-full text-sm"
                  >
                    <Mail className="w-3 h-3" />
                    <span>{email}</span>
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="ml-1 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
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
          <h4 className="text-sm font-medium text-gray-700 mb-3">Lời mời đã gửi thành công</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {sentInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-800 truncate">{invitation.email}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-green-600 flex-shrink-0">
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
          disabled={isSending || (inviteMethod === 'email' && emailList.length === 0)}
          className={`
            px-8 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
            ${isSending || (inviteMethod === 'email' && emailList.length === 0)
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
                  : `Gửi lời mời${emailList.length > 0 ? ` (${emailList.length})` : ''}`
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