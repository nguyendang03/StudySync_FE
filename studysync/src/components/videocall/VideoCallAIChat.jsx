import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Avatar, Button, Badge, Tooltip, Spin } from 'antd';
import { 
  SendOutlined, 
  CloseOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { Brain, Sparkles, BookOpen } from 'lucide-react';
import aiService from '../../services/aiService';
import aiChatHistoryService from '../../services/aiChatHistoryService';
import { useAuthStore } from '../../stores';

const { TextArea } = Input;

export default function VideoCallAIChat({ 
  isOpen, 
  onClose,
  groupId,
  groupName
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  
  const messagesEndRef = useRef(null);
  const { user } = useAuthStore();

  const currentUserId = user?.data?.id || user?.id;
  const currentUserName = user?.data?.username || user?.username || user?.data?.email || user?.email;

  useEffect(() => {
    // Create a new conversation when component opens
    const initConversation = async () => {
      try {
        const conversation = await aiChatHistoryService.createConversation(
          `AI Chat - ${groupName} - ${new Date().toLocaleString('vi-VN')}`
        );
        setCurrentConversationId(conversation.id);
        console.log('✅ Created new AI conversation:', conversation.id);
      } catch (error) {
        console.error('❌ Failed to create AI conversation:', error);
      }
    };

    if (isOpen && !currentConversationId) {
      initConversation();
    }
  }, [isOpen, groupName, currentConversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
      userName: currentUserName
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get AI response
      console.log('🤖 Sending message to AI...');
      const response = await aiService.getChatResponse(inputMessage, conversationHistory);
      console.log('✅ AI response received');

      const aiMessage = {
        id: `ai-${Date.now()}`,
        text: response,
        sender: "ai",
        timestamp: new Date(),
        reactions: { thumbsUp: 0, thumbsDown: 0 }
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update conversation history for context
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: inputMessage },
        { role: 'assistant', content: response }
      ]);

      // Save to backend with conversation ID
      try {
        console.log('💾 Saving AI chat history...', {
          conversationId: currentConversationId,
          query: inputMessage,
          responsePreview: response.substring(0, 100)
        });
        
        await aiChatHistoryService.saveHistory(
          inputMessage,
          response,
          currentConversationId
        );
        console.log('✅ AI chat history saved successfully');
      } catch (saveError) {
        console.error('❌ Failed to save AI chat history:', saveError);
        // Don't fail the whole operation if saving fails
      }

    } catch (error) {
      console.error('❌ AI Error:', error);
      
      // Add error message to chat
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: `⚠️ Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.\n\nLỗi: ${error.message}`,
        sender: "ai",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getQuickPrompts = () => [
    { icon: <BookOpen className="w-4 h-4" />, text: "Giải thích khái niệm này" },
    { icon: <ThunderboltOutlined />, text: "Tóm tắt nội dung" },
    { icon: <RobotOutlined />, text: "Đề xuất bài tập" },
    { icon: <HistoryOutlined />, text: "Tạo kế hoạch học" },
  ];

  const handleQuickPrompt = (promptText) => {
    setInputMessage(promptText);
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
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Brain className="w-6 h-6" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              AI Trợ Lý
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </h3>
            <div className="flex items-center gap-2 text-xs text-purple-100">
              <Badge status="processing" className="custom-badge" />
              <span>Sẵn sàng hỗ trợ</span>
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

      {/* Welcome Message */}
      {messages.length === 0 && !isLoading && (
        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="text-center mb-4">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-3"
            >
              <Brain className="w-16 h-16 text-purple-600" />
            </motion.div>
            <h4 className="text-lg font-bold text-gray-800 mb-2">
              Xin chào! Tôi là StudySync AI 👋
            </h4>
            <p className="text-sm text-gray-600">
              Tôi có thể giúp bạn với các câu hỏi học tập trong cuộc gọi này
            </p>
          </div>

          {/* Quick Prompts */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Gợi ý câu hỏi:
            </p>
            {getQuickPrompts().map((prompt, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickPrompt(prompt.text)}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all text-left group"
              >
                <div className="text-purple-600 group-hover:text-purple-700">
                  {prompt.icon}
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {prompt.text}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            const isError = msg.isError;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isUser && (
                  <Avatar 
                    size={36}
                    className="flex-shrink-0 bg-gradient-to-br from-purple-600 to-pink-600"
                    icon={<Brain className="w-5 h-5" />}
                  />
                )}
                {isUser && (
                  <Avatar 
                    size={36}
                    className="flex-shrink-0 bg-gradient-to-br from-blue-600 to-cyan-600"
                  >
                    {msg.userName?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                )}
                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  {!isUser && (
                    <span className="text-xs text-gray-500 mb-1 px-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      StudySync AI
                    </span>
                  )}
                  <div className={`
                    px-4 py-3 rounded-2xl
                    ${isUser 
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-sm' 
                      : isError
                        ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-sm'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm'
                    }
                  `}>
                    <p className="text-sm break-words whitespace-pre-wrap leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 px-2">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <Avatar 
              size={36}
              className="flex-shrink-0 bg-gradient-to-br from-purple-600 to-pink-600"
              icon={<Brain className="w-5 h-5" />}
            />
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <Spin size="small" />
                <span className="text-sm text-gray-600">AI đang suy nghĩ...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        {messages.length > 0 && !isLoading && (
          <div className="mb-3 flex flex-wrap gap-2">
            {getQuickPrompts().slice(0, 2).map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt.text)}
                className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 transition-colors border border-purple-200"
              >
                {prompt.text}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <TextArea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Hỏi AI về bất kỳ điều gì..."
            autoSize={{ minRows: 1, maxRows: 3 }}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            loading={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 border-none self-end hover:from-purple-700 hover:to-pink-700"
          />
        </div>

        {/* Info Text */}
        <p className="text-xs text-gray-500 mt-2 text-center">
          Lịch sử chat được lưu tự động • Powered by AI
        </p>
      </div>
    </motion.div>
  );
}
