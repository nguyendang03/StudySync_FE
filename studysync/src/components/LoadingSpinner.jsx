import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'default', 
  fullScreen = false, 
  message = 'Đang tải...',
  showMessage = true 
}) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        {/* Animated Spinner */}
        <motion.div 
          className={`${sizeClasses[size]} relative`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Outer ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          />
          
          {/* Spinning gradient ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, transparent, transparent, #8b5cf6, #3b82f6)',
              mask: 'radial-gradient(circle at center, transparent 40%, black 41%)',
              WebkitMask: 'radial-gradient(circle at center, transparent 40%, black 41%)'
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </div>
        </motion.div>

        {/* Loading Message */}
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-center"
          >
            <p className="text-gray-600 font-medium">{message}</p>
            <div className="flex items-center justify-center mt-2 space-x-1">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  animate={{
                    scale: [0.5, 1, 0.5],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Route Loading Component
export const RouteLoader = ({ message = 'Đang tải trang...' }) => (
  <LoadingSpinner 
    size="large" 
    fullScreen={true} 
    message={message}
    showMessage={true}
  />
);

// Component Loading Wrapper
export const ComponentLoader = ({ message = 'Đang tải...', size = 'default' }) => (
  <LoadingSpinner 
    size={size} 
    message={message}
    showMessage={true}
    fullScreen={false}
  />
);

// Minimal Loading for small components
export const MinimalLoader = ({ size = 'small' }) => (
  <LoadingSpinner 
    size={size} 
    showMessage={false}
    fullScreen={false}
  />
);

export default LoadingSpinner;