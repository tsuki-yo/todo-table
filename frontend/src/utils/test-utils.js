import React from 'react';
import { render } from '@testing-library/react';

// Common mock data
export const mockTasks = [
  { id: 1, task: 'Test Task 1', dueDate: '2024-03-20' },
  { id: 2, task: 'Test Task 2', dueDate: '2024-03-21' }
];

export const mockAuth = {
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

// Custom render function with providers
export function renderWithProviders(ui, { auth = mockAuth, ...renderOptions } = {}) {
  const Wrapper = ({ children }) => (
    <div data-testid="test-wrapper">{children}</div>
  );
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Date mocking utilities
export const mockDate = (dateString) => {
  const mockDate = new Date(dateString);
  const RealDate = global.Date;
  
  beforeAll(() => {
    global.Date = class extends Date {
      constructor() {
        return mockDate;
      }
      static now() {
        return mockDate.getTime();
      }
    };
  });

  afterAll(() => {
    global.Date = RealDate;
  });

  return mockDate;
};

// API response mocks
export const mockApiResponse = (data) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {}
});

export const mockApiError = (message) => {
  const error = new Error(message);
  error.response = {
    status: 500,
    statusText: 'Internal Server Error',
    data: { message }
  };
  return error;
}; 