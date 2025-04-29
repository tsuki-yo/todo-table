import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock axios before imports
jest.mock('axios');

// Mock react-oidc-context
jest.mock('react-oidc-context', () => {
  let currentAuth = {
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

  return {
    useAuth: () => currentAuth,
    setMockAuth: (newAuth) => {
      currentAuth = { ...currentAuth, ...newAuth };
    },
    AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>
  };
});

// Mock react-router-dom components
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }) => element,
  useNavigate: () => jest.fn(),
  Navigate: () => null,
  Link: ({ children }) => children,
  useLocation: () => ({ pathname: '/' }),
  useParams: () => ({}),
  Outlet: () => null,
  useSearchParams: () => [new URLSearchParams(), jest.fn()]
}));

// Mock the isPastDue function
jest.mock('./utils/dateUtils', () => ({
  isPastDue: jest.fn((date) => date === '2024-04-25')
}));

// Import after mocks
import App from './App';
import axios from 'axios';
import {
  mockTasks,
  renderWithProviders,
  mockApiResponse,
  mockApiError
} from './utils/test-utils';

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset axios mock implementations
    axios.get.mockImplementation(() => Promise.resolve(mockApiResponse(mockTasks)));
    axios.put.mockImplementation(() => Promise.resolve(mockApiResponse({})));
    
    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Reset auth state
    require('react-oidc-context').setMockAuth({
      isAuthenticated: true,
      isLoading: false,
      error: null,
      user: {
        profile: {
          name: 'Test User',
          email: 'test@example.com'
        },
        access_token: 'test-token'
      }
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('authentication', () => {
    describe('when user is authenticated', () => {
      it('displays welcome message with user name', async () => {
        renderWithProviders(<App />);
        await waitFor(() => {
          expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
        });
      });

      it('fetches and displays tasks', async () => {
        renderWithProviders(<App />);
        
        await waitFor(() => {
          expect(screen.getByDisplayValue('Test Task 1')).toBeInTheDocument();
          expect(screen.getByDisplayValue('Test Task 2')).toBeInTheDocument();
        });

        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/tasks'),
          expect.any(Object)
        );
      });

      it('updates task when edited', async () => {
        renderWithProviders(<App />);
        
        await waitFor(() => {
          expect(screen.getByDisplayValue('Test Task 1')).toBeInTheDocument();
        });

        const taskInput = screen.getByDisplayValue('Test Task 1');
        fireEvent.change(taskInput, { target: { value: 'Updated Task' } });
        fireEvent.blur(taskInput);

        await waitFor(() => {
          expect(axios.put).toHaveBeenCalledWith(
            expect.stringContaining('/tasks/0'),
            expect.objectContaining({ task: 'Updated Task' }),
            expect.any(Object)
          );
        });
      });

      it('handles sign out correctly', async () => {
        renderWithProviders(<App />);
        
        await waitFor(() => {
          expect(screen.getByText(/Sign out/i)).toBeInTheDocument();
        });
        
        fireEvent.click(screen.getByText(/Sign out/i));
        expect(require('react-oidc-context').useAuth().removeUser).toHaveBeenCalled();
      });
    });

    describe('when user is not authenticated', () => {
      it('shows sign in button', async () => {
        require('react-oidc-context').setMockAuth({
          isAuthenticated: false,
          isLoading: false,
          user: null
        });

        renderWithProviders(<App />);
        
        await waitFor(() => {
          expect(screen.getByRole('button', { name: /Sign in with Cognito/i })).toBeInTheDocument();
        });
      });
    });
  });

  describe('task management', () => {
    it('displays past due dates in red', async () => {
      const tasksWithDates = [
        { id: 1, task: 'Past Due Task', dueDate: '2024-04-25' },
        { id: 2, task: 'Future Task', dueDate: '2024-05-01' }
      ];
      
      axios.get.mockImplementationOnce(() => Promise.resolve(mockApiResponse(tasksWithDates)));
      
      renderWithProviders(<App />);
      
      await waitFor(() => {
        const dateInputs = screen.getAllByRole('date');
        expect(dateInputs.length).toBeGreaterThan(0);
        
        const pastDueInput = dateInputs[0];
        const futureInput = dateInputs[1];
        
        expect(pastDueInput).toHaveClass('past-due');
        expect(futureInput).not.toHaveClass('past-due');
      });
    });

    it('handles API error when fetching tasks', async () => {
      const errorMessage = 'API Error';
      axios.get.mockImplementationOnce(() => Promise.reject(mockApiError(errorMessage)));
      
      renderWithProviders(<App />);
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error fetching tasks:', expect.any(Error));
      });
    });
  });
});
