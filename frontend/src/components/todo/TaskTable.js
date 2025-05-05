import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "react-oidc-context";
import DateInput from './DateInput';
import './TaskTable.css';

const API_URL = "https://todo-app.natsuki-cloud.dev/tasks";
const TOTAL_ROWS = 20;

const TaskTable = () => {
  const auth = useAuth();
  const [tasks, setTasks] = useState(
    Array(TOTAL_ROWS).fill({ id: null, task: "", dueDate: "" })
  );

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

  const isPastDue = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Reset time part for accurate date comparison
    const dueDate = new Date(dateString);
    return dueDate < today;
  };

  return (
    <div className="task-table-container">
      <h2 className="task-table-title">Todo List</h2>
      <table className="task-table">
        <thead>
          <tr className="table-header">
            <th>#</th>
            <th>Item Name</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr key={index}>
              <td className="table-cell text-center">{index + 1}</td>
              <td className="table-cell">
                <input
                  type="text"
                  value={task?.task || ""}
                  onChange={(e) => handleEdit(index, "task", e.target.value)}
                  onBlur={() => handleBlur(task, index)}
                  className="task-input"
                  placeholder="Enter task..."
                />
              </td>
              <td className="table-cell">
                <DateInput
                  value={task?.dueDate || ""}
                  onChange={(e) => handleEdit(index, "dueDate", e.target.value)}
                  onBlur={() => handleBlur(task, index)}
                  isPastDue={isPastDue(task?.dueDate)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable; 