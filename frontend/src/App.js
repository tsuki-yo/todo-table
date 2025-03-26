import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "react-oidc-context";

const API_URL = "https://todo-app.natsuki-cloud.dev/tasks";
const TOTAL_ROWS = 20; // Fixed number of rows

function App() {
  const auth = useAuth();
  const [tasks, setTasks] = useState(
    Array(TOTAL_ROWS).fill({ id: null, task: "", dueDate: "" })
  );

  // Function for sign-out redirect (if using a custom redirect)
  const signOutRedirect = () => {
    const clientId = "3tdd1ec5am5tci65s7tdkofpv4";
    const logoutUri = "<logout uri>";
    const cognitoDomain = "https://<user pool domain>";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  // Fetch tasks only when the user is authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      axios
        .get(API_URL)
        .then((res) => {
          setTasks(
            [...Array(TOTAL_ROWS)].map((_, index) =>
              res.data[index] || { id: null, task: "", dueDate: "" }
            )
          );
        })
        .catch((err) => console.error("Error fetching tasks:", err));
    }
  }, [auth.isAuthenticated]);

  const handleEdit = (index, field, value) => {
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      updatedTasks[index] = { ...updatedTasks[index], [field]: value };
      return updatedTasks;
    });
  };

  const handleBlur = (task, index) => {
    if (!task.task) return; // Skip empty rows

    axios
      .put(`${API_URL}/${index}`, task)
      .catch((err) => console.error("Error updating task:", err));
  };

  // Conditional rendering based on authentication state
  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Error: {auth.error.message}</div>;
  }

  if (!auth.isAuthenticated) {
    return (
      <div>
        <button onClick={() => auth.signinRedirect()}>Sign in</button>
      </div>
    );
  }

  // When authenticated, display user info and the tasks table
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
          {[...Array(TOTAL_ROWS)].map((_, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>{index + 1}</td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <input
                  type="text"
                  value={tasks[index]?.task || ""}
                  onChange={(e) => handleEdit(index, "task", e.target.value)}
                  onBlur={() => handleBlur(tasks[index], index)}
                  style={{ width: "100%", border: "none", background: "transparent" }}
                />
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                <input
                  type="date"
                  value={tasks[index]?.dueDate || ""}
                  onChange={(e) => handleEdit(index, "dueDate", e.target.value)}
                  onBlur={() => handleBlur(tasks[index], index)}
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

export default App;
