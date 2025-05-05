import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from 'react-oidc-context';
import { GuestAuthProvider, useGuestAuth } from './contexts/GuestAuthContext';
import LoginPage from './components/auth/LoginPage';
import Header from './components/layout/Header';
import TaskTable from './components/todo/TaskTable';
import './App.css';

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

// Auth wrapper component
function AuthWrapper({ children }) {
  return (
    <AuthProvider {...oidcConfig}>
      <GuestAuthProvider>
        {children}
      </GuestAuthProvider>
    </AuthProvider>
  );
}

// Protected route component
function ProtectedRoute({ children }) {
  const auth = useAuth();
  const guestAuth = useGuestAuth();
  const location = useLocation();

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.isAuthenticated || guestAuth.isGuestLoggedIn) {
    return children;
  }

  return <Navigate to="/login" state={{ from: location }} replace />;
}

function App() {
  const auth = useAuth();
  const guestAuth = useGuestAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (auth.isAuthenticated) {
      setUser(auth.user);
    } else if (guestAuth.isGuestLoggedIn) {
      setUser(guestAuth.guestUser);
    } else {
      setUser(null);
    }
  }, [auth.isAuthenticated, auth.user, guestAuth.isGuestLoggedIn, guestAuth.guestUser]);

  return (
    <Router>
      <div className="App">
        <Header user={user} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TaskTable user={user} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default function AppWithAuth() {
  return (
    <AuthWrapper>
      <App />
    </AuthWrapper>
  );
}
