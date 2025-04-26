import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { AuthProvider } from 'react-oidc-context';
import App from './App';

// Mock axios
jest.mock('axios');

// Mock the auth context
const mockAuthContext = {
  isAuthenticated: true,
  isLoading: false,
  error: null,
  user: {
    access_token: 'mock-access-token',
    profile: {
      name: 'Test User',
      email: 'test@example.com'
    }
  },
  signinRedirect: jest.fn(),
  removeUser: jest.fn()
};

// Mock the AuthProvider component
jest.mock('react-oidc-context', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => mockAuthContext
}));

// Mock BrowserRouter
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ element }) => element,
  useNavigate: () => jest.fn(),
  Navigate: () => null
}));

describe('App Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock axios get response
    axios.get.mockResolvedValue({
      data: [
        { id: 0, task: 'Test Task 1', dueDate: '2024-05-01' },
        { id: 1, task: 'Test Task 2', dueDate: '2024-04-25' }
      ]
    });
    
    // Mock axios put response
    axios.put.mockResolvedValue({
      data: { id: 0, task: 'Updated Task', dueDate: '2024-05-01' }
    });
  });

  test('renders welcome message when authenticated', async () => {
    render(<App />);
    
    // Check if welcome message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Welcome, Test User/i)).toBeInTheDocument();
    });
  });

  test('renders todo table when authenticated', async () => {
    render(<App />);
    
    // Check if todo table is displayed
    await waitFor(() => {
      expect(screen.getByText('Todo List')).toBeInTheDocument();
    });
    
    // Check if table headers are displayed
    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('Item Name')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
  });

  test('fetches tasks from API when authenticated', async () => {
    render(<App />);
    
    // Check if axios.get was called with the correct URL
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'https://todo-app.natsuki-cloud.dev/tasks',
        expect.any(Object)
      );
    });
  });

  test('updates task when editing and blurring', async () => {
    render(<App />);
    
    // Wait for tasks to be loaded
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Task 1')).toBeInTheDocument();
    });
    
    // Find the task input and edit it
    const taskInput = screen.getByDisplayValue('Test Task 1');
    fireEvent.change(taskInput, { target: { value: 'Updated Task' } });
    
    // Trigger blur event to save the task
    fireEvent.blur(taskInput);
    
    // Check if axios.put was called with the correct parameters
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'https://todo-app.natsuki-cloud.dev/tasks/0',
        expect.objectContaining({ task: 'Updated Task' }),
        expect.any(Object)
      );
    });
  });

  test('shows sign in button when not authenticated', () => {
    // Override the mock auth context for this test
    jest.spyOn(require('react-oidc-context'), 'useAuth').mockImplementation(() => ({
      ...mockAuthContext,
      isAuthenticated: false
    }));
    
    render(<App />);
    
    // Check if sign in button is displayed
    expect(screen.getByText('Sign in with Cognito')).toBeInTheDocument();
  });

  test('handles sign out correctly', async () => {
    render(<App />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Sign out')).toBeInTheDocument();
    });
    
    // Click the sign out button
    fireEvent.click(screen.getByText('Sign out'));
    
    // Check if removeUser was called
    expect(mockAuthContext.removeUser).toHaveBeenCalled();
  });

  test('displays past due dates in red', async () => {
    // Mock current date to be 2024-04-26
    const mockDate = new Date('2024-04-26');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    render(<App />);
    
    // Wait for tasks to be loaded
    await waitFor(() => {
      expect(screen.getByDisplayValue('2024-04-25')).toBeInTheDocument();
    });
    
    // Find the past due date input
    const pastDueInput = screen.getByDisplayValue('2024-04-25');
    
    // Check if the input has red color
    expect(pastDueInput).toHaveStyle({ color: '#dc3545' });
    
    // Find the future date input
    const futureDueInput = screen.getByDisplayValue('2024-05-01');
    
    // Check if the input has default color
    expect(futureDueInput).not.toHaveStyle({ color: '#dc3545' });
    
    // Restore the Date constructor
    jest.restoreAllMocks();
  });
});
