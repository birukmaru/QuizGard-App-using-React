import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './index.css';

// Clerk publishable key - set in .env file as VITE_CLERK_PUBLISHABLE_KEY
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_c21hc2hpbmctbW9sZS05MC5jbGVyay5hY2NvdW50cy5kZXYk';

// Debug: log the key status
console.log('Clerk Key:', clerkPubKey ? 'Loaded' : 'Missing');
if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
  console.warn('VITE_CLERK_PUBLISHABLE_KEY not found in env, using fallback');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={clerkPubKey || 'pk_test_placeholder'}
      routerPush={(to) => window.history.pushState(null, '', to)}
      routerReplace={(to) => window.history.replaceState(null, '', to)}
      afterSignOutUrl="/"
    >
      <BrowserRouter>
        <ThemeProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-background, #363636)',
                color: 'var(--toast-color, #fff)',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </ThemeProvider>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);
