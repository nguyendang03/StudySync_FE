import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  // State
  theme: 'light',
  sidebarOpen: false,
  mobileMenuOpen: false,
  notifications: [],
  modals: {
    createGroup: false,
    editProfile: false,
    changePassword: false,
  },
  loading: {
    global: false,
    auth: false,
    groups: false,
    profile: false,
  },

  // Theme Actions
  setTheme: (theme) => set({ theme }),
  
  toggleTheme: () => {
    const currentTheme = get().theme;
    set({ theme: currentTheme === 'light' ? 'dark' : 'light' });
  },

  // Sidebar Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Mobile Menu Actions
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

  // Modal Actions
  openModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: true }
  })),
  
  closeModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: false }
  })),
  
  closeAllModals: () => set((state) => ({
    modals: Object.keys(state.modals).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {})
  })),

  // Loading Actions
  setLoading: (key, loading) => set((state) => ({
    loading: { ...state.loading, [key]: loading }
  })),
  
  setGlobalLoading: (loading) => set((state) => ({
    loading: { ...state.loading, global: loading }
  })),

  // Notification Actions
  addNotification: (notification) => {
    const id = Date.now();
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }]
    }));
    
    // Auto remove notification after delay
    setTimeout(() => {
      get().removeNotification(id);
    }, notification.duration || 5000);
    
    return id;
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] }),

  // Utility Actions
  reset: () => set({
    sidebarOpen: false,
    mobileMenuOpen: false,
    notifications: [],
    modals: {
      createGroup: false,
      editProfile: false,
      changePassword: false,
    },
    loading: {
      global: false,
      auth: false,
      groups: false,
      profile: false,
    }
  })
}));

export default useUIStore;