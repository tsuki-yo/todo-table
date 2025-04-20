import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "react-oidc-context";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";

const API_URL = "https://todo-app.natsuki-cloud.dev/tasks";
const TOTAL_ROWS = 20; // Fixed number of rows

// Main App component
function App() {
  const auth = useAuth();
  const [tasks, setTasks] = useState(
    Array(TOTAL_ROWS).fill({ id: null, task: "", dueDate: "" })
  );

  const signOutRedirect = () => {
    const clientId = auth.settings.client_id;
    const logoutUri = "https://todo-app.natsuki-cloud.dev";
    const cognitoDomain = "https://ap-northeast-1rhcqr8mhf.auth.ap-northeast-1.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  // Fetch tasks when authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      axios
        .get(API_URL, {
          headers: { Authorization: `Bearer ${auth.user?.access_token}` },
        })
        .then((res) => {
          setTasks(
            [...Array(TOTAL_ROWS)].map((_, index) =>
              res.data[index] || { id: null, task: "", dueDate: "" }
            )
          );
        })
        .catch((err) => console.error("Error fetching tasks:", err));
    }
  }, [auth.isAuthenticated, auth.user]);

  const handleEdit = (index, field, value) => {
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      updatedTasks[index] = { ...updatedTasks[index], [field]: value };
      return updatedTasks;
    });
  };

  const handleBlur = (task, index) => {
    if (!task.task) return;
    axios
      .put(`${API_URL}/${index}`, task, {
        headers: { Authorization: `Bearer ${auth.user?.access_token}` },
      })
      .catch((err) => console.error("Error updating task:", err));
  };

  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Error: {auth.error.message}</div>;

  if (!auth.isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '400px',
          width: '90%'
        }}>
          <h1 style={{ color: '#333', marginBottom: '1rem' }}>Welcome to Todo Table</h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            A simple and elegant way to manage your tasks. Sign in to get started!
          </p>
          <button 
            onClick={() => auth.signinRedirect()}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Sign in with Cognito
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "clamp(10px, 3vw, 20px)",
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: "Arial, sans-serif" 
    }}>
      <div style={{
        background: 'white',
        padding: 'clamp(1rem, 4vw, 2rem)',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{ 
            margin: 0, 
            color: '#333',
            fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
            flex: '1 1 auto',
            wordBreak: 'break-word'
          }}>Welcome, {auth.user?.profile.name || auth.user?.profile.email}</h2>
          <div style={{ flex: '0 0 auto' }}>
            <button
              onClick={signOutRedirect}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: 'clamp(6px, 2vw, 8px) clamp(12px, 3vw, 16px)',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                whiteSpace: 'nowrap',
                touchAction: 'manipulation'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div style={{
        background: 'white',
        padding: 'clamp(1rem, 4vw, 2rem)',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflowX: 'auto'
      }}>
        <h2 style={{ 
          color: '#333', 
          marginBottom: '20px',
          fontSize: 'clamp(1.2rem, 4vw, 1.5rem)'
        }}>Todo List</h2>
        <table style={{ 
          width: "100%", 
          borderCollapse: "collapse",
          minWidth: '300px'
        }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              <th style={{ 
                border: "1px solid #dee2e6", 
                padding: "clamp(8px, 2vw, 12px)", 
                color: '#495057',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>#</th>
              <th style={{ 
                border: "1px solid #dee2e6", 
                padding: "clamp(8px, 2vw, 12px)", 
                color: '#495057',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>Item Name</th>
              <th style={{ 
                border: "1px solid #dee2e6", 
                padding: "clamp(8px, 2vw, 12px)", 
                color: '#495057',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr key={index}>
                <td style={{ 
                  border: "1px solid #dee2e6", 
                  padding: "clamp(8px, 2vw, 12px)", 
                  textAlign: "center",
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                }}>{index + 1}</td>
                <td style={{ 
                  border: "1px solid #dee2e6", 
                  padding: "clamp(8px, 2vw, 12px)",
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                }}>
                  <input
                    type="text"
                    value={task?.task || ""}
                    onChange={(e) => handleEdit(index, "task", e.target.value)}
                    onBlur={() => handleBlur(task, index)}
                    style={{ 
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      padding: "4px",
                      borderRadius: "3px",
                      fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                      touchAction: 'manipulation'
                    }}
                    placeholder="Enter task..."
                  />
                </td>
                <td style={{ 
                  border: "1px solid #dee2e6", 
                  padding: "clamp(8px, 2vw, 12px)",
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                }}>
                  <input
                    type="date"
                    value={task?.dueDate || ""}
                    onChange={(e) => handleEdit(index, "dueDate", e.target.value)}
                    onBlur={() => handleBlur(task, index)}
                    style={{ 
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      padding: "4px",
                      borderRadius: "3px",
                      fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                      touchAction: 'manipulation'
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Callback component
function Callback() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Auth state:", {
      isLoading: auth.isLoading,
      isAuthenticated: auth.isAuthenticated,
      error: auth.error
    });

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
      <div style={{ padding: "20px", textAlign: "center" }}>
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
