import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { ToastProvider } from '@/context/ToastContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
