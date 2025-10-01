// Export all Zustand stores
export { default as useAuthStore } from './authStore';
export { default as useGroupsStore } from './groupsStore';
export { default as useUIStore } from './uiStore';

// Re-export for convenience
import useAuthStore from './authStore';
import useGroupsStore from './groupsStore';
import useUIStore from './uiStore';

export const stores = {
  auth: useAuthStore,
  groups: useGroupsStore,
  ui: useUIStore,
};

export default stores;