import React from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const isGuestUser = localStorage.getItem('authType') === 'guest';
  const guestUser = isGuestUser ? JSON.parse(localStorage.getItem('guestUser')) : null;

  const handleLogout = () => {
    if (isGuestUser) {
      // Clear guest data
      localStorage.removeItem('authType');
      localStorage.removeItem('guestUser');
      navigate('/login');
    } else {
      // OIDC logout
      auth.removeUser();
      auth.signOut();
    }
  };

  const user = isGuestUser ? guestUser : auth.user;

  return (
    <div className="card header-container">
      <div className="header-content">
        <h1 className="app-title">Todo Table</h1>
        <div className="user-info">
          {user && (
            <>
              <span className="welcome-message">
                Welcome, {isGuestUser ? user.name : user.profile?.name || 'User'}!
              </span>
              <button onClick={handleLogout} className="button button-danger">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header; 