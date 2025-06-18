'use client';

import React, { useEffect, useState } from 'react';
import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    set({ toasts: [...get().toasts, newToast] });
    
    // Auto-remove toast after duration
    const duration = toast.duration || 4000;
    setTimeout(() => {
      set({ toasts: get().toasts.filter(t => t.id !== id) });
    }, duration);
  },
  
  removeToast: (id) => {
    set({ toasts: get().toasts.filter(t => t.id !== id) });
  },
  
  clearAllToasts: () => {
    set({ toasts: [] });
  },
}));

// Toast utility functions
export const toast = {
  success: (message: string, options?: Partial<Toast>) => {
    useToastStore.getState().addToast({ message, type: 'success', ...options });
  },
  error: (message: string, options?: Partial<Toast>) => {
    useToastStore.getState().addToast({ message, type: 'error', ...options });
  },
  info: (message: string, options?: Partial<Toast>) => {
    useToastStore.getState().addToast({ message, type: 'info', ...options });
  },
  warning: (message: string, options?: Partial<Toast>) => {
    useToastStore.getState().addToast({ message, type: 'warning', ...options });
  },
};

// Toast Component
const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToastStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => removeToast(toast.id), 300);
  };

  const getToastStyles = () => {
    const baseStyles = "flex items-center p-4 mb-4 rounded-lg shadow-lg transition-all duration-300 transform";
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50 text-green-800 border-l-4 border-green-400`;
      case 'error':
        return `${baseStyles} bg-red-50 text-red-800 border-l-4 border-red-400`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-50 text-blue-800 border-l-4 border-blue-400`;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div 
      className={`${getToastStyles()} ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      {getIcon()}
      
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>

      {toast.action && (
        <button
          onClick={toast.action.onClick}
          className="ml-4 px-3 py-1 text-sm font-medium rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
        >
          {toast.action.label}
        </button>
      )}

      <button
        onClick={handleClose}
        className="ml-4 text-current hover:text-opacity-75 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

// Toast Container Component
export const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer; 