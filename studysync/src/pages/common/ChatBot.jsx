import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageOutlined, 
  PlusOutlined, 
  SendOutlined, 
  UserOutlined, 
  HistoryOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  HomeOutlined,
  LogoutOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là AI trợ lý của StudySync. Tôi có thể giúp bạn với các câu hỏi về học tập, tìm kiếm nhóm học, hoặc bất kỳ thắc mắc nào khác. Bạn cần hỗ trợ gì hôm nay?",
      sender: "ai",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState([
    { id: 1, title: "Hỗ trợ học tập", lastMessage: "Cách tạo nhóm học mới?", time: "2 phút trước", isActive: true },
    { id: 2, title: "Tìm mentor", lastMessage: "Mentor JavaScript tốt nhất", time: "1 giờ trước", isActive: false },
    { id: 3, title: "Lập kế hoạch học", lastMessage: "Schedule học React", time: "Hôm qua", isActive: false }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "Tôi hiểu bạn cần hỗ trợ về vấn đề này. Để tôi giúp bạn tìm giải pháp tốt nhất.",
        "Đây là một câu hỏi rất hay! Dựa trên kinh nghiệm, tôi khuyên bạn nên...",
        "Tôi có thể giúp bạn với điều đó. Hãy cùng tôi phân tích từng bước.",
        "Theo dữ liệu từ StudySync, đây là những phương pháp hiệu quả nhất..."
      ];

      const aiMessage = {
        id: messages.length + 2,
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: "ai",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([{
      id: 1,
      text: "Xin chào! Tôi là AI trợ lý của StudySync. Tôi có thể giúp bạn với các câu hỏi về học tập, tìm kiếm nhóm học, hoặc bất kỳ thắc mắc nào khác. Bạn cần hỗ trợ gì hôm nay?",
      sender: "ai",
      timestamp: new Date()
    }]);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageOutlined className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">AI TRỢ LÝ</h1>
              <p className="text-gray-400 text-xs">Hỗ trợ học tập thông minh</p>
            </div>
          </div>
          <button 
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium"
          >
            <PlusOutlined className="text-lg" />
            Cuộc trò chuyện mới
          </button>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center">
              <HistoryOutlined className="mr-2" />
              Lịch sử trò chuyện
            </h3>
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    conv.isActive 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white truncate">
                        {conv.title}
                      </h4>
                      <p className="text-xs text-gray-400 truncate mt-1">
                        {conv.lastMessage}
                      </p>
                      <span className="text-xs text-gray-500 mt-1">
                        {conv.time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:bg-gray-700 rounded">
                        <EditOutlined className="text-xs text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-700 rounded">
                        <DeleteOutlined className="text-xs text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="border-t border-gray-800 p-4">
          <div className="space-y-2">
            <Link 
              to="/home"
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all group"
            >
              <HomeOutlined className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Trang chủ</span>
            </Link>
            <Link 
              to="/groups"
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all group"
            >
              <UserOutlined className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Khám phá nhóm</span>
            </Link>
            <Link 
              to="/my-groups"
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all group"
            >
              <BookOutlined className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Nhóm của tôi</span>
            </Link>
            <Link 
              to="/chatbot"
              className="flex items-center gap-3 px-4 py-3 text-white bg-gray-800 border border-gray-700 rounded-lg transition-all group"
            >
              <MessageOutlined className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">AI Trợ lý</span>
            </Link>
            
            <div className="border-t border-gray-700 my-2"></div>
            
            <Link 
              to="/faq"
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all group"
            >
              <QuestionCircleOutlined className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Hỗ trợ</span>
            </Link>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all group">
              <SettingOutlined className="text-lg group-hover:scale-110 transition-transform" />
              <span className="font-medium">Cài đặt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <MessageOutlined className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">StudySync AI</h1>
                <p className="text-sm text-gray-400">Trợ lý học tập thông minh</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-400">Đang hoạt động</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'ai' && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageOutlined className="text-white text-sm" />
                </div>
              )}
              
              <div
                className={`max-w-2xl px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.text}
                </p>
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>

              {message.sender === 'user' && (
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserOutlined className="text-gray-300 text-sm" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageOutlined className="text-white text-sm" />
              </div>
              <div className="bg-gray-800 px-4 py-3 rounded-2xl border border-gray-700">
                <div className="flex items-center gap-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">AI đang trả lời...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-gray-900 border-t border-gray-800 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Hỏi AI về bất kỳ điều gì..."
                className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all duration-200"
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
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <SendOutlined className="text-sm" />
              </button>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 text-center">
              AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}