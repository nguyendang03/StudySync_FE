import { toast } from 'sonner';

/**
 * Custom toast utility using Sonner
 * Provides consistent, beautiful toast notifications across the app
 * Uses icons and modern design instead of emojis
 */

export const showToast = {
  // Success toasts
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: 3000,
      ...options,
    });
  },

  // Error toasts
  error: (message, options = {}) => {
    return toast.error(message, {
      duration: 4000,
      ...options,
    });
  },

  // Info toasts
  info: (message, options = {}) => {
    return toast.info(message, {
      duration: 3000,
      ...options,
    });
  },

  // Warning toasts
  warning: (message, options = {}) => {
    return toast.warning(message, {
      duration: 3500,
      ...options,
    });
  },

  // Loading toast (returns ID to dismiss later)
  loading: (message, options = {}) => {
    return toast.loading(message, options);
  },

  // Promise toast (auto-handles loading/success/error)
  promise: (promise, messages, options = {}) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Đang xử lý...',
      success: messages.success || 'Thành công!',
      error: messages.error || 'Có lỗi xảy ra!',
      ...options,
    });
  },

  // Custom toast with icon
  custom: (message, options = {}) => {
    return toast(message, options);
  },

  // Dismiss specific toast
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
  },

  // Action toast with button
  action: (message, actionLabel, actionFn, options = {}) => {
    return toast(message, {
      action: {
        label: actionLabel,
        onClick: actionFn,
      },
      ...options,
    });
  },
};

// Preset toasts for common scenarios
export const commonToasts = {
  // Authentication
  loginSuccess: (username) => 
    showToast.success(`Đăng nhập thành công`, { duration: 2500 }),
  
  loginError: () => 
    showToast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'),
  
  logoutSuccess: () => 
    showToast.success('Đăng xuất thành công'),
  
  registerSuccess: () => 
    showToast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.'),

  // Group operations
  groupCreated: (groupName) => 
    showToast.success(`Nhóm "${groupName}" đã được tạo thành công!`),
  
  groupJoined: (groupName) => 
    showToast.success(`Đã tham gia nhóm "${groupName}"`),
  
  groupLeft: (groupName) => 
    showToast.success(`Đã rời khỏi nhóm "${groupName}"`),
  
  memberInvited: (memberName) => 
    showToast.success(`Đã gửi lời mời đến ${memberName}`),

  // Video call
  callStarted: () => 
    showToast.success('Cuộc gọi đã bắt đầu'),
  
  callEnded: () => 
    showToast.info('Cuộc gọi đã kết thúc'),
  
  callJoined: () => 
    showToast.success('Đã tham gia cuộc gọi'),

  // Task operations
  taskCreated: () => 
    showToast.success('Tạo nhiệm vụ thành công'),
  
  taskUpdated: () => 
    showToast.success('Cập nhật nhiệm vụ thành công'),
  
  taskDeleted: () => 
    showToast.success('Xóa nhiệm vụ thành công'),

  // File operations
  fileUploaded: (fileName) => 
    showToast.success(`Đã tải lên "${fileName}"`),
  
  fileDeleted: (fileName) => 
    showToast.success(`Đã xóa "${fileName}"`),

  // Chat
  messageSent: () => 
    showToast.success('Tin nhắn đã được gửi', { duration: 1500 }),
  
  messageDeleted: () => 
    showToast.success('Đã xóa tin nhắn'),

  // Notifications
  notificationRead: () => 
    showToast.success('Đã đánh dấu là đã đọc'),

  // Network errors
  networkError: () => 
    showToast.error('Lỗi kết nối mạng. Vui lòng thử lại!'),
  
  serverError: () => 
    showToast.error('Lỗi máy chủ. Vui lòng thử lại sau!'),

  // Validation
  invalidInput: (field) => 
    showToast.warning(`${field} không hợp lệ`),
  
  requiredField: (field) => 
    showToast.warning(`Vui lòng nhập ${field}`),

  // Permissions
  permissionDenied: () => 
    showToast.error('Bạn không có quyền thực hiện thao tác này'),

  // Copy to clipboard
  copiedToClipboard: () => 
    showToast.success('Đã sao chép vào clipboard', { duration: 2000 }),
};

export default showToast;
