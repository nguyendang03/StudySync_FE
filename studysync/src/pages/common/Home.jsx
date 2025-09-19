import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section with White Background */}
      <section className="bg-white py-8 lg:py-0 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center min-h-[500px] lg:min-h-[600px]">
            {/* Text Content */}
            <div className={`text-center lg:text-left order-2 lg:order-1 z-10 lg:pr-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Pink subtitle */}
              <p className={`text-pink-400 text-lg font-medium mb-4 uppercase tracking-wide transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                HỌC NHÓM THÔNG MINH HƠN CÙNG STUDYSYNC
              </p>
              
              {/* Main title */}
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-purple-800 mb-6 leading-tight transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                TRỢ LÝ AI HỌC TẬP CỦA BẠN
              </h1>
              
              {/* Description */}
              <p className={`text-gray-600 text-lg md:text-xl mb-8 leading-relaxed transition-all duration-1000 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                Tạo nhóm học dễ dàng, chia sẻ nội dung học tập, call online, giải bài tập - tất cả chỉ trong một nền tảng
              </p>
              
              <div className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start transition-all duration-1000 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <a
                  href="/register"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                >
                  Bắt đầu ngay
                </a>
                <a
                  href="#features"
                  className="border border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-lg text-lg font-medium transition-all duration-300 hover:scale-105 transform"
                >
                  Tìm hiểu thêm
                </a>
              </div>
            </div>

            {/* Home Image - Filling top right corner */}
            <div className={`order-1 lg:order-2 lg:absolute lg:right-0 lg:top-0 lg:w-1/2 lg:h-full flex items-center justify-end transition-all duration-1200 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <div className="w-full h-full flex items-center justify-center lg:justify-end">
                <img 
                  src="/homeImage.png" 
                  alt="StudySync Home Illustration" 
                  className="w-full h-auto object-contain lg:object-cover lg:h-full max-w-none hover:scale-105 transition-transform duration-700"
                  style={{ maxHeight: '500px' }}
                  onError={(e) => {
                    console.log('Home image failed to load:', e.target.src);
                    // Fallback to a placeholder if image fails
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-96 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center"><span class="text-purple-600 text-lg font-medium">StudySync</span></div>';
                  }}
                  onLoad={() => console.log('Home image loaded successfully')}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Combined Purple Section - All features, about, problems-solutions, and stats */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #A640A0 0%, #6D17AE 100%)' }}>
        {/* Background decorative circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: '#8E2FA6' }}></div>
          <div className="absolute top-32 right-20 w-24 h-24 rounded-full opacity-15" style={{ backgroundColor: '#8E2FA6' }}></div>
          <div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full opacity-10" style={{ backgroundColor: '#8E2FA6' }}></div>
          <div className="absolute top-1/2 right-10 w-28 h-28 rounded-full opacity-25" style={{ backgroundColor: '#8E2FA6' }}></div>
          <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 w-64 h-64 rounded-full opacity-5" style={{ backgroundColor: '#8E2FA6' }}></div>
          <div className="absolute top-1/3 right-1/3 w-20 h-20 rounded-full opacity-30" style={{ backgroundColor: '#8E2FA6' }}></div>
          <div className="absolute bottom-1/4 left-1/2 w-36 h-36 rounded-full opacity-15" style={{ backgroundColor: '#8E2FA6' }}></div>
          <div className="absolute bottom-16 left-16 w-24 h-24 rounded-full opacity-15" style={{ backgroundColor: '#8E2FA6' }}></div>
          <div className="absolute bottom-32 right-16 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: '#8E2FA6' }}></div>
        </div>
        
        <div className="relative z-10">
          {/* Features Section */}
          <div className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center text-white mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  TÍNH NĂNG NỔI BẬT
                </h2>
              </div>
              
              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Feature 1: AI trường nhớ */}
                <div className={`bg-white rounded-xl p-6 flex items-start space-x-4 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} delay-1000`}>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center hover:bg-purple-200 transition-colors duration-300">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI trường nhớ</h3>
                    <p className="text-gray-600 text-sm">Ghi nhớ kiến thức liên tục và hiệu quả</p>
                  </div>
                </div>

                {/* Feature 2: Phòng học ảo tích hợp */}
                <div className={`bg-white rounded-xl p-6 flex items-start space-x-4 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} delay-1200`}>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center hover:bg-purple-200 transition-colors duration-300">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Phòng học ảo tích hợp</h3>
                    <p className="text-gray-600 text-sm">Học tập online hiệu quả với công nghệ tiên tiến</p>
                  </div>
                </div>

                {/* Feature 3: AI giải bài & tạo đề cương */}
                <div className={`bg-white rounded-xl p-6 flex items-start space-x-4 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} delay-1400`}>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center hover:bg-purple-200 transition-colors duration-300">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI giải bài & tạo đề cương</h3>
                    <p className="text-gray-600 text-sm">Tạo bài tập và đề cương học tập</p>
                  </div>
                </div>

                {/* Feature 4: Tự động sắp xếp lịch học nhóm */}
                <div className={`bg-white rounded-xl p-6 flex items-start space-x-4 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} delay-1600`}>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center hover:bg-purple-200 transition-colors duration-300">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tự động sắp xếp lịch học nhóm</h3>
                    <p className="text-gray-600 text-sm">Sắp xếp lịch học phù hợp cho mọi thành viên</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Khám phá cách học hiện đại Section */}
          <div className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center text-white mb-20">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                  KHÁM PHÁ CÁCH HỌC HIỆN ĐẠI
                </h2>
                <p className="text-lg text-purple-100 max-w-3xl mx-auto leading-relaxed">
                  Trải nghiệm những phương pháp học tập tiên tiến được hỗ trợ bởi công nghệ AI và các giải pháp giáo dục thông minh
                </p>
              </div>
              
              {/* Top 3 Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                {/* Card 1 - Interactive Learning */}
                <div className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                  <div className="relative h-80 overflow-hidden">
                    <img 
                      src="/discoverImage.png" 
                      alt="Học Tập Tương Tác" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #eab308 100%)';
                      }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-purple-600/40 to-transparent"></div>
                    
                    {/* Top badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white text-purple-800 text-xs font-bold px-3 py-2 rounded-full shadow-md">
                        Học mọi lúc, mọi nơi
                      </span>
                    </div>
                    
                    {/* Bottom content */}
                    <div className="absolute bottom-6 left-4 right-4">
                      <h3 className="text-white font-bold text-xl mb-3">
                        Học Tập Tương Tác
                      </h3>
                      <p className="text-white/90 text-sm leading-relaxed mb-4">
                        Phương pháp học tập hiện đại với công nghệ AI giúp học sinh tiếp thu kiến thức một cách trực quan và hiệu quả.
                      </p>
                      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors group-hover:scale-105 transform duration-200 flex items-center">
                        Khám phá ngay
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Flexible Learning */}
                <div className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                  <div className="relative h-80 overflow-hidden">
                    <img 
                      src="/discoverImage.png" 
                      alt="Học Tập Linh Hoạt" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #6366f1 100%)';
                      }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-900/80 via-pink-600/40 to-transparent"></div>
                    
                    {/* Top badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white text-pink-800 text-xs font-bold px-3 py-2 rounded-full shadow-md">
                        Linh hoạt & tiện lợi
                      </span>
                    </div>
                    
                    {/* Bottom content */}
                    <div className="absolute bottom-6 left-4 right-4">
                      <h3 className="text-white font-bold text-xl mb-3">
                        Học Tập Linh Hoạt
                      </h3>
                      <p className="text-white/90 text-sm leading-relaxed mb-4">
                        Nền tảng học trực tuyến cho phép học sinh học tập mọi lúc, mọi nơi với thiết bị di động.
                      </p>
                      <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors group-hover:scale-105 transform duration-200 flex items-center">
                        Trải nghiệm ngay
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card 3 - Personalized Learning */}
                <div className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                  <div className="relative h-80 overflow-hidden">
                    <img 
                      src="/discoverImage.png" 
                      alt="Học Tập Cá Nhân Hóa" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #4338ca 100%)';
                      }}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-600/40 to-transparent"></div>
                    
                    {/* Top badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-white text-blue-800 text-xs font-bold px-3 py-2 rounded-full shadow-md">
                        AI cá nhân hóa
                      </span>
                    </div>
                    
                    {/* Bottom content */}
                    <div className="absolute bottom-6 left-4 right-4">
                      <h3 className="text-white font-bold text-xl mb-3">
                        Học Tập Cá Nhân Hóa
                      </h3>
                      <p className="text-white/90 text-sm leading-relaxed mb-4">
                        AI thông minh cá nhân hóa trải nghiệm học tập theo nhu cầu và khả năng của từng học sinh.
                      </p>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors group-hover:scale-105 transform duration-200 flex items-center">
                        Khám phá AI
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bài viết Section */}
              <div className="mb-16">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                    Bài Viết Nổi Bật
                  </h3>
                  <p className="text-purple-100 text-lg max-w-2xl mx-auto leading-relaxed">
                    Khám phá những bài viết chuyên sâu về phương pháp học tập hiện đại, công nghệ giáo dục và xu hướng mới trong việc học tập thông minh
                  </p>
                </div>
              </div>

              {/* Bottom 3 Cards Row with Navigation */}
              <div className="relative px-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Article Card 1 - AI Technology */}
                  <div className="group bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                    <div className="relative h-52 overflow-hidden">
                      <img 
                        src="/newsImage.png" 
                        alt="AI Technology" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.style.background = 'linear-gradient(135deg, #1e293b 0%, #3730a3 50%, #1e3a8a 100%)';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                          Mới nhất
                        </span>
                      </div>
                      {/* Tech pattern overlay */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 left-4 w-8 h-8 border border-white/30 rounded animate-pulse"></div>
                        <div className="absolute bottom-4 right-8 w-6 h-6 border border-white/30 rounded-full animate-pulse delay-300"></div>
                        <div className="absolute top-1/2 right-4 w-4 h-4 bg-white/20 rounded animate-pulse delay-700"></div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">Công nghệ</span>
                        <span className="text-gray-400 text-sm ml-auto">5 phút đọc</span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-blue-600 transition-colors">
                        AI không chỉ là công cụ - mà là đồng đội học tập của bạn
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        Tìm hiểu cách AI có thể trở thành người bạn đồng hành trong quá trình học tập, không chỉ hỗ trợ mà còn tạo động lực và cá nhân hóa trải nghiệm học tập.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                          <span>Đọc thêm</span>
                          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        <div className="flex items-center text-gray-400 text-xs">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          1.2k
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Article Card 2 - Group Learning */}
                  <div className="group bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                    <div className="relative h-52 overflow-hidden">
                      <img 
                        src="/newsImage.png" 
                        alt="Group Learning" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.style.background = 'linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #a855f7 100%)';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                          Phổ biến
                        </span>
                      </div>
                      {/* Connection pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-6 left-6 w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        <div className="absolute top-8 left-12 w-2 h-2 bg-white rounded-full animate-pulse delay-300"></div>
                        <div className="absolute bottom-8 right-8 w-3 h-3 bg-white rounded-full animate-pulse delay-700"></div>
                        <div className="absolute bottom-6 right-14 w-2 h-2 bg-white rounded-full animate-pulse delay-1000"></div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <span className="bg-pink-100 text-pink-800 text-xs font-medium px-3 py-1 rounded-full">Học nhóm</span>
                        <span className="text-gray-400 text-sm ml-auto">8 phút đọc</span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-pink-600 transition-colors">
                        5 cách tận dụng học nhóm online hiệu quả nhất
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        Học nhóm online không chỉ là họp video đơn thuần. Khám phá những phương pháp và công cụ hiệu quả để tối ưu hóa việc học nhóm từ xa.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-pink-600 font-medium text-sm group-hover:text-pink-700 transition-colors">
                          <span>Xem chi tiết</span>
                          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        <div className="flex items-center text-gray-400 text-xs">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          856
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Article Card 3 - Smart Learning */}
                  <div className="group bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
                    <div className="relative h-52 overflow-hidden">
                      <img 
                        src="/newsImage.png" 
                        alt="Smart Learning" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.style.background = 'linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #3b82f6 100%)';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <span className="bg-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                          Xu hướng
                        </span>
                      </div>
                      {/* Digital pattern */}
                      <div className="absolute inset-0 opacity-15">
                        <div className="absolute top-4 left-4 text-white text-xs animate-pulse">{'{ }'}</div>
                        <div className="absolute bottom-4 right-4 text-white text-xs animate-pulse delay-500">{'< />'}</div>
                        <div className="absolute top-1/2 left-8 text-white text-xs animate-pulse delay-1000">{'#'}</div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">Xu hướng</span>
                        <span className="text-gray-400 text-sm ml-auto">6 phút đọc</span>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-3 text-lg group-hover:text-cyan-600 transition-colors">
                        Làm sao để công nghệ số trở thành công cụ học tập thông minh?
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        Tìm hiểu cách sử dụng công nghệ số một cách thông minh và hiệu quả để nâng cao chất lượng học tập và phát triển kỹ năng tư duy.
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-cyan-600 font-medium text-sm group-hover:text-cyan-700 transition-colors">
                          <span>Tìm hiểu</span>
                          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        <div className="flex items-center text-gray-400 text-xs">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          942
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Navigation Arrows */}
                <button className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-4 text-white transition-all duration-300 hover:scale-110 shadow-lg border border-white/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-4 text-white transition-all duration-300 hover:scale-110 shadow-lg border border-white/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Về chúng tôi Section */}
          <div className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center text-white mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  VỀ CHÚNG TÔI
                </h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left side - Story blocks */}
                <div className="space-y-6">
                  {/* Story 1 */}
                  <div className="bg-white rounded-xl p-6 relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-pink-200 rounded-full"></div>
                    <h3 className="font-semibold text-gray-900 mb-3">Lấy nghiệp học làm trong lòng</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Chúng tôi hiểu rằng học tập là một quá trình quan trọng và cần được hỗ trợ tốt nhất. 
                      StudySync được ra đời với sứ mệnh mang đến cho học sinh, sinh viên một môi trường học tập hiện đại, 
                      thông minh và hiệu quả nhất.
                    </p>
                  </div>

                  {/* Story 2 */}
                  <div className="bg-white rounded-xl p-6 relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-200 rounded-full"></div>
                    <h3 className="font-semibold text-gray-900 mb-3">Đội ngũ với cam kết hàng đầu</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Với đội ngũ chuyên gia giàu kinh nghiệm trong lĩnh vực giáo dục và công nghệ, 
                      chúng tôi cam kết mang đến những giải pháp học tập tốt nhất, 
                      giúp người học đạt được mục tiêu của mình một cách hiệu quả.
                    </p>
                  </div>

                  {/* Story 3 */}
                  <div className="bg-white rounded-xl p-6 relative">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-200 rounded-full"></div>
                    <h3 className="font-semibold text-gray-900 mb-3">Kết hợp đổi chính thống</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      StudySync kết hợp phương pháp học tập truyền thống với công nghệ AI tiên tiến, 
                      tạo ra một nền tảng học tập toàn diện, phù hợp với mọi đối tượng người học.
                    </p>
                  </div>
                </div>

                {/* Right side - About content */}
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-6">GIỚI THIỆU</h3>
                  <div className="space-y-4 text-sm leading-relaxed">
                    <p>
                      StudySync được phát triển bởi một nhóm sinh viên đam mê công nghệ và giáo dục. 
                      Chúng tôi nhận thấy rằng việc học nhóm và chia sẻ kiến thức là yếu tố quan trọng 
                      trong quá trình học tập hiện đại.
                    </p>
                    <p>
                      Với sự kết hợp giữa trí tuệ nhân tạo và phương pháp học tập truyền thống, 
                      StudySync mang đến một trải nghiệm học tập hoàn toàn mới, 
                      giúp người học tối ưu hóa thời gian và nâng cao hiệu quả học tập.
                    </p>
                    <p>
                      Chúng tôi tin rằng học tập không chỉ là việc tiếp thu kiến thức mà còn là 
                      quá trình phát triển tư duy, kỹ năng và tạo dựng mối quan hệ. 
                      StudySync được thiết kế để hỗ trợ tất cả những khía cạnh này.
                    </p>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-xl font-semibold mb-4">TRANG WEB CỦA TÔI</h4>
                    <p className="text-sm leading-relaxed">
                      Nền tảng của chúng tôi được xây dựng với công nghệ hiện đại nhất, 
                      đảm bảo tính bảo mật và hiệu suất cao. StudySync cung cấp giao diện thân thiện, 
                      dễ sử dụng và tích hợp nhiều tính năng hỗ trợ học tập đa dạng.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vấn đề - Giải quyết Section */}
          <div className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left side - Problems */}
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                    VẤN ĐỀ
                  </h2>
                  <div className="space-y-4">
                    {[
                      "Thiếu tổ chức trong nhóm học",
                      "Khó kiểm soát thời gian học chung",
                      "Thiếu tài liệu trong quá trình học",
                      "Thiếu kết nối khi học online",
                      "Phải đóng phiếu số rõ ràng"
                    ].map((problem, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 flex items-center justify-between">
                        <span className="text-gray-800 font-medium">{problem}</span>
                        <div className="flex space-x-1">
                          <div className="w-0 h-0 border-l-4 border-l-purple-600 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                          <div className="w-0 h-0 border-l-4 border-l-purple-600 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                          <div className="w-0 h-0 border-l-4 border-l-purple-600 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side - Solutions */}
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                    GIẢI QUYẾT CỦA STUDYSYNC
                  </h2>
                  <div className="space-y-4">
                    {[
                      "AI chia nhỏ đề cương, phân công nhiệm vụ từ đề cương",
                      "AI gợi ý thang góc học phù hợp với lịch của thành viên",
                      "AI hỗ trợ giải bài, tạo câu hỏi, gợi ý kiến thức cần",
                      "Lớp học sác & AI trưỡng nhỡ, nhắc nhở, gợi ý kết",
                      "Tạo cá nhóm một ứng dụng học nhóm, tập trung tất cả nhu cầu học tập"
                    ].map((solution, index) => (
                      <div key={index} className="bg-white rounded-lg p-4">
                        <span className="text-gray-800 font-medium">{solution}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dữ liệu trong tháng 6 Section */}
          <div className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center text-white mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  DỮ LIỆU TRONG THÁNG 6
                </h2>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                <div className="text-center text-white">
                  <div className="text-4xl md:text-5xl font-bold mb-2">105</div>
                  <div className="text-sm opacity-90">Người dùng</div>
                </div>
                <div className="text-center text-white">
                  <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
                  <div className="text-sm opacity-90">Nhóm thành lập</div>
                </div>
                <div className="text-center text-white">
                  <div className="text-4xl md:text-5xl font-bold mb-2">+1</div>
                  <div className="text-sm opacity-90">Đối tác</div>
                </div>
                <div className="text-center text-white">
                  <div className="text-4xl md:text-5xl font-bold mb-2">85</div>
                  <div className="text-sm opacity-90">Người học trong tuần qua</div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-white text-lg md:text-xl font-semibold">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Bắt đầu học nhóm thông minh cùng StudySync ngay hôm nay!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
