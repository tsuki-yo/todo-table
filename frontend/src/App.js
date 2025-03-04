import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://todo-app.natsuki-cloud.dev/tasks";
const TOTAL_ROWS = 20; // Fixed number of rows

function App() {
  const [tasks, setTasks] = useState(Array(TOTAL_ROWS).fill({ id: null, task: "", dueDate: "" }));

  useEffect(() => {
    axios.get(API_URL)
      .then((res) => {
        setTasks(() =>
          [...Array(TOTAL_ROWS)].map((_, index) =>
            res.data[index] || { id: null, task: "", dueDate: "" }
          )
        );
      })
      .catch((err) => console.error("Error fetching tasks:", err));
  }, []);

  const handleEdit = (index, field, value) => {
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      updatedTasks[index] = { ...updatedTasks[index], [field]: value };
      return updatedTasks;
    });
  };

  const handleBlur = (task, index) => {
    if (!task.task) return; // Skip empty rows

    axios.put(`${API_URL}/${index}`, task)
      .catch((err) => console.error("Error updating task:", err));
  };

  return (
    <div style={{ padding: "20px", textAlign: "center", fontFamily: "Arial, sans-serif" }}>
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

