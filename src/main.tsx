import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
    <SocketProvider>
    <ToastProvider>
      <CartProvider>
      <App />
      </CartProvider>
    </ToastProvider>
    </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)
