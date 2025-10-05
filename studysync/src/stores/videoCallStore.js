import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useVideoCallStore = create(
  devtools(
    (set, get) => ({
      // State
      activeCall: null,
      isInCall: false,
      callHistory: [],
      callSettings: {
        videoEnabled: true,
        audioEnabled: true,
        screenShareEnabled: false,
        videoQuality: '720p',
      },

      // Actions
      startCall: (callData) => {
        set({
          activeCall: {
            id: callData.channelName,
            channelName: callData.channelName,
            groupId: callData.groupId,
            groupName: callData.groupName,
            participants: callData.participants || [],
            startTime: Date.now(),
            isHost: callData.isHost || false,
          },
          isInCall: true,
        });
      },

      endCall: () => {
        const { activeCall } = get();
        if (activeCall) {
          // Add to call history
          const callRecord = {
            ...activeCall,
            endTime: Date.now(),
            duration: Date.now() - activeCall.startTime,
          };
          
          set((state) => ({
            activeCall: null,
            isInCall: false,
            callHistory: [callRecord, ...state.callHistory.slice(0, 49)], // Keep last 50 calls
          }));
        }
      },

      updateCallSettings: (settings) => {
        set((state) => ({
          callSettings: { ...state.callSettings, ...settings },
        }));
      },

      addParticipant: (participant) => {
        set((state) => ({
          activeCall: state.activeCall
            ? {
                ...state.activeCall,
                participants: [...state.activeCall.participants, participant],
              }
            : null,
        }));
      },

      removeParticipant: (participantId) => {
        set((state) => ({
          activeCall: state.activeCall
            ? {
                ...state.activeCall,
                participants: state.activeCall.participants.filter(
                  (p) => p.id !== participantId
                ),
              }
            : null,
        }));
      },

      clearCallHistory: () => {
        set({ callHistory: [] });
      },

      // Getters
      getActiveCall: () => get().activeCall,
      getCallHistory: () => get().callHistory,
      getCallSettings: () => get().callSettings,
    }),
    {
      name: 'video-call-store',
    }
  )
);

export default useVideoCallStore;