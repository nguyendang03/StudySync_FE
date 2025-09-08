import React from 'react';

export default function AuthHeader() {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center mb-6">
        <img 
          src="/authLogo.png" 
          alt="StudySync Logo" 
          className="h-12 w-12 mr-3"
          onError={(e) => {
            console.log('Logo failed to load:', e.target.src);
            e.target.style.display = 'none';
          }}
        />
        <h1 className="text-4xl font-bold text-white">StudySync</h1>
      </div>
    </div>
  );
}
