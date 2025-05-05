import React from 'react';
import { useAuth } from "react-oidc-context";
import { getAnonymousToken, setAnonymousToken } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleAnonymousLogin = async () => {
    try {
      const anonymousId = await getAnonymousToken();
      setAnonymousToken(anonymousId);
      navigate('/');
    } catch (error) {
      console.error('Anonymous login failed:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <h1 className="login-title">Welcome to Todo Table</h1>
        <p className="login-description">
          A simple and elegant way to manage your tasks. Sign in to get started!
        </p>
        <div className="login-buttons">
          <button 
            onClick={() => auth.signinRedirect()}
            className="sign-in-button"
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Sign in with Cognito
          </button>
          <button 
            onClick={handleAnonymousLogin}
            className="anonymous-button"
            onMouseOver={(e) => e.target.style.backgroundColor = '#6c757d'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 