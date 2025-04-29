import React from 'react';
import { render } from '@testing-library/react';
import { AuthProvider } from 'react-oidc-context';

// Common mock data
export const mockTasks = [
  { id: 1, task: 'Test Task 1', dueDate: '2024-03-20' },
  { id: 2, task: 'Test Task 2', dueDate: '2024-03-21' }
];

// Mock react-oidc-context
jest.mock('react-oidc-context');

// Custom render function with providers
export function renderWithProviders(ui, { ...renderOptions } = {}) {
  const Wrapper = ({ children }) => (
    <AuthProvider>
      {children}
    </AuthProvider>
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