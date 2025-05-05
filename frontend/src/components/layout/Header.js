import React from 'react';
import { useAuth } from "react-oidc-context";
import { removeAnonymousToken } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    if (auth.isAuthenticated) {
      const clientId = auth.settings.client_id;
      const logoutUri = "https://todo-app.natsuki-cloud.dev";
      const cognitoDomain = "https://ap-northeast-1rhcqr8mhf.auth.ap-northeast-1.amazoncognito.com";
      auth.removeUser(); // Clear the auth state first
      window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    } else {
      // Handle anonymous user sign out
      removeAnonymousToken();
      navigate('/');
    }
  };

  const getUserName = () => {
    if (auth.isAuthenticated) {
      return auth.user?.profile.name || auth.user?.profile.email;
    }
    return "Guest";
  };

  return (
    <div className="header-container">
      <div className="header-content">
        <h2 className="header-title">
          Welcome, {getUserName()}
        </h2>
        <div className="header-button-container">
          <button 
            onClick={handleSignOut}
            className="sign-out"
            onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header; 