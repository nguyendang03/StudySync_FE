import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Avatar, Badge, Tooltip, Button, Alert } from 'antd';
import { 
  SendOutlined, 
  SmileOutlined, 
  PictureOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { MessageCircle } from 'lucide-react';
import chatService from '../../services/chatService';
import { useAuthStore } from '../../stores';

const { TextArea } = Input;

export default function VideoCallChat({ 
  channelName, 
  isOpen, 
  onClose,
  participants = [],
  onNewMessage,
  groupId // Add groupId prop for REST API
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { user, fetchUserProfile } = useAuthStore();

  // Derive user identifiers once for consistent usage
  const currentUserId = user?.data?.id || user?.id;
  const currentUserName = user?.data?.username || user?.username || user?.data?.email || user?.email;

  // Ensure user profile is loaded BEFORE attempting socket connection
  useEffect(() => {
    const ensureUserProfile = async () => {
      if (!user && isOpen) {
        console.log('⚠️ =========================================');
        console.log('⚠️ USER NOT LOADED - FETCHING PROFILE');
        console.log('⚠️ =========================================');
        try {
          await fetchUserProfile();
          console.log('✅ =========================================');
          console.log('✅ USER PROFILE FETCHED SUCCESSFULLY');
          console.log('✅ =========================================');
        } catch (error) {
          console.error('❌ =========================================');
          console.error('❌ FAILED TO FETCH USER PROFILE');
          console.error('❌ Error:', error);
          console.error('❌ =========================================');
        }
      }
    };
    
    ensureUserProfile();
  }, [isOpen, user, fetchUserProfile]);

  // Function to load message history - using useCallback to stabilize reference
  // showLoading parameter controls whether to show spinner (true for initial load, false for refresh after send)
  const loadMessageHistory = useCallback(async (showLoading = true) => {
    if (!groupId || !isOpen) return;
    
    if (showLoading) {
      setIsLoadingMessages(true);
    }
    
    try {
      console.log('📥 Loading chat history for group:', groupId);
      const response = await chatService.getMessages(groupId, { 
        page: 1,
        limit: 50
      });
      
      // Extract messages from response
      console.log('📦 Full API response:', response);
      const responseData = response?.data?.data || response?.data || response;
      const messageList = responseData?.messages || [];
      
      console.log('📝 Extracted messages:', messageList);
      
      // Transform API messages to match UI format
      const formattedMessages = messageList.map(msg => ({
        id: msg.id,
        userId: msg.senderId || msg.sender?.id,
        userName: msg.sender?.username || msg.sender?.name || msg.sender?.email?.split('@')[0] || 'User',
        message: msg.content,
        timestamp: new Date(msg.createdAt).getTime(),
        type: msg.type === 'system' ? 'system' : 'message',
        isEdited: msg.isEdited
      }));
      
      setMessages(formattedMessages);
      console.log('✅ Loaded', formattedMessages.length, 'messages from history');
      
      // Scroll to bottom after loading
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('❌ Failed to load message history:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      if (showLoading) {
        setIsLoadingMessages(false);
      }
    }
  }, [groupId, isOpen]);

  // Load message history on mount using REST API
  useEffect(() => {
    loadMessageHistory();
  }, [loadMessageHistory]);

  useEffect(() => {
    if (!groupId || !currentUserId || !isOpen) {
      console.log('⚠️ =========================================');
      console.log('⚠️ CANNOT CONNECT TO CHAT - MISSING DATA');
      console.log('⚠️ Group ID:', groupId);
      console.log('⚠️ User ID:', currentUserId);
      console.log('⚠️ Is Open:', isOpen);
      console.log('⚠️ User object:', user);
      console.log('⚠️ =========================================');
      return;
    }

    // CRITICAL: Auto-join the chat room immediately when component opens
    console.log('🎯 =========================================');
    console.log('🎯 VIDEOCALLCHAT INITIALIZATION');
    console.log('🎯 Group ID:', groupId);
    console.log('🎯 User ID:', currentUserId);
    console.log('🎯 User Name:', currentUserName);
    console.log('🎯 Is Open:', isOpen);
    console.log('🎯 =========================================');

    let socketInstance;

    const handleConnected = () => {
      console.log('✅ =========================================');
      console.log('✅ CHAT SOCKET CONNECTED IN COMPONENT');
      console.log('✅ Group ID:', groupId);
      console.log('✅ Joining group room...');
      console.log('✅ =========================================');
      chatService.joinGroup(groupId);
      setIsConnected(true);
      setConnectionError(false);
      loadMessageHistory(false);
    };

    const handleDisconnected = (reason) => {
      console.warn('⚠️ =========================================');
      console.warn('⚠️ CHAT SOCKET DISCONNECTED IN COMPONENT');
      console.warn('⚠️ Reason:', reason);
      console.warn('⚠️ =========================================');
      setIsConnected(false);
    };

    // Try to connect to socket
    try {
      console.log('🔌 =========================================');
      console.log('🔌 ATTEMPTING SOCKET CONNECTION FROM COMPONENT');
      console.log('🔌 Group ID:', groupId);
      console.log('🔌 User ID:', currentUserId);
      console.log('🔌 =========================================');
      socketInstance = chatService.connect(currentUserId, groupId);

      if (!socketInstance) {
        console.warn('❌ Socket instance not created; realtime chat disabled');
        setIsConnected(false);
        setConnectionError(true);
        return;
      }

      socketInstance.on('connect', handleConnected);
      socketInstance.on('disconnect', handleDisconnected);

      // If socket is already connected, join immediately
      if (socketInstance.connected) {
        console.log('🔌 Socket already connected, joining group immediately');
        handleConnected();
      }

      // Set up message listener
      // This will be set up ONCE per mount - the callback will have access to latest state via setter function
      console.log('📡 =========================================');
      console.log('📡 SETTING UP MESSAGE LISTENER');
      console.log('📡 Group ID:', groupId);
      console.log('📡 Socket connected:', socketInstance.connected);
      console.log('📡 =========================================');
      
      chatService.onMessage((messageData) => {
        console.log('📨 =========================================');
        console.log('📨 NEW MESSAGE RECEIVED VIA WEBSOCKET');
        console.log('📨 Message ID:', messageData.id);
        console.log('📨 From:', messageData.userName);
        console.log('📨 Content:', messageData.message);
        console.log('📨 =========================================');
        
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          if (prev.find(m => m.id === messageData.id)) {
            console.log('⚠️ Duplicate message detected, skipping:', messageData.id);
            return prev;
          }
          
          console.log('✅ Adding new message to state');
          return [...prev, messageData];
        });
        
        scrollToBottom();
        if (onNewMessage) {
          onNewMessage();
        }
      });

      // Listen for typing indicators
      chatService.onTyping((data) => {
        if (currentUserId && data.userId !== currentUserId) {
          if (data.isTyping) {
            setTypingUsers(prev => {
              if (!prev.find(u => u.userId === data.userId)) {
                return [...prev, data];
              }
              return prev;
            });
          } else {
            setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
          }
        }
      });

      // Listen for user joined (commented out - too many notifications)
      // chatService.onUserJoined((data) => {
      //   console.log('👋 User joined event received:', data);
      //   const systemMessage = {
      //     id: `system_${Date.now()}`,
      //     type: 'system',
      //     message: `${data.userName || 'User'} đã tham gia cuộc gọi`,
      //     timestamp: Date.now()
      //   };
      //   setMessages(prev => [...prev, systemMessage]);
      //   scrollToBottom();
      // });

      // Listen for user left (commented out - too many notifications)
      // chatService.onUserLeft((data) => {
      //   console.log('👋 User left event received:', data);
      //   const systemMessage = {
      //     id: `system_${Date.now()}`,
      //     type: 'system',
      //     message: `${data.userName || 'User'} đã rời khỏi cuộc gọi`,
      //     timestamp: Date.now()
      //   };
      //   setMessages(prev => [...prev, systemMessage]);
      //   scrollToBottom();
      // });

    } catch (error) {
      console.error('❌ Failed to connect to chat server:', error);
      setConnectionError(true);
      setIsConnected(false);
    }

    return () => {
      console.log('🧹 Cleaning up VideoCallChat - leaving group:', groupId);
      if (socketInstance) {
        socketInstance.off('connect', handleConnected);
        socketInstance.off('disconnect', handleDisconnected);
      }
      if (groupId) {
        chatService.leaveGroup(groupId);
      }
    };
  }, [groupId, currentUserId, currentUserName, isOpen, onNewMessage, loadMessageHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (!currentUserId) {
      console.error('❌ No user available to send message');
      setConnectionError('Vui lòng đăng nhập lại để gửi tin nhắn');
      return;
    }

    const messageContent = inputMessage;
    setInputMessage(''); // Clear immediately for better UX

    // Always use REST API first for reliability
    console.log('📤 Sending message via REST API');
    await sendViaRestAPI(messageContent);
    
    // Clear typing indicator if socket is connected
    if (isConnected && currentUserId) {
      setIsTyping(false);
      chatService.sendTyping(groupId, currentUserId, currentUserName, false);
    }
  };

  const sendViaRestAPI = async (messageContent) => {
    if (!groupId) {
      console.error('❌ No groupId available for REST API');
      return;
    }

    try {
      console.log('📤 Sending message via REST API');
      console.log('📤 GroupId:', groupId);
      console.log('📤 Content:', messageContent);
      
      // Send the message - backend will broadcast it via WebSocket to ALL clients
      // including the sender, so we DON'T need to reload message history
      await chatService.sendMessage(groupId, messageContent);
      console.log('✅ Message sent successfully to server');
      console.log('✅ Message will arrive via WebSocket broadcast');
      
      // DON'T reload message history - let WebSocket handle it!
      // The backend broadcasts to all clients, so we'll receive our own message via WebSocket
      
    } catch (error) {
      console.error('❌ Failed to send message via REST API:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      // Re-add message to input if send failed
      setInputMessage(messageContent);
      alert('Không thể gửi tin nhắn. Vui lòng thử lại.');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    if (!isConnected || !currentUserId) return;

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      chatService.sendTyping(groupId, currentUserId, currentUserName, true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      chatService.sendTyping(groupId, currentUserId, currentUserName, false);
    }

    // Clear typing indicator after 2 seconds of no typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      chatService.sendTyping(groupId, currentUserId, currentUserName, false);
    }, 2000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getAvatarColor = (userId) => {
    const colors = [
      'bg-purple-500', 'bg-blue-500', 'bg-green-500', 
      'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'
    ];
    const index = (userId?.toString().charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="absolute top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5" />
          <div>
            <h3 className="font-semibold text-lg">Chat nhóm</h3>
            <div className="flex items-center gap-2 text-xs text-purple-100">
              <Badge 
                status={isConnected ? "success" : "error"} 
                className="custom-badge"
              />
              <span>{isConnected ? 'Đang kết nối' : 'Mất kết nối'}</span>
              <span>•</span>
              <span>{participants.length} thành viên</span>
            </div>
          </div>
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          className="text-white hover:bg-white/20"
        />
      </div>

      {/* Connection Status Info */}
      {!isConnected && !connectionError && !isLoadingMessages && (
        <Alert
          message="Chế độ REST API"
          description="Chat server chưa kết nối. Tin nhắn sẽ được gửi qua REST API (có thể chậm hơn)."
          type="info"
          showIcon
          closable
          className="m-4"
        />
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {isLoadingMessages && (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-sm">Đang tải tin nhắn...</p>
          </div>
        )}

        <AnimatePresence>
          {messages.filter(msg => msg && msg.id).map((msg) => {
            const isOwnMessage = currentUserId && msg.userId === currentUserId;
            const isSystemMessage = msg.type === 'system';

            if (isSystemMessage) {
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="inline-block bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {msg.message}
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isOwnMessage && (
                  <Avatar 
                    size={32}
                    className={`${getAvatarColor(msg.userId)} flex-shrink-0`}
                  >
                    {msg.userName?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                )}
                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
                  {!isOwnMessage && (
                    <span className="text-xs text-gray-500 mb-1 px-2">
                      {msg.userName}
                    </span>
                  )}
                  <div className={`
                    px-4 py-2 rounded-2xl
                    ${isOwnMessage 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-sm' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm'
                    }
                  `}>
                    <p className="text-sm break-words">{msg.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 px-2">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-gray-500 text-sm px-2"
          >
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs">
              {typingUsers[0].userName} đang nhập...
            </span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        {!currentUserId && (
          <Alert
            message="Đang tải thông tin người dùng..."
            description="Vui lòng đợi để kết nối chat..."
            type="warning"
            showIcon
            className="mb-2"
          />
        )}
        <div className="flex gap-2">
          <TextArea
            value={inputMessage}
            onChange={handleInputChange}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={!currentUserId ? "Đang tải..." : groupId ? "Nhập tin nhắn..." : "Chọn nhóm để chat..."}
            autoSize={{ minRows: 1, maxRows: 3 }}
            className="flex-1"
            disabled={!groupId || isLoadingMessages || !currentUserId}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !groupId || isLoadingMessages || !currentUserId}
            className="bg-gradient-to-r from-purple-600 to-blue-600 border-none self-end"
          />
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-2">
          <Tooltip title="Emoji">
            <Button 
              type="text" 
              size="small"
              icon={<SmileOutlined />}
              className="text-gray-500"
              disabled={!groupId || isLoadingMessages}
            />
          </Tooltip>
          <Tooltip title="Gửi ảnh">
            <Button 
              type="text" 
              size="small"
              icon={<PictureOutlined />}
              className="text-gray-500"
              disabled={!groupId || isLoadingMessages}
            />
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
}
