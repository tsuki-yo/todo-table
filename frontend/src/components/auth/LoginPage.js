import React, { useState } from 'react';
import { useAuth } from "react-oidc-context";
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestLogin = () => {
    setIsLoading(true);
    // Generate 32-character hex token for guest
    const guestToken = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    // Set guest user in local storage
    localStorage.setItem('authType', 'guest');
    localStorage.setItem('guestToken', guestToken);
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

  return (
    <div className="login-container">
      <div className="card login-card">
        <h1 className="login-title">Welcome to Todo Table</h1>
        <p className="login-description">
          A DevOps + AI showcase featuring intelligent task management with natural language processing. 
          Create tasks in Japanese or English (e.g., "明日買い物をする" or "buy groceries tomorrow").
        </p>
        <div className="button-container">
          <button 
            onClick={handleCognitoLogin}
            className="sign-in-button"
          >
            Sign in with Cognito
          </button>
          <button 
            onClick={handleGuestLogin}
            className="guest-login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Continue as Guest'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 