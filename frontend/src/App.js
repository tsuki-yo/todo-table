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
    const logoutUri = "https://todo-app.natsuki-cloud.dev"; // Your logout redirect URI
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
      <div>
        <button onClick={() => auth.signinRedirect()}>Sign in</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
      <div>
        <pre>Hello: {auth.user?.profile.email}</pre>
        <pre>ID Token: {auth.user?.id_token}</pre>
        <pre>Access Token: {auth.user?.access_token}</pre>
        <pre>Refresh Token: {auth.user?.refresh_token}</pre>
        <button onClick={() => auth.removeUser()}>Sign out</button>
        <button onClick={signOutRedirect}>Sign out (redirect)</button>
      </div>
      <h2>Todo List</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ background: "#f4f4f4" }}>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>#</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Item Name</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{index + 1}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <input
                  type="text"
                  value={task?.task || ""}
                  onChange={(e) => handleEdit(index, "task", e.target.value)}
                  onBlur={() => handleBlur(task, index)}
                  style={{ width: "100%", border: "none", background: "transparent" }}
                />
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <input
                  type="date"
                  value={task?.dueDate || ""}
                  onChange={(e) => handleEdit(index, "dueDate", e.target.value)}
                  onBlur={() => handleBlur(task, index)}
                  style={{ width: "100%", border: "none", background: "transparent" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
