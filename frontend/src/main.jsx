import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

console.log('React app is mounting...');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1A1A2E',
              color: '#fff',
              border: '3px solid #000',
              borderRadius: '12px',
              fontFamily: '"Comic Neue", cursive',
            },
            success: {
              iconTheme: {
                primary: '#00FF88',
                secondary: '#000',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF0055',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
