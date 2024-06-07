import React from 'react';
import { useAuth } from './auth/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';

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
  const { accessToken } = useAuth();

  return accessToken ? (
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
