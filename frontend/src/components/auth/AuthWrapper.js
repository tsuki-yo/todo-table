import React from 'react';
import { useAuth } from "react-oidc-context";
import LoginPage from './LoginPage';

const AuthWrapper = ({ children }) => {
  const auth = useAuth();

  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Error: {auth.error.message}</div>;
  if (!auth.isAuthenticated) return <LoginPage />;

  return children;
};

export default AuthWrapper; 