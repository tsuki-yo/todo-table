import React from 'react';

const mockAuth = {
  isAuthenticated: true,
  isLoading: false,
  error: null,
  user: {
    profile: {
      name: 'Test User',
      email: 'test@example.com'
    },
    access_token: 'test-token'
  },
  settings: {
    client_id: 'test-client-id'
  },
  signinRedirect: jest.fn(),
  signOut: jest.fn(),
  removeUser: jest.fn()
};

export const useAuth = () => mockAuth;

export const AuthProvider = ({ children }) => {
  return <>{children}</>;
}; 