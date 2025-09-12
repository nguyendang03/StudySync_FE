import React from 'react';
import { UserOutlined, LockOutlined, UsergroupAddOutlined } from '@ant-design/icons';

export default function Sidebar({ activeItem = 'profile', onItemClick }) {
  const menuItems = [
    { 
      id: 'profile', 
      icon: UserOutlined, 
      label: 'Profile',
      active: activeItem === 'profile'
    },
    { 
      id: 'groups', 
      icon: UsergroupAddOutlined, 
      label: 'Groups',
      active: activeItem === 'groups'
    },
    { 
      id: 'change-password', 
      icon: LockOutlined, 
      label: 'Change Password',
      active: activeItem === 'change-password'
    },
  ];

  return (
    <div className="h-full flex flex-col items-center space-y-6">
      {menuItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onItemClick && onItemClick(item.id)}
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative
              ${item.active 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-white/20 text-purple-600 hover:bg-white/30'
              }
            `}
            title={item.label}
          >
            <IconComponent style={{ fontSize: '24px' }} />
            
            {/* Tooltip */}
            <div className="absolute left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
              {item.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}