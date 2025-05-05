import React, { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { getTasks, updateTask } from "../../services/apiService";
import DateInput from './DateInput';
import './TaskTable.css';

const TOTAL_ROWS = 20;

const TaskTable = () => {
  const auth = useAuth();
  const [tasks, setTasks] = useState(
    Array(TOTAL_ROWS).fill({ id: null, task: "", dueDate: "" })
  );

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(
          [...Array(TOTAL_ROWS)].map((_, index) =>
            data[index] || { id: null, task: "", dueDate: "" }
          )
        );
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    if (auth.isAuthenticated || localStorage.getItem('anonymousToken')) {
      fetchTasks();
    }
  }, [auth.isAuthenticated]);

  const handleEdit = (index, field, value) => {
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      updatedTasks[index] = { ...updatedTasks[index], [field]: value };
      return updatedTasks;
    });
  };

  const handleBlur = async (task, index) => {
    if (!task.task) return;
    try {
      await updateTask(index, task);
    } catch (err) {
      console.error("Error updating task:", err);
    }
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