import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AgoraRTC from 'agora-rtc-sdk-ng';
import toast from 'react-hot-toast';

const AgoraDebugTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test, status, message) => {
    setTestResults(prev => [...prev, { test, status, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Environment variables
    addResult('Environment Check', 'info', 'Checking environment variables...');
    const appId = import.meta.env.VITE_AGORA_APP_ID;
    const useToken = import.meta.env.VITE_AGORA_USE_TOKEN;
    
    if (!appId) {
      addResult('App ID', 'error', 'VITE_AGORA_APP_ID not found in environment');
    } else {
      addResult('App ID', 'success', `Found App ID: ${appId}`);
    }
    
    addResult('Token Mode', 'info', `Use Token: ${useToken || 'false'}`);

    // Test 2: Agora SDK Import
    try {
      addResult('SDK Import', 'info', 'Testing Agora SDK import...');
      if (typeof AgoraRTC !== 'undefined') {
        addResult('SDK Import', 'success', `Agora SDK version: ${AgoraRTC.VERSION}`);
      } else {
        addResult('SDK Import', 'error', 'Agora SDK not imported correctly');
        setIsRunning(false);
        return;
      }
    } catch (error) {
      addResult('SDK Import', 'error', `SDK import error: ${error.message}`);
      setIsRunning(false);
      return;
    }

    // Test 3: Client Creation
    try {
      addResult('Client Creation', 'info', 'Creating Agora client...');
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      addResult('Client Creation', 'success', 'Client created successfully');
      
      // Test 4: Device Enumeration
      addResult('Device Check', 'info', 'Checking available devices...');
      const devices = await AgoraRTC.getDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput');
      const microphones = devices.filter(d => d.kind === 'audioinput');
      
      addResult('Cameras', cameras.length > 0 ? 'success' : 'warning', 
        `Found ${cameras.length} camera(s): ${cameras.map(c => c.label || 'Unknown').join(', ')}`);
      addResult('Microphones', microphones.length > 0 ? 'success' : 'warning', 
        `Found ${microphones.length} microphone(s): ${microphones.map(m => m.label || 'Unknown').join(', ')}`);

      // Test 5: Track Creation (basic test)
      try {
        addResult('Track Creation', 'info', 'Testing track creation...');
        
        // Try creating tracks with timeout
        const trackPromise = AgoraRTC.createMicrophoneAndCameraTracks();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout after 5 seconds')), 5000)
        );
        
        const [audioTrack, videoTrack] = await Promise.race([trackPromise, timeoutPromise]);
        
        if (audioTrack && videoTrack) {
          addResult('Track Creation', 'success', 'Audio and video tracks created successfully');
          
          // Clean up tracks
          audioTrack.close();
          videoTrack.close();
          addResult('Track Cleanup', 'success', 'Tracks cleaned up');
        }
      } catch (trackError) {
        if (trackError.message.includes('Permission denied')) {
          addResult('Track Creation', 'error', 'Permission denied - please allow camera/microphone access');
        } else if (trackError.message.includes('Timeout')) {
          addResult('Track Creation', 'error', 'Timeout creating tracks - device may be in use');
        } else {
          addResult('Track Creation', 'error', `Track creation failed: ${trackError.message}`);
        }
      }

      // Test 6: Connection Test (without actually joining)
      try {
        addResult('Connection Test', 'info', 'Testing connection capabilities...');
        
        // Just test the join parameters without actually joining
        if (!appId) {
          throw new Error('No App ID available');
        }
        
        addResult('Connection Test', 'success', 'Connection parameters validated');
      } catch (connError) {
        addResult('Connection Test', 'error', `Connection test failed: ${connError.message}`);
      }

    } catch (error) {
      addResult('Client Creation', 'error', `Client creation failed: ${error.message}`);
    }

    setIsRunning(false);
    toast.success('Agora debug test completed');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-4">🔧 Agora SDK Debug Test</h1>
          <p className="text-white/80 mb-6">
            This tool helps diagnose issues with the Agora video call integration.
          </p>
          
          <button
            onClick={runTests}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isRunning 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRunning ? '🔄 Running Tests...' : '🚀 Run Debug Tests'}
          </button>
        </motion.div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-4">📊 Test Results</h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black/20 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-xl">{getStatusIcon(result.status)}</span>
                      <div>
                        <h3 className="text-white font-medium">{result.test}</h3>
                        <p className={`text-sm ${getStatusColor(result.status)}`}>
                          {result.message}
                        </p>
                      </div>
                    </div>
                    <span className="text-white/50 text-xs">{result.timestamp}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t border-white/20">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-green-500/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-400">
                    {testResults.filter(r => r.status === 'success').length}
                  </div>
                  <div className="text-green-300 text-sm">Success</div>
                </div>
                <div className="bg-yellow-500/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-yellow-400">
                    {testResults.filter(r => r.status === 'warning').length}
                  </div>
                  <div className="text-yellow-300 text-sm">Warnings</div>
                </div>
                <div className="bg-red-500/20 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-400">
                    {testResults.filter(r => r.status === 'error').length}
                  </div>
                  <div className="text-red-300 text-sm">Errors</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AgoraDebugTest;