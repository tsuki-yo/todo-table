import React, { useState } from 'react';
import { useAuth } from "react-oidc-context";
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const generateGuestToken = () => {
    // Generate a random string for the guest token
    const randomBytes = new Uint8Array(16);
    window.crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    const guestToken = generateGuestToken();
    // Store the guest token in localStorage
    localStorage.setItem('guest_token', guestToken);
    // Set the auth state with the generated token
    auth.setUser({
      isAuthenticated: true,
      isAnonymous: true,
      anonymousId: guestToken,
      user: null,
      access_token: guestToken
    }).then(() => {
      setIsLoading(false);
      // Force a navigation to the root path
      navigate('/');
    });
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