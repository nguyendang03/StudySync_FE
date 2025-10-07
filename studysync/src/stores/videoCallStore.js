import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useVideoCallStore = create(
  devtools(
    (set, get) => ({
      // State
      activeCall: null,
      isInCall: false,
      callHistory: [],
      pendingInvitations: [],
      sentInvitations: [],
      callSettings: {
        videoEnabled: true,
        audioEnabled: true,
        screenShareEnabled: false,
        videoQuality: '720p',
        recordCall: false,
        scheduleCall: false
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

      // Invitation Management
      addPendingInvitation: (invitation) => {
        set((state) => ({
          pendingInvitations: [...state.pendingInvitations, invitation],
        }));
      },

      removePendingInvitation: (invitationId) => {
        set((state) => ({
          pendingInvitations: state.pendingInvitations.filter(
            (inv) => inv.id !== invitationId
          ),
        }));
      },

      addSentInvitation: (invitation) => {
        set((state) => ({
          sentInvitations: [...state.sentInvitations, invitation],
        }));
      },

      clearInvitations: () => {
        set({ pendingInvitations: [], sentInvitations: [] });
      },

      // Call Link Generation
      generateCallLink: (channelName, groupName) => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/join-call/${channelName}?group=${encodeURIComponent(groupName)}`;
      },

      // Send Invitation
      sendInvitation: async (invitationData) => {
        const { method, users, groupId, groupName, message, channelName } = invitationData;
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const invitations = users.map(user => ({
            id: `inv_${Date.now()}_${user.id}`,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            groupId,
            groupName,
            channelName,
            message,
            method,
            sentAt: new Date().toISOString(),
            status: 'sent'
          }));
          
          // Add to sent invitations
          set((state) => ({
            sentInvitations: [...state.sentInvitations, ...invitations],
          }));
          
          return invitations;
        } catch (error) {
          console.error('Failed to send invitations:', error);
          throw error;
        }
      },

      // Schedule Call
      scheduleCall: (callData) => {
        const scheduledCall = {
          ...callData,
          id: `scheduled_${Date.now()}`,
          status: 'scheduled',
          createdAt: Date.now()
        };
        
        set((state) => ({
          callHistory: [scheduledCall, ...state.callHistory],
        }));
        
        return scheduledCall;
      },

      // Getters
      getActiveCall: () => get().activeCall,
      getCallHistory: () => get().callHistory,
      getCallSettings: () => get().callSettings,
      getPendingInvitations: () => get().pendingInvitations,
      getSentInvitations: () => get().sentInvitations,
    }),
    {
      name: 'video-call-store',
    }
  )
);

export default useVideoCallStore;