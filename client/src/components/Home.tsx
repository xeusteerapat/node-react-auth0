import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={() => (window.location.href = '/login')}>Login</button>
      <nav>
        <ul>
          <li>
            <Link to='/profile'>Profile</Link>
          </li>
          <li>
            <Link to='/about'>About</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
