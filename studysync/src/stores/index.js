// Export all Zustand stores
export { default as useAuthStore } from './authStore';
export { default as useGroupsStore } from './groupsStore';
export { default as useNotificationStore } from './notificationStore';
export { default as useUiStore } from './uiStore';
export { default as useVideoCallStore } from './videoCallStore';

// Re-export for convenience
import useAuthStore from './authStore';
import useGroupsStore from './groupsStore';
import useNotificationStore from './notificationStore';
import useUiStore from './uiStore';
import useVideoCallStore from './videoCallStore';

export const stores = {
  auth: useAuthStore,
  groups: useGroupsStore,
  notification: useNotificationStore,
  ui: useUiStore,
  videoCall: useVideoCallStore,
};

export default stores;