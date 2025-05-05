import React, { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import './App.css';
import LoginPage from './components/auth/LoginPage';
import TaskTable from './components/todo/TaskTable';
import Header from './components/layout/Header';

function App() {
  const auth = useAuth();

  useEffect(() => {
    // Check for guest token in localStorage on initial load
    const guestToken = localStorage.getItem('guest_token');
    if (guestToken && !auth.isAuthenticated) {
      auth.setUser({
        isAuthenticated: true,
        isAnonymous: true,
        anonymousId: guestToken,
        user: null,
        access_token: guestToken
      });
    }
  }, [auth]);

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (!auth.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <TaskTable />
      </main>
    </div>
  );
}

export default App;
