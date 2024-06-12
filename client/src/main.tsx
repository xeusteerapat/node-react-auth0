import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import App2 from './App2.tsx';

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App2 />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
