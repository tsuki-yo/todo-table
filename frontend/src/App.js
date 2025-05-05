import React from 'react';
import { AuthProvider, useAuth } from 'react-oidc-context';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './components/auth/LoginPage';
import TaskTable from './components/todo/TaskTable';
import Header from './components/layout/Header';

// OIDC configuration
const oidcConfig = {
  authority: process.env.REACT_APP_COGNITO_DOMAIN,
  client_id: process.env.REACT_APP_COGNITO_CLIENT_ID,
  redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'openid profile email',
  onSigninCallback: () => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );
  }
};

// Protected route component that allows both OIDC and guest users
function ProtectedRoute({ children }) {
  const auth = useAuth();
  const isGuestUser = localStorage.getItem('authType') === 'guest';
  
  if (auth.isLoading) {
    return <div>Loading...</div>;
  }
  
  if (auth.isAuthenticated || isGuestUser) {
    return children;
  }
  
  return <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider {...oidcConfig}>
      <BrowserRouter>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <TaskTable />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
