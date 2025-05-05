import React from 'react';
import { useAuth } from 'react-oidc-context';
import { useGuestAuth } from '../../contexts/GuestAuthContext';
import './Header.css';

const Header = ({ user }) => {
  const auth = useAuth();
  const guestAuth = useGuestAuth();

  const handleSignOut = () => {
    if (user?.isGuest) {
      guestAuth.logoutGuest();
    } else {
      auth.removeUser();
      auth.signOut();
    }
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    if (user.isGuest) return 'Guest';
    return user.profile?.name || 'User';
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="app-title">Todo Table</h1>
        <div className="user-info">
          {user ? (
            <>
              <span className="welcome-message">
                Welcome, {getUserDisplayName()}
              </span>
              <button 
                onClick={handleSignOut}
                className="sign-out-button"
                onMouseOver={(e) => e.target.style.backgroundColor = '#dc3545'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ff4444'}
              >
                Sign Out
              </button>
            </>
          ) : (
            <span className="welcome-message">Please sign in</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 