import React, { useState } from 'react';
import { useAuth } from "react-oidc-context";
import './LoginPage.css';

const LoginPage = () => {
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestLogin = () => {
    setIsLoading(true);
    // Simple guest token - just a timestamp to make it unique
    const guestToken = `guest_${Date.now()}`;
    
    // Set auth state directly
    auth.setUser({
      isAuthenticated: true,
      isAnonymous: true,
      anonymousId: guestToken,
      user: null,
      access_token: guestToken
    });
    
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <h1 className="login-title">Welcome to Todo Table</h1>
        <p className="login-description">
          A simple and elegant way to manage your tasks. Sign in to get started!
        </p>
        <div className="button-container">
          <button 
            onClick={() => auth.signinRedirect()}
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