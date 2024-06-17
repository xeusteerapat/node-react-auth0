import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from './auth/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

const LoginButton: React.FC = () => {
  const { login } = useAuth();
  return <button onClick={login}>Log In</button>;
};

const LogoutButton: React.FC = () => {
  const { logout } = useAuth();
  return <button onClick={logout}>Log Out</button>;
};

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { accessToken } = useAuth();
  console.log('access token in App.tsx', accessToken);
  return accessToken ? children : <Navigate to="/" />;
};

const ProtectedComponent: React.FC = () => {
  return <div>This is a protected route.</div>;
};

const Main: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const hasFetchToken = useRef(false);

  useEffect(() => {
    if (hasFetchToken.current) return;

    hasFetchToken.current = true;

    try {
      const fetchProtectedData = async () => {
        await axios({
          method: 'get',
          url: 'http://localhost:5001',
          headers: {
            'Access-Control-Allow-Credentials': true,
          },
          withCredentials: true,
        });

        setIsAuthenticated(true);
      };

      fetchProtectedData();
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          console.log('Unauthorized');
        }
      }
      hasFetchToken.current = false;
    }
  }, []);

  return isAuthenticated ? (
    <div>
      <h1>Welcome</h1>
      <LogoutButton />
      <ProtectedComponent />
    </div>
  ) : (
    <LoginButton />
  );
};

const Callback: React.FC = () => {
  const { accessToken } = useAuth();
  return accessToken ? <Navigate to="/" /> : <div>Loading...</div>;
};

const App: React.FC = () => (
  <Routes>
    <Route path="/" element={<Main />} />
    <Route path="/callback" element={<Callback />} />
    <Route
      path="/protected"
      element={
        <ProtectedRoute>
          <ProtectedComponent />
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default App;
