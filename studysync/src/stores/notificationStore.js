import { create } from 'zustand';
import notificationService from '../services/notificationService';
import io from 'socket.io-client';
import API_BASE_URL from '../config/api';
import authService from '../services/authService';

const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  loading: false,
  socket: null,
  isConnected: false,

  // Actions
  fetchNotifications: async (params = {}) => {
    set({ loading: true });
    try {
      const response = await notificationService.getNotifications(params);
      set({ 
        notifications: response.data?.notifications || [],
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationService.getUnreadCount();
      set({ unreadCount: response.data?.count || 0 });
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  },

  markAsRead: async (notificationIds) => {
    try {
      await notificationService.markAsRead(notificationIds);
      set((state) => ({
        notifications: state.notifications.map(n =>
          notificationIds.includes(n.id) ? { ...n, isRead: true } : n
        ),
      }));
      get().fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== notificationId),
      }));
      get().fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  // WebSocket connection
  connectSocket: () => {
    const token = authService.getAccessToken();
    if (!token) return;

    const socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Notification socket connected');
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      console.log('Notification socket disconnected');
      set({ isConnected: false });
    });

    socket.on('notification', (notification) => {
      console.log('New notification received:', notification);
      get().addNotification(notification);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.content,
          icon: '/authLogo.png',
        });
      }
    });

    socket.on('error', (error) => {
      console.error('Notification socket error:', error);
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  // Request browser notification permission
  requestNotificationPermission: async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  },

  // Initialize store (call this when user logs in)
  initialize: () => {
    get().fetchUnreadCount();
    get().connectSocket();
    get().requestNotificationPermission();
  },

  // Cleanup (call this when user logs out)
  cleanup: () => {
    get().disconnectSocket();
    set({
      notifications: [],
      unreadCount: 0,
      loading: false,
    });
  },
}));

export default useNotificationStore;


