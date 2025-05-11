import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import './toastContext.css';

interface ToastMessage {
  id: string;
  message: string;
  backgroundColor?: string;
  textColor?: string;
  variant?: 'success' | 'danger' | 'warning' | 'info';
}

interface ToastContextType {
  showToast: (
    message: string, 
    options?: {
      variant?: 'success' | 'danger' | 'warning' | 'info';
      backgroundColor?: string;
      textColor?: string;
    }
  ) => void;
}

type ToastProviderProps = {
  children: ReactNode;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({children}: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    message: string, 
    options: {
      variant?: 'success' | 'danger' | 'warning' | 'info';
      backgroundColor?: string;
      textColor?: string;
    } = {}
  ) => {
    console.log("Toast showToast called with message:", message);
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, ...options }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Colores por defecto según el variant
  const getBackgroundColor = (toast: ToastMessage) => {
    if (toast.backgroundColor) return toast.backgroundColor;
    switch(toast.variant) {
      case 'success': return '#4CAF50';
      case 'danger': return '#F44336';
      case 'warning': return '#FF9800';
      case 'info': return '#2196F3';
      default: return '#333333';
    }
  };

  const getTextColor = (toast: ToastMessage) => {
    if (toast.textColor) return toast.textColor;
    return '#FFFFFF';
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer 
        position="top-end"
        className="p-3 toast-container-modern"
      >
        {toasts.map((toast) => (
          <Toast 
            key={toast.id}
            autohide
            delay={3000}
            onClose={() => removeToast(toast.id)}
            className="modern-toast"
            style={{
              backgroundColor: getBackgroundColor(toast),
              color: getTextColor(toast),
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              overflow: 'hidden'
            }}
          >
            <Toast.Body className="toast-body-modern">
              <div className="toast-content">
                {toast.message}
                <button 
                  type="button" 
                  className="toast-close-btn"
                  onClick={() => removeToast(toast.id)}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context;
};