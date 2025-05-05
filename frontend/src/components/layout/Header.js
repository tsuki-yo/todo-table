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
    return user.profile?.name || user.profile?.email || 'User';
  };

  return (
    <div className="card header-container">
      <div className="header-content">
        <h1 className="app-title">Todo Table</h1>
        <div className="user-info">
          {user ? (
            <>
              <h2 className="header-title">
                {user.isGuest ? 'Welcome, Guest' : `Welcome, ${getUserDisplayName()}`}
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
            </>
          ) : (
            <h2 className="header-title">Please sign in</h2>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header; 