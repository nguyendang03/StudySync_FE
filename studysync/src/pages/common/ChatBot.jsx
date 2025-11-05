import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageOutlined, 
  PlusOutlined, 
  SendOutlined, 
  UserOutlined, 
  HistoryOutlined,
  DeleteOutlined,
  RobotOutlined,
  LoadingOutlined,
  BookOutlined,
  FileTextOutlined,
  TeamOutlined,
  CalculatorOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Tooltip, Modal, Spin } from 'antd';
import { Copy, ThumbsUp, ThumbsDown, Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/layout/Sidebar';
import aiService from '../../services/aiService';
import aiChatHistoryService from '../../services/aiChatHistoryService';
import StreamingText from '../../components/ai/StreamingText';

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
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
    
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: smooth ? "smooth" : "auto",
        block: "end"
      });
    });
  };

  const isNearBottom = () => {
    if (!messagesContainerRef.current) return true;
    
    const container = messagesContainerRef.current;
    const threshold = 150;
    const position = container.scrollTop + container.clientHeight;
    const height = container.scrollHeight;
    
    return height - position < threshold;
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    shouldAutoScrollRef.current = isNearBottom();
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    if (shouldAutoScrollRef.current || messages.length === 1) {
      const timeoutId = setTimeout(() => {
        scrollToBottom(true);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const historyData = await aiChatHistoryService.getHistory(1, 50);
      const formattedHistory = aiChatHistoryService.formatHistoryForDisplay(historyData.data.items || []);
      setConversations(formattedHistory);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadConversation = async (conversation) => {
    try {
      setConversations(prev => 
        prev.map(conv => ({ ...conv, isActive: conv.id === conversation.id }))
      );
      
      setCurrentHistoryId(conversation.id);
      
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
      
      setConversationHistory([
        { role: 'user', content: conversation.fullQuery },
        { role: 'assistant', content: conversation.fullResponse }
      ]);
      
      toast.success('Đã tải cuộc trò chuyện');
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Không thể tải cuộc trò chuyện');
    }
  };

  const deleteConversation = async (conversationId, e) => {
    e?.stopPropagation();
    
    Modal.confirm({
      title: 'Xóa cuộc trò chuyện?',
      content: 'Bạn có chắc muốn xóa cuộc trò chuyện này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await aiChatHistoryService.deleteHistory(conversationId);
          setConversations(prev => prev.filter(conv => conv.id !== conversationId));
          
          if (currentHistoryId === conversationId) {
            startNewChat();
          }
          
          toast.success('Đã xóa cuộc trò chuyện');
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

    shouldAutoScrollRef.current = true;
    
    setMessages(prev => [...prev, userMessage]);
    
    const newHistory = [...conversationHistory, { role: 'user', content: userMessageText }];
    setConversationHistory(newHistory);
    
    setInputMessage('');
    setIsTyping(true);

    try {
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
      
      setConversationHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      
      saveChatHistory(userMessageText, aiResponse);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.",
        sender: "ai",
        timestamp: new Date(),
        reactions: { thumbsUp: 0, thumbsDown: 0 },
        isStreaming: false
      };

      setMessages(prev => [...prev, errorMessage]);
      toast.error('Có lỗi xảy ra khi kết nối AI');
    } finally {
      setIsTyping(false);
    }
  };

  const saveChatHistory = async (query, response) => {
    try {
      await aiChatHistoryService.saveHistory(query, response);
      await loadChatHistory();
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  };

  const startNewChat = () => {
    shouldAutoScrollRef.current = true;
    setMessages([]);
    setConversationHistory([]);
    setCurrentHistoryId(null);
    setConversations(prev => prev.map(conv => ({ ...conv, isActive: false })));
    toast.success('Cuộc trò chuyện mới đã được tạo');
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Trình duyệt không hỗ trợ nhận diện giọng nói');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success('Đang nghe...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      toast.success('Đã nhận diện giọng nói');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error('Lỗi nhận diện giọng nói');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Đã sao chép');
  };

  const reactToMessage = (messageId, reaction) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, reactions: { ...msg.reactions, [reaction]: (msg.reactions?.[reaction] || 0) + 1 } }
        : msg
    ));
  };

  const quickActions = [
    {
      icon: <BookOutlined />,
      text: 'Phương pháp học tập',
      description: 'Khám phá các kỹ thuật học hiệu quả',
      message: 'Bạn có thể gợi ý một số phương pháp học tập hiệu quả không?'
    },
    {
      icon: <FileTextOutlined />,
      text: 'Lập kế hoạch học',
      description: 'Tạo lộ trình học tập cá nhân',
      message: 'Hướng dẫn tôi cách lập kế hoạch học tập hiệu quả'
    },
    {
      icon: <TeamOutlined />,
      text: 'Học nhóm',
      description: 'Tìm và tham gia nhóm học tập',
      message: 'Làm thế nào để tạo và tham gia nhóm học hiệu quả?'
    },
    {
      icon: <CalculatorOutlined />,
      text: 'Giải bài tập',
      description: 'Hỗ trợ giải đáp bài tập các môn',
      message: 'Tôi cần hỗ trợ giải bài tập'
    }
  ];

  const handleQuickAction = (action) => {
    setInputMessage(action.message);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-1 h-screen">
        {/* Chat-specific Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-300 flex flex-col shadow-lg">
          {/* Header */}
          <div className="p-4 border-b border-gray-300 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <MessageOutlined className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900">StudySync AI</h1>
                <p className="text-gray-500 text-xs">Trợ lý học tập</p>
              </div>
            </div>
            <button 
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-lg transition-colors duration-200 font-medium text-sm"
            >
              <PlusOutlined />
              Trò chuyện mới
            </button>
          </div>

          {/* Chat History Section */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <HistoryOutlined />
                  Lịch sử
                </h3>
                {loadingHistory && (
                  <Spin size="small" />
                )}
              </div>
              
              {conversations.length === 0 && !loadingHistory ? (
                <div className="text-center py-12">
                  <HistoryOutlined className="text-3xl text-gray-300 mb-2" />
                  <p className="text-gray-400 text-xs">
                    Chưa có cuộc trò chuyện
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => loadConversation(conv)}
                      className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-150 ${
                        conv.isActive 
                          ? 'bg-white border border-purple-300 shadow-sm' 
                          : 'hover:bg-white hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {conv.title}
                          </h4>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {conv.lastMessage}
                          </p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <ClockCircleOutlined className="text-gray-400 text-xs" />
                            <span className="text-xs text-gray-400">
                              {conv.time}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => deleteConversation(conv.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded transition-all"
                        >
                          <DeleteOutlined className="text-xs text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
          >
            {messages.length === 0 ? (
              // Welcome Screen
              <div className="h-full flex flex-col items-center justify-center p-8 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-12"
                >
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <RobotOutlined className="text-white text-3xl" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    StudySync AI Assistant
                  </h1>
                  <p className="text-gray-500 text-base max-w-md mx-auto">
                    Trợ lý học tập thông minh của bạn. Hãy bắt đầu bằng một câu hỏi hoặc chọn một chủ đề bên dưới.
                  </p>
                </motion.div>

                {/* Quick Action Cards */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleQuickAction(action)}
                      className="group p-5 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-purple-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="text-purple-600 text-2xl mb-3 group-hover:scale-110 transition-transform">
                        {action.icon}
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {action.text}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {action.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              // Messages
              <div className="p-6 space-y-4 max-w-4xl mx-auto w-full">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start gap-3 ${
                        message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'ai' 
                          ? 'bg-purple-600' 
                          : 'bg-gray-700'
                      }`}>
                        {message.sender === 'ai' ? (
                          <RobotOutlined className="text-white text-sm" />
                        ) : (
                          <UserOutlined className="text-white text-sm" />
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <div className="flex-1 max-w-2xl">
                        <div className={`px-4 py-3 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-purple-600 text-white ml-auto'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {message.sender === 'ai' && message.isStreaming ? (
                            <StreamingText 
                              text={message.text}
                              speed={2}
                              enabled={true}
                              onComplete={() => {
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
                                i % 2 === 0 ? part : <strong key={i} className="font-semibold">{part}</strong>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Message Actions */}
                        {message.sender === 'ai' && !message.isStreaming && (
                          <div className="flex items-center gap-2 mt-2 ml-2">
                            <Tooltip title="Sao chép">
                              <button
                                onClick={() => copyMessage(message.text)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5 text-gray-400" />
                              </button>
                            </Tooltip>
                            <Tooltip title="Hữu ích">
                              <button
                                onClick={() => reactToMessage(message.id, 'thumbsUp')}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <ThumbsUp className="w-3.5 h-3.5 text-gray-400" />
                              </button>
                            </Tooltip>
                            <Tooltip title="Không hữu ích">
                              <button
                                onClick={() => reactToMessage(message.id, 'thumbsDown')}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <ThumbsDown className="w-3.5 h-3.5 text-gray-400" />
                              </button>
                            </Tooltip>
                            <span className="text-xs text-gray-400 ml-auto">
                              {message.timestamp.toLocaleTimeString('vi-VN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        )}
                        
                        {message.sender === 'user' && (
                          <div className="text-xs text-gray-400 mt-1 mr-2 text-right">
                            {message.timestamp.toLocaleTimeString('vi-VN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <RobotOutlined className="text-white text-sm" />
                    </div>
                    <div className="px-4 py-3 bg-gray-100 rounded-2xl">
                      <div className="flex space-x-1.5">
                        <motion.div 
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [-2, 2, -2] }}
                          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [-2, 2, -2] }}
                          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [-2, 2, -2] }}
                          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-4xl mx-auto">
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
                  placeholder="Nhập câu hỏi của bạn..."
                  className="w-full bg-gray-50 border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-xl px-4 py-3 pr-24 text-gray-900 placeholder-gray-400 focus:outline-none resize-none transition-all duration-200"
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
                
                {/* Action Buttons */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Tooltip title={isListening ? "Đang nghe..." : "Nhập bằng giọng nói"}>
                    <button
                      onClick={startVoiceInput}
                      disabled={isListening || isTyping}
                      className={`p-2 rounded-lg transition-colors ${
                        isListening 
                          ? 'bg-red-100 text-red-600' 
                          : 'hover:bg-gray-100 text-gray-500'
                      }`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </Tooltip>

                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200"
                  >
                    <SendOutlined />
                  </button>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-400 text-center">
                StudySync AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
