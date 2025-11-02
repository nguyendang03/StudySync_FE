import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageOutlined, 
  PlusOutlined, 
  SendOutlined, 
  UserOutlined, 
  HistoryOutlined,
  EditOutlined,
  DeleteOutlined,
  RobotOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Avatar, Tooltip, Badge, Dropdown, Card, Tag, Divider, Modal, Spin } from 'antd';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, Zap, Copy, ThumbsUp, ThumbsDown, Settings, Mic, MicOff, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/layout/Sidebar';
import aiService from '../../services/aiService';
import aiChatHistoryService from '../../services/aiChatHistoryService';
import StreamingText from '../../components/ai/StreamingText';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Xin chào! Tôi là **StudySync AI**, trợ lý học tập thông minh của bạn.\n\n🎯 Tôi có thể giúp bạn:\n• Tìm kiếm nhóm học phù hợp\n• Giải đáp thắc mắc về môn học\n• Tạo kế hoạch học tập\n• Hỗ trợ giải bài tập\n\nBạn cần hỗ trợ gì hôm nay? 😊",
      sender: "ai",
      timestamp: new Date(),
      type: "welcome"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiProvider, setAiProvider] = useState('openai');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentHistoryId, setCurrentHistoryId] = useState(null);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  const scrollToBottom = (smooth = true) => {
    if (!messagesEndRef.current) return;
    
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: smooth ? "smooth" : "auto",
        block: "end"
      });
    });
  };

  // Check if user is near bottom of chat
  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    
    const container = messagesContainerRef.current;
    const threshold = 150; // pixels from bottom
    const position = container.scrollTop + container.clientHeight;
    const height = container.scrollHeight;
    
    return height - position < threshold;
  };

  // Handle scroll events to detect manual scrolling
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    shouldAutoScrollRef.current = isNearBottom();
  };

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    // Only auto-scroll if user is near bottom or it's the first message
    if (shouldAutoScrollRef.current || messages.length === 1) {
      // Small delay to allow animation to start
      const timeoutId = setTimeout(() => {
        scrollToBottom(true);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

  // Load chat history from backend
  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const historyData = await aiChatHistoryService.getHistory(1, 50);
      const formattedHistory = aiChatHistoryService.formatHistoryForDisplay(historyData.items || []);
      setConversations(formattedHistory);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Don't show error toast on initial load - user might not have any history yet
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load specific conversation from history
  const loadConversation = async (conversation) => {
    try {
      // Mark as active
      setConversations(prev => 
        prev.map(conv => ({ ...conv, isActive: conv.id === conversation.id }))
      );
      
      // Set current history ID
      setCurrentHistoryId(conversation.id);
      
      // Load the conversation messages
      setMessages([
        {
          id: 1,
          text: conversation.fullQuery,
          sender: "user",
          timestamp: new Date(conversation.timestamp)
        },
        {
          id: 2,
          text: conversation.fullResponse,
          sender: "ai",
          timestamp: new Date(conversation.timestamp),
          reactions: { thumbsUp: 0, thumbsDown: 0 }
        }
      ]);
      
      // Set conversation history for context
      setConversationHistory([
        { role: 'user', content: conversation.fullQuery },
        { role: 'assistant', content: conversation.fullResponse }
      ]);
      
      toast.success('Đã tải cuộc trò chuyện!', {
        icon: '📜',
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Không thể tải cuộc trò chuyện');
    }
  };

  // Delete conversation from history
  const deleteConversation = async (conversationId, e) => {
    e?.stopPropagation();
    
    Modal.confirm({
      title: 'Xóa cuộc trò chuyện?',
      content: 'Bạn có chắc muốn xóa cuộc trò chuyện này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await aiChatHistoryService.deleteHistory(conversationId);
          
          // Remove from list
          setConversations(prev => prev.filter(conv => conv.id !== conversationId));
          
          // If this was the active conversation, start new chat
          if (currentHistoryId === conversationId) {
            startNewChat();
          }
          
          toast.success('Đã xóa cuộc trò chuyện!', {
            icon: '🗑️',
            duration: 2000,
          });
        } catch (error) {
          console.error('Failed to delete conversation:', error);
          toast.error('Không thể xóa cuộc trò chuyện');
        }
      }
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessageText = inputMessage;
    const userMessage = {
      id: Date.now(),
      text: userMessageText,
      sender: "user",
      timestamp: new Date()
    };

    // Enable auto-scroll when sending a message
    shouldAutoScrollRef.current = true;
    
    setMessages(prev => [...prev, userMessage]);
    
    // Add to conversation history for context
    const newHistory = [...conversationHistory, { role: 'user', content: userMessageText }];
    setConversationHistory(newHistory);
    
    setInputMessage('');
    setIsTyping(true);

    try {
      console.log('🤖 Sending message to AI service...');
      
      // Get AI response using the AI service
      const aiResponse = await aiService.getChatResponse(userMessageText, newHistory);
      
      const aiMessageId = Date.now() + 1;
      const aiMessage = {
        id: aiMessageId,
        text: aiResponse,
        sender: "ai",
        timestamp: new Date(),
        reactions: { thumbsUp: 0, thumbsDown: 0 },
        isStreaming: true
      };

      setMessages(prev => [...prev, aiMessage]);
      setStreamingMessageId(aiMessageId);
      
      // Update conversation history
      setConversationHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      
      // Save to backend (fire and forget - don't wait)
      saveChatHistory(userMessageText, aiResponse);
      
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      
      // Fallback response on error
      const errorMessage = {
        id: Date.now() + 1,
        text: "😅 Xin lỗi, tôi đang gặp một chút vấn đề kỹ thuật. Hãy thử lại sau một chút nhé!\n\nTrong thời gian chờ đợi, bạn có thể:\n• Kiểm tra kết nối internet\n• Thử đặt câu hỏi khác\n• Liên hệ support nếu vấn đề tiếp tục",
        sender: "ai",
        timestamp: new Date(),
        reactions: { thumbsUp: 0, thumbsDown: 0 },
        isStreaming: false
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast.error('Có lỗi xảy ra khi kết nối AI', {
        icon: '⚠️',
        duration: 4000,
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Save chat history to backend
  const saveChatHistory = async (query, response) => {
    try {
      const savedHistory = await aiChatHistoryService.saveHistory(query, response);
      console.log('✅ Chat history saved:', savedHistory);
      
      // Reload history list to show the new conversation
      await loadChatHistory();
    } catch (error) {
      console.error('⚠️ Failed to save chat history (non-critical):', error);
      // Don't show error to user - this is a background operation
    }
  };

  const startNewChat = () => {
    // Enable auto-scroll for new chat
    shouldAutoScrollRef.current = true;
    
    setMessages([{
      id: 1,
      text: "👋 Xin chào! Tôi là **StudySync AI**, trợ lý học tập thông minh của bạn.\n\n🎯 Tôi có thể giúp bạn:\n• Tìm kiếm nhóm học phù hợp\n• Giải đáp thắc mắc về môn học\n• Tạo kế hoạch học tập\n• Hỗ trợ giải bài tập\n\nBạn cần hỗ trợ gì hôm nay? 😊",
      sender: "ai",
      timestamp: new Date(),
      type: "welcome",
      isStreaming: false
    }]);
    
    // Reset conversation history
    setConversationHistory([]);
    
    // Clear current history ID and deactivate all conversations
    setCurrentHistoryId(null);
    setConversations(prev => prev.map(conv => ({ ...conv, isActive: false })));
    
    toast.success('Đã tạo cuộc trò chuyện mới!', {
      icon: '✨',
      duration: 2000,
    });
  };

  // Voice input functionality
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Trình duyệt không hỗ trợ nhận diện giọng nói', {
        icon: '🎤',
        duration: 3000,
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success('Đang nghe... Hãy nói điều bạn muốn hỏi!', {
        icon: '🎤',
        duration: 2000,
      });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      toast.success('Đã nhận diện giọng nói!', {
        icon: '✅',
        duration: 2000,
      });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error('Lỗi nhận diện giọng nói. Hãy thử lại!', {
        icon: '❌',
        duration: 3000,
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // AI Settings
  const aiSettings = [
    {
      key: 'openai',
      label: 'OpenAI GPT',
      icon: '🧠',
      description: 'Mạnh về lý luận và sáng tạo'
    },
    {
      key: 'gemini',
      label: 'Google Gemini',
      icon: '✨',
      description: 'Tốt cho phân tích và tìm kiếm'
    },
    {
      key: 'local',
      label: 'Local AI',
      icon: '🏠',
      description: 'AI riêng của StudySync'
    }
  ];

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép tin nhắn!', {
      icon: '📋',
      duration: 2000,
    });
  };

  const reactToMessage = (messageId, reaction) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, reactions: { ...msg.reactions, [reaction]: (msg.reactions?.[reaction] || 0) + 1 } }
        : msg
    ));
    toast.success(reaction === 'thumbsUp' ? 'Cảm ơn phản hồi tích cực!' : 'Cảm ơn phản hồi của bạn!', {
      icon: reaction === 'thumbsUp' ? '👍' : '👎',
      duration: 2000,
    });
  };

  // Quick action buttons
  const quickActions = [
    {
      icon: '📚',
      text: 'Phương pháp học tập',
      message: 'Bạn có thể gợi ý một số phương pháp học tập hiệu quả không?'
    },
    {
      icon: '🎯',
      text: 'Lập kế hoạch học',
      message: 'Hướng dẫn tôi cách lập kế hoạch học tập hiệu quả'
    },
    {
      icon: '👥',
      text: 'Học nhóm',
      message: 'Làm thế nào để tạo và tham gia nhóm học hiệu quả?'
    },
    {
      icon: '🧮',
      text: 'Giải toán',
      message: 'Tôi cần hỗ trợ giải bài tập toán'
    }
  ];

  const handleQuickAction = (action) => {
    setInputMessage(action.message);
  };

  return (
    <>
      <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #A640A0, #6D17AE)' }}>
        <Sidebar />
        
        <div className="flex flex-1 h-screen">
          {/* Chat-specific Sidebar */}
          <div className="w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <MessageOutlined className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">AI TRỢ LÝ</h1>
                  <p className="text-white/60 text-xs">Hỗ trợ học tập thông minh</p>
                </div>
              </div>
              <button 
                onClick={startNewChat}
                className="w-full flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium border border-white/30"
              >
                <PlusOutlined className="text-lg" />
                Cuộc trò chuyện mới
              </button>
            </div>

            {/* Chat History Section */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white/80 flex items-center">
                    <HistoryOutlined className="mr-2" />
                    Lịch sử trò chuyện
                  </h3>
                  {loadingHistory && (
                    <Spin size="small" indicator={<LoadingOutlined spin style={{ color: 'white' }} />} />
                  )}
                </div>
                
                {conversations.length === 0 && !loadingHistory ? (
                  <div className="text-center py-8">
                    <p className="text-white/50 text-xs">
                      Chưa có lịch sử trò chuyện
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => loadConversation(conv)}
                        className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          conv.isActive 
                            ? 'bg-white/20 border border-white/30' 
                            : 'hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">
                              {conv.title}
                            </h4>
                            <p className="text-xs text-white/60 truncate mt-1">
                              {conv.lastMessage}
                            </p>
                            <span className="text-xs text-white/50 mt-1 block">
                              {conv.time}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                            <Tooltip title="Xóa">
                              <button 
                                onClick={(e) => deleteConversation(conv.id, e)}
                                className="p-1.5 hover:bg-red-500/30 rounded transition-colors"
                              >
                                <DeleteOutlined className="text-xs text-white/80 hover:text-red-300" />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <MessageOutlined className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">StudySync AI</h1>
                <p className="text-sm text-white/80">Trợ lý học tập thông minh</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-white/80">Đang hoạt động</span>
              </div>

            </div>
          </div>
        </div>

            {/* Messages Area */}
            <div 
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4" 
              style={{ background: 'rgba(0, 0, 0, 0.2)' }}
            >
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ 
                  duration: 0.2,
                  ease: "easeOut"
                }}
                className={`flex items-start gap-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'ai' && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                  >
                    <RobotOutlined className="text-white text-lg" />
                  </motion.div>
                )}
                
                <div className={`max-w-2xl ${message.sender === 'user' ? 'order-1' : 'order-2'}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`px-4 py-3 rounded-2xl relative group ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                        : message.type === 'welcome'
                        ? 'bg-gradient-to-r from-purple-900 via-blue-900 to-purple-900 text-white border border-purple-700'
                        : 'bg-gray-800 text-gray-100 border border-gray-700'
                    }`}
                  >
                    {/* Message content with streaming/markdown support */}
                    {message.sender === 'ai' && message.isStreaming ? (
                      <StreamingText 
                        text={message.text}
                        speed={2}
                        enabled={true}
                        onComplete={() => {
                          // Mark streaming as complete
                          if (message.id === streamingMessageId) {
                            setMessages(prev => prev.map(msg => 
                              msg.id === message.id ? { ...msg, isStreaming: false } : msg
                            ));
                            setStreamingMessageId(null);
                          }
                        }}
                        className="text-sm leading-relaxed whitespace-pre-wrap"
                      />
                    ) : (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.text.split('**').map((part, i) => 
                          i % 2 === 0 ? part : <strong key={i} className="font-bold">{part}</strong>
                        )}
                      </div>
                    )}
                    
                    {/* Message actions for AI messages */}
                    {message.sender === 'ai' && (
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700">
                        <div className="flex items-center gap-2">
                          <Tooltip title="Sao chép">
                            <Button
                              type="text"
                              size="small"
                              icon={<Copy className="w-3 h-3" />}
                              className="text-gray-400 hover:text-white"
                              style={{
                                color: 'white'
                               }}
                              onClick={() => copyMessage(message.text)}
                            />
                          </Tooltip>
                          <Tooltip title="Hữu ích">
                            <Button
                              type="text"
                              size="small"
                              icon={<ThumbsUp className="w-3 h-3" />}
                              className="text-gray-400 hover:text-green-400"
                              style={{
                                color: 'white'
                               }}
                              onClick={() => reactToMessage(message.id, 'thumbsUp')}
                            />
                          </Tooltip>
                          <Tooltip title="Không hữu ích">
                            <Button
                              type="text"
                              size="small"
                              icon={<ThumbsDown className="w-3 h-3" />}
                              className="text-gray-400 hover:text-red-400"
                              style={{
                                color: 'white'
                               }}
                              onClick={() => reactToMessage(message.id, 'thumbsDown')}
                            />
                          </Tooltip>
                        </div>
                        
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString('vi-VN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    )}
                    
                    {/* User message timestamp */}
                    {message.sender === 'user' && (
                      <span className="text-xs opacity-70 mt-2 block">
                        {message.timestamp.toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    )}
                  </motion.div>
                </div>

                {message.sender === 'user' && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                  >
                    <UserOutlined className="text-white text-lg" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Enhanced Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-start gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <RobotOutlined className="text-white text-lg" />
              </div>
              <Card className="bg-white/10 border-white/30 backdrop-blur-sm" bodyStyle={{ padding: '16px' }}>
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <motion.div 
                      className="w-2 h-2 bg-purple-400 rounded-full"
                      animate={{ y: [-2, 2, -2] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ y: [-2, 2, -2] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-pink-400 rounded-full"
                      animate={{ y: [-2, 2, -2] }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    AI đang suy nghĩ...
                  </span>
                </div>
              </Card>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

            {/* Input Area */}
            <div className="bg-white/10 backdrop-blur-lg border-t border-white/20 p-4">
            <div className="max-w-4xl mx-auto">
              {/* Quick Actions */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickAction(action)}
                      className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors duration-200 border border-white/20"
                    >
                      <span>{action.icon}</span>
                      <span>{action.text}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Hỏi AI về bất kỳ điều gì... (Enter để gửi, Shift+Enter để xuống dòng)"
                    className="w-full bg-white/10 border border-white/30 rounded-2xl px-4 py-3 pr-20 text-white placeholder-white/60 focus:outline-none focus:border-white/50 focus:ring-2 focus:ring-white/20 resize-none transition-all duration-200 backdrop-blur-sm"
                  rows={1}
                  style={{ 
                    minHeight: '48px',
                    maxHeight: '120px'
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                />
                
                {/* Voice Input Button */}
                <button
                  onClick={startVoiceInput}
                  disabled={isListening || isTyping}
                  className={`absolute right-12 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 backdrop-blur-sm border border-white/30 ${
                    isListening 
                      ? 'bg-red-500/30 text-red-300 animate-pulse' 
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors duration-200 backdrop-blur-sm border border-white/30"
                >
                  <SendOutlined className="text-sm" />
                </button>
              </div>
              
              <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                <span>AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.</span>
                <span>Powered by {aiSettings.find(s => s.key === aiProvider)?.label || 'StudySync AI'}</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}