import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageOutlined, 
  PlusOutlined, 
  SendOutlined, 
  UserOutlined, 
  HistoryOutlined,
  EditOutlined,
  DeleteOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Avatar, Tooltip, Badge, Dropdown, Card, Tag, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, Zap, Copy, ThumbsUp, ThumbsDown, Settings, Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/layout/Sidebar';
import aiService from '../../services/aiService';

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
  const [conversations, setConversations] = useState([
    { 
      id: 1, 
      title: "Hỗ trợ học tập", 
      lastMessage: "Cách tạo nhóm học mới?", 
      time: "2 phút trước", 
      isActive: true,
      category: "study",
      messageCount: 12
    },
    { 
      id: 2, 
      title: "Tìm mentor", 
      lastMessage: "Mentor JavaScript tốt nhất", 
      time: "1 giờ trước", 
      isActive: false,
      category: "mentor",
      messageCount: 8
    },
    { 
      id: 3, 
      title: "Lập kế hoạch học", 
      lastMessage: "Schedule học React", 
      time: "Hôm qua", 
      isActive: false,
      category: "planning",
      messageCount: 15
    }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Add to conversation history for context
    const newHistory = [...conversationHistory, { role: 'user', content: inputMessage }];
    setConversationHistory(newHistory);
    
    setInputMessage('');
    setIsTyping(true);

    try {
      console.log('🤖 Sending message to AI service...');
      
      // Get AI response using the AI service
      const aiResponse = await aiService.getChatResponse(inputMessage, newHistory);
      
      const aiMessage = {
        id: messages.length + 2,
        text: aiResponse,
        sender: "ai",
        timestamp: new Date(),
        reactions: { thumbsUp: 0, thumbsDown: 0 }
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation history
      setConversationHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      
      // Show success toast
      toast.success('AI đã trả lời!', {
        icon: '🤖',
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        },
      });
      
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      
      // Fallback response on error
      const errorMessage = {
        id: messages.length + 2,
        text: "😅 Xin lỗi, tôi đang gặp một chút vấn đề kỹ thuật. Hãy thử lại sau một chút nhé!\n\nTrong thời gian chờ đợi, bạn có thể:\n• Kiểm tra kết nối internet\n• Thử đặt câu hỏi khác\n• Liên hệ support nếu vấn đề tiếp tục",
        sender: "ai",
        timestamp: new Date(),
        reactions: { thumbsUp: 0, thumbsDown: 0 }
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

  const startNewChat = () => {
    setMessages([{
      id: 1,
      text: "👋 Xin chào! Tôi là **StudySync AI**, trợ lý học tập thông minh của bạn.\n\n🎯 Tôi có thể giúp bạn:\n• Tìm kiếm nhóm học phù hợp\n• Giải đáp thắc mắc về môn học\n• Tạo kế hoạch học tập\n• Hỗ trợ giải bài tập\n\nBạn cần hỗ trợ gì hôm nay? 😊",
      sender: "ai",
      timestamp: new Date(),
      type: "welcome"
    }]);
    
    // Reset conversation history
    setConversationHistory([]);
    
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
                <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center">
                  <HistoryOutlined className="mr-2" />
                  Lịch sử trò chuyện
                </h3>
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
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
                          <span className="text-xs text-white/50 mt-1">
                            {conv.time}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 hover:bg-white/20 rounded">
                            <EditOutlined className="text-xs text-white/60" />
                          </button>
                          <button className="p-1 hover:bg-white/20 rounded">
                            <DeleteOutlined className="text-xs text-white/60" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
              
              {/* AI Provider Selector */}
              <Dropdown 
                menu={{ 
                  items: aiSettings.map(setting => ({
                    key: setting.key,
                    label: (
                      <div className="flex items-center gap-2">
                        <span>{setting.icon}</span>
                        <div>
                          <div className="font-medium">{setting.label}</div>
                          <div className="text-xs text-gray-500">{setting.description}</div>
                        </div>
                      </div>
                    ),
                    onClick: () => setAiProvider(setting.key)
                  }))
                }}
                placement="bottomRight"
              >
                <Button 
                  type="text" 
                  size="small"
                  className="text-white/80 hover:text-white"
                  icon={<Settings className="w-4 h-4" />}
                />
              </Dropdown>
            </div>
          </div>
        </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
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
                    {/* Message content with markdown support */}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text.split('**').map((part, i) => 
                        i % 2 === 0 ? part : <strong key={i} className="font-bold">{part}</strong>
                      )}
                    </div>
                    
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
                              onClick={() => copyMessage(message.text)}
                            />
                          </Tooltip>
                          <Tooltip title="Hữu ích">
                            <Button
                              type="text"
                              size="small"
                              icon={<ThumbsUp className="w-3 h-3" />}
                              className="text-gray-400 hover:text-green-400"
                              onClick={() => reactToMessage(message.id, 'thumbsUp')}
                            />
                          </Tooltip>
                          <Tooltip title="Không hữu ích">
                            <Button
                              type="text"
                              size="small"
                              icon={<ThumbsDown className="w-3 h-3" />}
                              className="text-gray-400 hover:text-red-400"
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