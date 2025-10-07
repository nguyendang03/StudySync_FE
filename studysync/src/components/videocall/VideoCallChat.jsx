import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Avatar, Badge, Tooltip, Button, Alert } from 'antd';
import { 
  SendOutlined, 
  SmileOutlined, 
  PictureOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { MessageCircle } from 'lucide-react';
import socketService from '../../services/socketService';
import { useAuthStore } from '../../stores';

const { TextArea } = Input;

export default function VideoCallChat({ 
  channelName, 
  isOpen, 
  onClose,
  participants = [],
  onNewMessage 
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!channelName || !user || !isOpen) return;

    // Try to connect to socket
    try {
      console.log('🔌 Attempting to connect to chat for channel:', channelName);
      const socket = socketService.connect(user.id, channelName);
      
      // Check connection after a delay
      setTimeout(() => {
        if (socketService.isSocketConnected()) {
          setIsConnected(true);
          setConnectionError(false);
          console.log('✅ Socket connected successfully');
        } else {
          setIsConnected(false);
          setConnectionError(true);
          console.warn('⚠️ Socket not connected - chat server may not be running');
        }
      }, 1000);

      // Listen for messages
      socketService.onMessage((messageData) => {
        setMessages(prev => [...prev, messageData]);
        scrollToBottom();
        if (onNewMessage) {
          onNewMessage();
        }
      });

      // Listen for typing indicators
      socketService.onTyping((data) => {
        if (data.userId !== user.id) {
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

      // Listen for user joined
      socketService.onUserJoined((data) => {
        const systemMessage = {
          id: `system_${Date.now()}`,
          type: 'system',
          message: `${data.userName} đã tham gia cuộc gọi`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, systemMessage]);
        scrollToBottom();
      });

      // Listen for user left
      socketService.onUserLeft((data) => {
        const systemMessage = {
          id: `system_${Date.now()}`,
          type: 'system',
          message: `${data.userName} đã rời khỏi cuộc gọi`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, systemMessage]);
        scrollToBottom();
      });

    } catch (error) {
      console.error('❌ Failed to connect to chat server:', error);
      setConnectionError(true);
      setIsConnected(false);
    }

    return () => {
      if (channelName) {
        socketService.leaveChannel(channelName);
      }
    };
  }, [channelName, user, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;

    // Send message via socket
    socketService.sendMessage(
      channelName,
      inputMessage,
      user.id,
      user.username || user.email
    );

    // Clear input
    setInputMessage('');
    setIsTyping(false);
    socketService.sendTyping(channelName, user.id, user.username, false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    if (!isConnected) return;

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      socketService.sendTyping(channelName, user.id, user.username, true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      socketService.sendTyping(channelName, user.id, user.username, false);
    }

    // Clear typing indicator after 2 seconds of no typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.sendTyping(channelName, user.id, user.username, false);
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

      {/* Connection Error Alert */}
      {connectionError && (
        <Alert
          message="Không thể kết nối chat server"
          description={
            <div className="text-xs">
              <p>Chat server chưa được khởi động.</p>
              <p className="mt-1">Vui lòng khởi động backend server tại: <code>http://localhost:3000</code></p>
              <p className="mt-1">Xem file <code>SOCKET_SERVER_EXAMPLE.md</code> để biết cách setup.</p>
            </div>
          }
          type="warning"
          showIcon
          closable
          className="m-4"
        />
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {!isConnected && !connectionError && (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-sm">Đang kết nối chat...</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => {
            const isOwnMessage = msg.userId === user.id;
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
            placeholder={isConnected ? "Nhập tin nhắn..." : "Chat server chưa kết nối..."}
            autoSize={{ minRows: 1, maxRows: 3 }}
            className="flex-1"
            disabled={!isConnected}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || !isConnected}
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
              disabled={!isConnected}
            />
          </Tooltip>
          <Tooltip title="Gửi ảnh">
            <Button 
              type="text" 
              size="small"
              icon={<PictureOutlined />}
              className="text-gray-500"
              disabled={!isConnected}
            />
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
}
