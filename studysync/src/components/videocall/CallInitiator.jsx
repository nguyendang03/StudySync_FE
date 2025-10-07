import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, Users, Settings, Clock, Mic, MicOff, 
  VideoOff, Monitor, X, Play, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

const CallInitiator = ({ 
  groupId, 
  groupName, 
  members = [], 
  onStartCall, 
  onCancel 
}) => {
  const [callSettings, setCallSettings] = useState({
    videoEnabled: true,
    audioEnabled: true,
    screenShareEnabled: false,
    videoQuality: '720p',
    recordCall: false,
    scheduleCall: false,
    scheduledTime: ''
  });
  
  const [isStarting, setIsStarting] = useState(false);

  const handleSettingChange = (key, value) => {
    setCallSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStartCall = async () => {
    setIsStarting(true);
    
    try {
      // Validate settings
      if (callSettings.scheduleCall && !callSettings.scheduledTime) {
        toast.error('Vui lòng chọn thời gian lên lịch cuộc gọi');
        setIsStarting(false);
        return;
      }
      
      // Prepare call data
      const callData = {
        groupId,
        groupName,
        members,
        settings: callSettings,
        channelName: `group_${groupId}_${Date.now()}`,
        isHost: true
      };
      
      // Simulate call preparation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (callSettings.scheduleCall) {
        toast.success(`Cuộc gọi đã được lên lịch lúc ${new Date(callSettings.scheduledTime).toLocaleString('vi-VN')}`);
        onCancel();
      } else {
        onStartCall(callData);
      }
    } catch (error) {
      console.error('Failed to start call:', error);
      toast.error('Không thể khởi tạo cuộc gọi');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Khởi tạo cuộc gọi video</h2>
          <p className="text-sm text-gray-600">Cấu hình và bắt đầu cuộc gọi cho nhóm "{groupName}"</p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Group Info */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{groupName}</h3>
              <p className="text-sm text-gray-600">{members.length} thành viên sẽ được mời</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Bạn sẽ là host</p>
            <p className="text-xs text-blue-600 font-medium">Quyền quản lý cuộc gọi</p>
          </div>
        </div>
      </div>

      {/* Call Settings */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Cài đặt cuộc gọi
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Audio Settings */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Âm thanh</h4>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Mic className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">Bật microphone</span>
                </div>
                <input
                  type="checkbox"
                  checked={callSettings.audioEnabled}
                  onChange={(e) => handleSettingChange('audioEnabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
            </div>

            {/* Video Settings */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Video</h4>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center space-x-3">
                  <Video className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">Bật camera</span>
                </div>
                <input
                  type="checkbox"
                  checked={callSettings.videoEnabled}
                  onChange={(e) => handleSettingChange('videoEnabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block text-sm text-gray-700 mb-2">Chất lượng video</label>
                <select
                  value={callSettings.videoQuality}
                  onChange={(e) => handleSettingChange('videoQuality', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="360p">360p (Tiết kiệm băng thông)</option>
                  <option value="480p">480p (Cân bằng)</option>
                  <option value="720p">720p (Chất lượng cao)</option>
                  <option value="1080p">1080p (Chất lượng tốt nhất)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Tùy chọn nâng cao</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="text-sm text-gray-700 block">Chia sẻ màn hình</span>
                  <span className="text-xs text-gray-500">Cho phép chia sẻ màn hình ngay khi bắt đầu</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={callSettings.screenShareEnabled}
                onChange={(e) => handleSettingChange('screenShareEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center space-x-3">
                <Video className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="text-sm text-gray-700 block">Ghi lại cuộc gọi</span>
                  <span className="text-xs text-gray-500">Tự động ghi lại để xem lại sau</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={callSettings.recordCall}
                onChange={(e) => handleSettingChange('recordCall', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="text-sm text-gray-700 block">Lên lịch cuộc gọi</span>
                  <span className="text-xs text-gray-500">Đặt thời gian cho cuộc gọi</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={callSettings.scheduleCall}
                onChange={(e) => handleSettingChange('scheduleCall', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            {callSettings.scheduleCall && (
              <div className="p-3 bg-white border border-gray-200 rounded-lg ml-8">
                <label className="block text-sm text-gray-700 mb-2">Thời gian cuộc gọi</label>
                <input
                  type="datetime-local"
                  value={callSettings.scheduledTime}
                  onChange={(e) => handleSettingChange('scheduledTime', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-2">Xem trước cài đặt</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              {callSettings.audioEnabled ? (
                <Mic className="w-4 h-4 text-green-600" />
              ) : (
                <MicOff className="w-4 h-4 text-red-500" />
              )}
              <span className={callSettings.audioEnabled ? 'text-green-700' : 'text-red-600'}>
                {callSettings.audioEnabled ? 'Âm thanh bật' : 'Âm thanh tắt'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {callSettings.videoEnabled ? (
                <Video className="w-4 h-4 text-green-600" />
              ) : (
                <VideoOff className="w-4 h-4 text-red-500" />
              )}
              <span className={callSettings.videoEnabled ? 'text-green-700' : 'text-red-600'}>
                {callSettings.videoEnabled ? `Video ${callSettings.videoQuality}` : 'Video tắt'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Monitor className={`w-4 h-4 ${callSettings.screenShareEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className={callSettings.screenShareEnabled ? 'text-blue-700' : 'text-gray-500'}>
                {callSettings.screenShareEnabled ? 'Chia sẻ sẵn sàng' : 'Không chia sẻ'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className={`w-4 h-4 ${callSettings.scheduleCall ? 'text-orange-600' : 'text-green-600'}`} />
              <span className={callSettings.scheduleCall ? 'text-orange-700' : 'text-green-700'}>
                {callSettings.scheduleCall ? 'Đã lên lịch' : 'Ngay lập tức'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg font-medium transition-colors"
        >
          Hủy
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartCall}
          disabled={isStarting}
          className={`
            px-8 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
            ${isStarting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
            }
          `}
        >
          {isStarting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Đang khởi tạo...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>{callSettings.scheduleCall ? 'Lên lịch' : 'Bắt đầu'} cuộc gọi</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default CallInitiator;