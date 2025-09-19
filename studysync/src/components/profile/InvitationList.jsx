import React, { useState } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

export default function InvitationList() {
  const [invitations, setInvitations] = useState([]);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Danh sách lời mời</h2>
      
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-4 gap-4 font-semibold text-gray-700">
            <div>Tên nhóm</div>
            <div>Người mời</div>
            <div>Email</div>
            <div>Hành động</div>
          </div>
        </div>
        
        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {/* Empty State */}
          {invitations.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không có lời mời nào</h3>
              <p className="text-gray-500">Bạn chưa nhận được lời mời tham gia nhóm nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}