import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/profile/Sidebar';
import ProfilePictureUpload from '../../components/profile/ProfilePictureUpload';
import ProfileInfoForm from '../../components/profile/ProfileInfoForm';
import ChangePassword from '../../components/profile/ChangePassword';
import GroupList from '../../components/profile/GroupList';
import InvitationList from '../../components/profile/InvitationList';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function Profile() {
  const [activeView, setActiveView] = useState('profile');
  const [isLoaded, setIsLoaded] = useState(false);
  const [contentKey, setContentKey] = useState(0);

  const handleSidebarItemClick = (itemId) => {
    setActiveView(itemId);
    setContentKey(prev => prev + 1); // Force re-animation
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const renderMainContent = () => {
    const contentClass = `transition-all duration-500 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`;
    
    switch (activeView) {
      case 'profile':
        return (
          <div key={contentKey} className={`grid grid-cols-1 lg:grid-cols-3 gap-8 h-full ${contentClass}`}>
            {/* Profile Picture Section */}
            <div className="lg:col-span-1 flex flex-col justify-center transition-all duration-700 delay-200">
              <ProfilePictureUpload />
            </div>
            
            {/* Profile Information Form */}
            <div className="lg:col-span-2 transition-all duration-700 delay-400">
              <ProfileInfoForm />
            </div>
          </div>
        );
      
      case 'change-password':
        return (
          <div key={contentKey} className={`flex justify-center items-start w-full h-full pt-8 ${contentClass}`}>
            <div className="transition-all duration-700 delay-200 hover:scale-105 transform">
              <ChangePassword />
            </div>
          </div>
        );
      
      case 'groups':
        return (
          <div key={contentKey} className={`w-full ${contentClass}`}>
            <div className="transition-all duration-700 delay-200">
              <GroupList />
            </div>
          </div>
        );
      
      case 'invitations':
        return (
          <div key={contentKey} className={`w-full ${contentClass}`}>
            <div className="transition-all duration-700 delay-200">
              <InvitationList />
            </div>
          </div>
        );
      
      case 'friends':
        return (
          <div key={contentKey} className={`text-center py-16 ${contentClass}`}>
            <div className="transition-all duration-700 delay-200 hover:scale-105 transform">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Bạn bè</h2>
              <p className="text-gray-600">Tính năng này đang được phát triển...</p>
            </div>
          </div>
        );
      
      case 'messages':
        return (
          <div key={contentKey} className={`text-center py-16 ${contentClass}`}>
            <div className="transition-all duration-700 delay-200 hover:scale-105 transform">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tin nhắn</h2>
              <p className="text-gray-600">Tính năng này đang được phát triển...</p>
            </div>
          </div>
        );
      
      default:
        return (
          <div key={contentKey} className={`grid grid-cols-1 lg:grid-cols-3 gap-8 h-full ${contentClass}`}>
            <div className="lg:col-span-1 flex flex-col justify-center transition-all duration-700 delay-200">
              <ProfilePictureUpload />
            </div>
            <div className="lg:col-span-2 transition-all duration-700 delay-400">
              <ProfileInfoForm />
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Header/>
      <div className={`min-h-screen p-8 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ background: 'linear-gradient(135deg, #A640A0, #6D17AE)' }}>
        <div className="max-w-7xl mx-auto">
          <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
            <div className="flex min-h-[600px]">
              {/* Sidebar */}
              <div className={`w-20 bg-purple-100/50 flex flex-col items-center py-8 space-y-6 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                <Sidebar 
                  activeItem={activeView} 
                  onItemClick={handleSidebarItemClick}
                />
              </div>
              
              {/* Main Content */}
              <div className={`flex-1 p-8 transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {renderMainContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}