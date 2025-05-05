import React from 'react';
import { useAuth } from 'react-oidc-context';
import { getAnonymousTokenFromStorage } from './services/authService';
import './App.css';
import LoginPage from './components/auth/LoginPage';
import TaskTable from './components/todo/TaskTable';
import Header from './components/layout/Header';

function App() {
  const auth = useAuth();
  const anonymousToken = getAnonymousTokenFromStorage();

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  if (!auth.isAuthenticated && !anonymousToken) {
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
