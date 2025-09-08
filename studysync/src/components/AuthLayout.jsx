import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth Image */}
      <div className="flex lg:w-1/2 relative">
        <img 
          src="/authImage.png" 
          alt="StudySync Authentication" 
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log('Image failed to load:', e.target.src);
            // Fallback to a gradient background if image fails
            e.target.style.display = 'none';
            e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          }}
          onLoad={() => console.log('Image loaded successfully')}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent h-1/2 flex items-end">
          <div className="text-white p-12">
            <h2 className="text-4xl font-bold mb-4">ỨNG DỤNG CÔNG NGHỆ AI</h2>
            <p className="text-xl opacity-90">Mang lại hiệu quả học tập tốt hơn!</p>
          </div>
        </div>
      </div>

      {/* Right side - Form Area */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800 p-8">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
