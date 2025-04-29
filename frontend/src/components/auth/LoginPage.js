import React from 'react';
import { useAuth } from "react-oidc-context";
import './LoginPage.css';

const LoginPage = () => {
  const auth = useAuth();

  return (
    <div className="login-container">
      <div className="card login-card">
        <h1 className="login-title">Welcome to Todo Table</h1>
        <p className="login-description">
          A simple and elegant way to manage your tasks. Sign in to get started!
        </p>
        <button 
          onClick={() => auth.signinRedirect()}
          className="button button-primary"
        >
          Sign in with Cognito
        </button>
      </div>
    </div>
  );
};

export default LoginPage; 