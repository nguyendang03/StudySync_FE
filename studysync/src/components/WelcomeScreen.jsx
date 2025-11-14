import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, Brain, Sparkles, ArrowRight } from 'lucide-react';

const WelcomeScreen = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    // Stage 0: Logo animation (0-2s)
    const timer1 = setTimeout(() => setStage(1), 2000);
    
    // Stage 1: Features animation (2-4s)
    const timer2 = setTimeout(() => setStage(2), 4000);
    
    // Stage 2: Start fade out (4-4.5s)
    const timer3 = setTimeout(() => setShowContent(false), 4500);
    
    // Stage 3: Complete transition (4.5-5s)
    const timer4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  const features = [
    { icon: BookOpen, text: 'Học tập thông minh', color: 'from-blue-500 to-cyan-500' },
    { icon: Users, text: 'Nhóm học hiệu quả', color: 'from-purple-500 to-pink-500' },
    { icon: Brain, text: 'Trợ lý AI', color: 'from-orange-500 to-red-500' },
  ];

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 overflow-hidden"
        >
          {/* Animated Background Particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center px-4">
            {/* Logo and Title Animation */}
            <AnimatePresence mode="wait">
              {stage >= 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 200, 
                    damping: 20,
                    duration: 0.8 
                  }}
                  className="mb-8"
                >
                  <div className="flex items-center justify-center mb-6">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                      }}
                      className="w-32 h-32 bg-white/10 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl p-4"
                    >
                      <img 
                        src="/authLogo.png" 
                        alt="StudySync Logo" 
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                  </div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl md:text-7xl font-bold text-white mb-4"
                  >
                    StudySync
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl md:text-2xl text-white/90 font-medium"
                  >
                    Nền tảng học nhóm thông minh
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Features Animation */}
            {stage >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-wrap justify-center gap-4 mb-8"
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0, x: -50 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ 
                      delay: index * 0.2,
                      type: 'spring',
                      stiffness: 200,
                      damping: 15
                    }}
                    className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-3 flex items-center gap-3 shadow-xl border border-white/30"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-semibold text-lg">
                      {feature.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Loading Bar */}
            {stage >= 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="max-w-md mx-auto"
              >
                <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.5, ease: 'easeInOut' }}
                    className="h-full bg-gradient-to-r from-white via-blue-200 to-white rounded-full"
                  />
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-white/80 text-sm mt-3 font-medium"
                >
                  Đang khởi tạo trải nghiệm học tập...
                </motion.p>
              </motion.div>
            )}

            {/* Entering Arrow */}
            {stage >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  y: [20, 0, -20],
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 0.5
                }}
                className="mt-8 flex justify-center"
              >
                <ArrowRight className="w-8 h-8 text-white" />
              </motion.div>
            )}
          </div>

          {/* Corner Decorations */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
              scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            }}
            className="absolute top-10 right-10 w-32 h-32 border-4 border-white/20 rounded-full"
          />
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1, 1.3, 1]
            }}
            transition={{ 
              rotate: { duration: 15, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
            }}
            className="absolute bottom-10 left-10 w-24 h-24 border-4 border-white/20 rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;
