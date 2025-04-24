import { toast, ToastOptions } from 'react-toastify';

// Default configuration for all toasts
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Toast service with standardized methods
const toastService = {
  success: (message: string, options: ToastOptions = {}) => {
    return toast.success(message, { ...defaultOptions, ...options });
  },
  
  error: (message: string, options: ToastOptions = {}) => {
    return toast.error(message, { ...defaultOptions, ...options });
  },
  
  info: (message: string, options: ToastOptions = {}) => {
    return toast.info(message, { ...defaultOptions, ...options });
  },
  
  warning: (message: string, options: ToastOptions = {}) => {
    return toast.warning(message, { ...defaultOptions, ...options });
  },
  
  // For notifications that should persist across navigation
  persistentSuccess: (message: string, options: ToastOptions = {}) => {
    const toastId = `persistent-${Date.now()}`;
    localStorage.setItem('toast-pending', JSON.stringify({
      type: 'success',
      message,
      id: toastId,
      timestamp: Date.now()
    }));
    return toast.success(message, { 
      ...defaultOptions, 
      ...options, 
      toastId,
      onClose: () => {
        localStorage.removeItem('toast-pending');
      }
    });
  },
  
  persistentError: (message: string, options: ToastOptions = {}) => {
    const toastId = `persistent-${Date.now()}`;
    localStorage.setItem('toast-pending', JSON.stringify({
      type: 'error',
      message,
      id: toastId,
      timestamp: Date.now()
    }));
    return toast.error(message, { 
      ...defaultOptions, 
      ...options, 
      toastId,
      onClose: () => {
        localStorage.removeItem('toast-pending');
      }
    });
  },
  
  // Check and display any pending toasts from localStorage
  checkPendingToasts: () => {
    try {
      const pendingToast = localStorage.getItem('toast-pending');
      if (pendingToast) {
        const { type, message, id, timestamp } = JSON.parse(pendingToast);
        // Only show if less than 5 seconds old to prevent stale toasts
        if (Date.now() - timestamp < 5000) {
          if (type === 'success') toast.success(message, { ...defaultOptions, toastId: id });
          if (type === 'error') toast.error(message, { ...defaultOptions, toastId: id });
        }
        localStorage.removeItem('toast-pending');
      }
    } catch (e) {
      console.error('Error checking pending toasts:', e);
      localStorage.removeItem('toast-pending');
    }
  }
};

export default toastService;