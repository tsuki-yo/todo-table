import React from 'react';
import { useAuth } from "react-oidc-context";
import './Header.css';

const Header = () => {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = auth.settings.client_id;
    const logoutUri = "https://todo-app.natsuki-cloud.dev";
    const cognitoDomain = "https://ap-northeast-1rhcqr8mhf.auth.ap-northeast-1.amazoncognito.com";
    auth.removeUser(); // Clear the auth state first
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  return (
    <div className="header-container">
      <div className="header-content">
        <h2 className="header-title">
          Welcome, {auth.user?.profile.name || auth.user?.profile.email}
        </h2>
        <div className="header-button-container">
          <button 
            onClick={signOutRedirect}
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