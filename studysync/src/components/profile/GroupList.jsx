import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';

export default function GroupList() {
  const [groups, setGroups] = useState([
    {
      id: 1,
      name: 'Tung Tung Tung Sahur',
      subject: 'EXE101',
      status: 'VÀO XEM'
    }
    // You can add more groups here
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateGroup = () => {
    setShowCreateForm(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'VÀO XEM':
        return 'bg-pink-100 text-pink-600';
      case 'EXE101':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Danh sách nhóm</h2>
      
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-4 gap-4 font-semibold text-gray-700">
            <div>STT</div>
            <div>Tên nhóm</div>
            <div>Môn học</div>
            <div>Hành động</div>
          </div>
        </div>
        
        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {groups.map((group, index) => (
            <div key={group.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-4 gap-4 items-center">
                {/* STT */}
                <div className="text-gray-600 font-medium">
                  {index + 1}
                </div>
                
                {/* Group Name */}
                <div className="text-gray-900 font-medium">
                  {group.name}
                </div>
                
                {/* Subject */}
                <div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(group.subject)}`}>
                    {group.subject}
                  </span>
                </div>
                
                {/* Actions */}
                <div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(group.status)}`}>
                    {group.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Empty State */}
          {groups.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có nhóm nào</h3>
              <p className="text-gray-500 mb-6">Bạn chưa tham gia hoặc tạo nhóm học nào.</p>
            </div>
          )}
        </div>
        
        {/* Footer with Create Button */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              HIỂN THỊ THÊM...
            </div>
            <button
              onClick={handleCreateGroup}
              className="inline-flex items-center px-6 py-2 bg-purple-600 text-white rounded-full text-sm font-medium hover:bg-purple-700 transition-colors shadow-lg"
            >
              <PlusOutlined style={{ fontSize: '16px', marginRight: '8px' }} />
              Tạo nhóm
            </button>
          </div>
        </div>
      </div>

      {/* Create Group Modal/Form - Simple implementation */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Tạo nhóm mới</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên nhóm</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Nhập tên nhóm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Môn học</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Nhập mã môn học"
                />
              </div>
            </div>
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  // TODO: Add create group logic here
                  setShowCreateForm(false);
                }}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                Tạo nhóm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}