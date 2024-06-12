import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import About from './components/About';
import Home from './components/Home';
import Login from './components/Login';
import Profile from './components/Profile';
import PrivateRoute from './routes/PrivateRoute';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/about' element={<About />} />
      <Route path='/login' element={<Login />} />
      <Route
        path='/profile'
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route path='*' element={<Navigate to='/' />} />
    </Routes>
  );
};

export default App;
