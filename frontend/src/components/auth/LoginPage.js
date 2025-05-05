import React, { useState } from 'react';
import { useAuth } from "react-oidc-context";
import { useNavigate, Navigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestLogin = () => {
    setIsLoading(true);
    // Set guest user in local storage
    localStorage.setItem('authType', 'guest');
    localStorage.setItem('guestUser', JSON.stringify({
      id: 'guest-' + Math.random().toString(36).substr(2, 9),
      name: 'Guest User',
      isGuest: true
    }));
    setIsLoading(false);
    navigate('/');
  };

  const handleCognitoLogin = () => {
    auth.signinRedirect();
  };

  // If authenticated via OIDC or guest, redirect to dashboard
  if (auth.isAuthenticated || localStorage.getItem('authType') === 'guest') {
    return <Navigate to="/" />;
  }

  return (
    <div className="login-container">
      <div className="card login-card">
        <h1 className="login-title">Welcome to Todo Table</h1>
        <p className="login-description">
          A simple and elegant way to manage your tasks. Sign in to get started!
        </p>
        <div className="button-container">
          <button 
            onClick={handleCognitoLogin}
            className="sign-in-button"
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Sign in with Cognito
          </button>
          <button 
            onClick={handleGuestLogin}
            className="guest-login-button"
            disabled={isLoading}
            onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
          >
            {isLoading ? 'Loading...' : 'Continue as Guest'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 