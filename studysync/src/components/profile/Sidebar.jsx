import React from 'react';
import { UserOutlined, TeamOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';

export default function Sidebar({ activeItem = 'profile' }) {
  const menuItems = [
    { 
      id: 'profile', 
      icon: UserOutlined, 
      label: 'Profile',
      active: activeItem === 'profile'
    },
    { 
      id: 'friends', 
      icon: TeamOutlined, 
      label: 'Friends',
      active: activeItem === 'friends'
    },
    { 
      id: 'messages', 
      icon: MailOutlined, 
      label: 'Messages',
      active: activeItem === 'messages'
    },
    { 
      id: 'settings', 
      icon: SettingOutlined, 
      label: 'Settings',
      active: activeItem === 'settings'
    }
  ];

  return (
    <div className="h-full flex flex-col items-center space-y-6">
      {menuItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <button
            key={item.id}
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200
              ${item.active 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-white/20 text-purple-600 hover:bg-white/30'
              }
            `}
          >
            <IconComponent style={{ fontSize: '24px' }} />
          </button>
        );
      })}
    </div>
  );
}