import { create } from 'zustand';
import toast from 'react-hot-toast';

const useGroupsStore = create((set, get) => ({
  // State
  groups: [],
  myGroups: [],
  currentGroup: null,
  loading: false,
  error: null,
  searchTerm: '',

  // Actions
  setGroups: (groups) => set({ groups }),
  
  setMyGroups: (myGroups) => set({ myGroups }),
  
  setCurrentGroup: (group) => set({ currentGroup: group }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  setSearchTerm: (searchTerm) => set({ searchTerm }),

  // Add group to user's groups
  joinGroup: (groupId) => {
    const { groups, myGroups } = get();
    const group = groups.find(g => g.id === groupId);
    
    if (group && !myGroups.find(g => g.id === groupId)) {
      const updatedGroup = { ...group, members: group.members + 1 };
      
      set({
        myGroups: [...myGroups, updatedGroup],
        groups: groups.map(g => g.id === groupId ? updatedGroup : g)
      });
      
      toast.success(`Đã tham gia nhóm "${group.name}"!`);
    }
  },

  // Leave group
  leaveGroup: (groupId) => {
    const { myGroups, groups } = get();
    const group = myGroups.find(g => g.id === groupId);
    
    if (group) {
      const updatedGroup = { ...group, members: Math.max(0, group.members - 1) };
      
      set({
        myGroups: myGroups.filter(g => g.id !== groupId),
        groups: groups.map(g => g.id === groupId ? updatedGroup : g)
      });
      
      toast.success(`Đã rời khỏi nhóm "${group.name}"`);
    }
  },

  // Create new group
  createGroup: (groupData) => {
    const { groups, myGroups } = get();
    
    const newGroup = {
      id: Date.now(), // In real app, this would come from the server
      name: groupData.groupName,
      subject: groupData.subject,
      description: groupData.description,
      category: groupData.category,
      subjectColor: 'bg-purple-600',
      members: 1,
      createdAt: new Date().toISOString(),
      isOwner: true
    };

    set({
      groups: [newGroup, ...groups],
      myGroups: [newGroup, ...myGroups]
    });

    toast.success(`Nhóm "${newGroup.name}" đã được tạo thành công!`);
    return newGroup;
  },

  // Update group
  updateGroup: (groupId, updates) => {
    const { groups, myGroups } = get();
    
    set({
      groups: groups.map(g => g.id === groupId ? { ...g, ...updates } : g),
      myGroups: myGroups.map(g => g.id === groupId ? { ...g, ...updates } : g)
    });
    
    toast.success('Thông tin nhóm đã được cập nhật!');
  },

  // Delete group
  deleteGroup: (groupId) => {
    const { groups, myGroups } = get();
    const group = groups.find(g => g.id === groupId);
    
    set({
      groups: groups.filter(g => g.id !== groupId),
      myGroups: myGroups.filter(g => g.id !== groupId),
      currentGroup: get().currentGroup?.id === groupId ? null : get().currentGroup
    });
    
    if (group) {
      toast.success(`Nhóm "${group.name}" đã được xóa`);
    }
  },

  // Get filtered groups based on search term
  getFilteredGroups: () => {
    const { groups, searchTerm } = get();
    
    if (!searchTerm.trim()) {
      return groups;
    }
    
    return groups.filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },

  // Reset groups state
  reset: () => set({
    groups: [],
    myGroups: [],
    currentGroup: null,
    loading: false,
    error: null,
    searchTerm: ''
  })
}));

export default useGroupsStore;