import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    switch (activeView) {
      case 'profile':
        return (
          <motion.div 
            key={contentKey} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full"
          >
            {/* Profile Picture Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="lg:col-span-1 flex flex-col justify-center"
            >
              <ProfilePictureUpload />
            </motion.div>
            
            {/* Profile Information Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="lg:col-span-2"
            >
              <ProfileInfoForm />
            </motion.div>
          </motion.div>
        );
      
      case 'change-password':
        return (
          <motion.div 
            key={contentKey} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center items-start w-full h-full pt-8"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <ChangePassword />
            </motion.div>
          </motion.div>
        );
      
      case 'groups':
        return (
          <motion.div 
            key={contentKey} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <GroupList />
          </motion.div>
        );
      
      case 'invitations':
        return (
          <motion.div 
            key={contentKey} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <InvitationList />
          </motion.div>
        );
      
      case 'friends':
        return (
          <motion.div 
            key={contentKey} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Bạn bè</h2>
              <p className="text-gray-600">Tính năng này đang được phát triển...</p>
            </motion.div>
          </motion.div>
        );
      
      case 'messages':
        return (
          <motion.div 
            key={contentKey} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tin nhắn</h2>
              <p className="text-gray-600">Tính năng này đang được phát triển...</p>
            </motion.div>
          </motion.div>
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="min-h-screen p-8" 
        style={{ background: 'linear-gradient(135deg, #A640A0, #6D17AE)' }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex min-h-[600px]">
              {/* Sidebar */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="w-20 bg-purple-100/50 flex flex-col items-center py-8 space-y-6"
              >
                <Sidebar 
                  activeItem={activeView} 
                  onItemClick={handleSidebarItemClick}
                />
              </motion.div>
              
              {/* Main Content */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="flex-1 p-8"
              >
                <AnimatePresence mode="wait">
                  {renderMainContent()}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <Footer/>
    </>
  );
}