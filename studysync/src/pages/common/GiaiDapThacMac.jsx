import React, { useState, useEffect } from 'react';
import { SearchOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function GiaiDapThacMac() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // FAQ data based on the design
  const faqData = [
    {
      id: 1,
      question: "StudySync là gì?",
      answer: "StudySync là một nền tảng học trực tuyến hiện đại giúp bạn dễ dàng tạo ra, tìm kiếm nhóm học tập và quản lý các hoạt động học tập một cách hiệu quả. Với công nghệ AI tiên tiến, chúng tôi mang đến trải nghiệm học tập tối ưu cho mọi người dùng.",
      number: "1"
    },
    {
      id: 2,
      question: "Dùng StudySync một mình được không?",
      answer: "Có, bạn có thể sử dụng StudySync như một công cụ học tập cá nhân để theo dõi và quản lý tiến độ học tập của bạn. Nền tảng cung cấp nhiều tính năng hỗ trợ học tập cá nhân như lập kế hoạch học tập, theo dõi tiến độ và ghi chú.",
      number: "2"
    },
    {
      id: 3,
      question: "StudySync có miễn phí không?",
      answer: "StudySync cung cấp nhiều tính năng miễn phí cơ bản cho người dùng. Đối với những tính năng nâng cao và Premium, chúng tôi có các gói dịch vụ với mức phí hợp lý để duy trì và phát triển nền tảng ngày càng tốt hơn.",
      number: "3"
    },
    {
      id: 4,
      question: "Làm sao để tạo nhóm học?",
      answer: "Bạn có thể tạo nhóm học một cách dễ dàng bằng cách truy cập vào trang 'Nhóm học', nhấn nút 'Tạo nhóm mới', điền đầy đủ thông tin về nhóm như tên nhóm, mô tả, môn học và bắt đầu mời các thành viên tham gia.",
      number: "4"
    },
    {
      id: 5,
      question: "Ai có thể giúp tôi những gì trong quá trình học?",
      answer: "Trong StudySync, bạn có thể nhận được sự hỗ trợ từ nhiều nguồn: các thành viên khác trong nhóm học, hệ thống AI thông minh, cộng đồng học tập rộng lớn và đội ngũ hỗ trợ kỹ thuật của chúng tôi.",
      number: "5"
    },
    {
      id: 6,
      question: "Tôi có thể học cùng bạn bè như thế nào?",
      answer: "Bạn có thể mời bạn bè tham gia nhóm học của mình hoặc tham gia các nhóm mà bạn bè đã tạo. Hệ thống cho phép chia sẻ tài liệu, thảo luận trực tuyến, lên kế hoạch học chung và theo dõi tiến độ của cả nhóm.",
      number: "6"
    }
  ];

  // Additional FAQ items for "Show More" functionality
  const additionalFaqData = [
    {
      id: 7,
      question: "Làm thế nào để tham gia nhóm học?",
      answer: "Bạn có thể tìm kiếm nhóm học phù hợp trong trang 'Khám phá nhóm', gửi yêu cầu tham gia hoặc sử dụng mã mời từ nhóm trưởng. Sau khi được chấp nhận, bạn có thể truy cập vào tất cả tài liệu và hoạt động của nhóm.",
      number: "7"
    },
    {
      id: 8,
      question: "Tôi có thể chia sẻ tài liệu như thế nào?",
      answer: "Trong mỗi nhóm học, bạn có thể upload tài liệu, ghi chú, hình ảnh và chia sẻ với các thành viên khác. Hệ thống hỗ trợ nhiều định dạng file khác nhau như PDF, Word, PowerPoint, Excel và hình ảnh.",
      number: "8"
    },
    {
      id: 9,
      question: "StudySync có hỗ trợ video call không?",
      answer: "Hiện tại StudySync đang phát triển tính năng video call tích hợp. Trong thời gian này, bạn có thể sử dụng các liên kết video call bên ngoài và chia sẻ trong nhóm để tổ chức các buổi học trực tuyến.",
      number: "9"
    }
  ];

  const allFaqData = showMore ? [...faqData, ...additionalFaqData] : faqData;

  const filteredFaq = allFaqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardClick = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  return (
    <>
      <Header />
      <div
        className={`min-h-screen transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'linear-gradient(135deg, #A640A0, #6D17AE)' }}
      >
        {/* Header Section with Decorative Pattern */}
        <div className="relative overflow-hidden py-16">
          {/* Decorative Checkerboard Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="flex flex-wrap">
              {[...Array(200)].map((_, i) => (
                <div 
                  key={i} 
                  className={`${i % 2 === 0 ? 'bg-white' : 'bg-transparent'} h-4 w-4`}
                  style={{
                    width: '20px',
                    height: '20px'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Title and Image Section */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-white relative overflow-hidden">
          {/* Subtle background decorations */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-10 w-20 h-20 bg-purple-100 rounded-full blur-xl"></div>
            <div className="absolute top-32 right-20 w-32 h-32 bg-blue-100 rounded-full blur-xl"></div>
            <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-pink-100 rounded-full blur-xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 relative z-10">
            <div className={`transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
                {/* Title Section */}
                <div className="flex-1 text-center lg:text-left space-y-6">
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent leading-tight hover:scale-105 transition-transform duration-300 drop-shadow-sm">
                    GIẢI ĐÁP<br />
                    <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">THẮC MẮC</span>
                  </h1>
                  
                  {/* Subtitle */}
                  <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg">
                    Chúng tôi luôn sẵn sàng hỗ trợ bạn với mọi câu hỏi về StudySync. 
                    Tìm kiếm câu trả lời nhanh chóng và dễ dàng.
                  </p>
                </div>
                
                {/* Help Image */}
                <div className={`w-full lg:w-auto transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                  <div className="relative group">
                    {/* Main card */}
                    <div className="bg-gradient-to-br from-white via-purple-50 to-purple-100 rounded-3xl p-6 lg:p-8 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 max-w-sm mx-auto lg:max-w-none border border-purple-200/50 backdrop-blur-sm">
                      {/* Header badge */}
                      
                      <img 
                        src="/helpImage.png" 
                        alt="Customer Support Team" 
                        className="w-full h-36 sm:h-44 lg:w-80 lg:h-52 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      
                      {/* Fallback content */}
                      <div className="w-full h-36 sm:h-44 lg:w-80 lg:h-52 bg-gradient-to-br from-purple-100 via-purple-200 to-blue-100 rounded-2xl justify-center items-center hidden shadow-lg">
                        <div className="text-center">
                          <div className="text-5xl lg:text-7xl mb-3 lg:mb-4 animate-bounce">🎧</div>
                          <div className="text-base lg:text-xl font-bold text-purple-700 mb-1">Đội ngũ hỗ trợ</div>
                          <div className="text-sm lg:text-base text-purple-600 font-medium">Luôn sẵn sàng hỗ trợ bạn</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating elements */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
                    <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-purple-400 rounded-full opacity-40 animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ask Question Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 lg:mb-8 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                ĐẶT CÂU HỎI
              </h2>
              
              {/* Search Input */}
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  placeholder="Điền vào đây"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-4 sm:px-6 lg:px-8 py-4 lg:py-6 pr-12 lg:pr-16 rounded-2xl bg-white border-2 border-gray-200 text-gray-800 placeholder-gray-500 text-base lg:text-lg focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300 hover:shadow-lg shadow-sm"
                />
                <SearchOutlined 
                  className="absolute right-4 lg:right-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl lg:text-2xl hover:text-purple-600 transition-colors duration-200 cursor-pointer" 
                />
              </div>
            </div>
          </div>
        </div>
        {/* FAQ Grid Section */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 transition-all duration-700 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {filteredFaq.map((faq, index) => (
                <div
                  key={faq.id}
                  className={`bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border border-gray-100 ${
                    expandedCard === faq.id ? 'ring-4 ring-purple-300 shadow-2xl scale-105' : ''
                  }`}
                  style={{ 
                    animationDelay: `${900 + index * 150}ms`,
                    minHeight: '260px'
                  }}
                  onClick={() => handleCardClick(faq.id)}
                >
                  <div className="relative">
                    {/* Question Number */}
                    <div className="absolute -top-3 -left-3 md:-top-4 md:-left-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg shadow-lg">
                        {faq.number}
                      </div>
                    </div>
                    
                    {/* Question */}
                    <div className="pt-6 md:pt-8 pl-4 md:pl-6">
                      <h3 className="font-bold text-purple-700 mb-3 md:mb-4 text-base md:text-lg leading-relaxed hover:text-purple-800 transition-colors duration-200">
                        {faq.question}
                      </h3>
                      
                      {/* Answer */}
                      <div className={`overflow-hidden transition-all duration-500 ${
                        expandedCard === faq.id ? 'max-h-96 opacity-100' : 'max-h-16 md:max-h-20 opacity-80'
                      }`}>
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                      
                      {/* Expand/Collapse Indicator */}
                      <div className="flex justify-between items-center mt-4 md:mt-6">
                        <div className="text-xs md:text-sm text-purple-600 font-medium">
                          {expandedCard === faq.id ? 'Thu gọn' : 'Xem thêm'}
                        </div>
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors duration-200">
                          {expandedCard === faq.id ? (
                            <UpOutlined className="text-purple-600 text-xs md:text-sm" />
                          ) : (
                            <DownOutlined className="text-purple-600 text-xs md:text-sm" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show More Button */}
            <div className={`text-center mt-12 md:mt-16 transition-all duration-700 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <button
                onClick={toggleShowMore}
                className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-8 md:px-12 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-lg md:text-xl hover:bg-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl"
              >
                <span>{showMore ? 'ẨN BỚT ĐI' : 'HIỂN THỊ THÊM'}</span>
                {showMore ? (
                  <UpOutlined className="text-base md:text-lg" />
                ) : (
                  <DownOutlined className="text-base md:text-lg" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Decorative Section */}
        <div className="relative overflow-hidden pb-20">
          <div className="absolute bottom-0 left-0 w-full h-32 opacity-20">
            <div className="flex flex-wrap h-full">
              {[...Array(100)].map((_, i) => (
                <div 
                  key={i} 
                  className={`${i % 2 === 0 ? 'bg-white' : 'bg-transparent'} h-8 w-8`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
