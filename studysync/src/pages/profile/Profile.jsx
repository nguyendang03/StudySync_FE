import React from 'react';
import Sidebar from '../../components/profile/Sidebar';
import ProfilePictureUpload from '../../components/profile/ProfilePictureUpload';
import ProfileInfoForm from '../../components/profile/ProfileInfoForm';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function Profile() {
  return (
    <>
    <Header/>
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex min-h-[600px]">
            {/* Sidebar */}
            <div className="w-20 bg-purple-100/50 flex flex-col items-center py-8 space-y-6">
              <Sidebar activeItem="profile" />
            </div>
            
            {/* Main Content */}
            <div className="flex-1 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                {/* Profile Picture Section */}
                <div className="lg:col-span-1 flex flex-col justify-center">
                  <ProfilePictureUpload />
                </div>
                
                {/* Profile Information Form */}
                <div className="lg:col-span-2">
                  <ProfileInfoForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
}