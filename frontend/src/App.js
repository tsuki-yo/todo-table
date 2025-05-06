import React, { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import './styles/base.css';
import './App.css';
import LoginPage from './components/auth/LoginPage';
import TaskTable from './components/todo/TaskTable';
import Header from './components/layout/Header';

const API_URL = "https://todo-app.natsuki-cloud.dev/tasks";
const TOTAL_ROWS = 20;

// Main App component
function App() {
  const auth = useAuth();
  const navigate = useNavigate();
  const isGuestUser = localStorage.getItem('authType') === 'guest';

  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Error: {auth.error.message}</div>;

  if (!auth.isAuthenticated && !isGuestUser) {
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

// Callback component for OIDC redirects
function Callback() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        navigate("/");
      } else if (auth.error) {
        console.error("Auth error:", auth.error);
        navigate("/");
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.error, navigate]);

  if (auth.isLoading) {
    return (
      <div className="loading-container">
        <h2>Processing login...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    );
  }

  return null;
}

// Root component that sets up routing
const Root = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/callback" element={<Callback />} />
      <Route path="/" element={<App />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </BrowserRouter>
);

export default Root;
