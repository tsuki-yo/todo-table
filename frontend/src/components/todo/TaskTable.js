import React from 'react';
import axios from 'axios';
import { useAuth } from "react-oidc-context";
import DateInput from './DateInput';
import '../../styles/base.css';

const API_URL = "https://todo-app.natsuki-cloud.dev/tasks";
const TOTAL_ROWS = 20;

const TaskTable = () => {
  const auth = useAuth();
  const [tasks, setTasks] = React.useState(
    Array(TOTAL_ROWS).fill({ id: null, task: "", dueDate: "" })
  );

  React.useEffect(() => {
    if (auth.isAuthenticated) {
      console.log('Auth user profile:', auth.user?.profile);
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

  return (
    <div className="card task-table-container">
      <h2 className="task-table-title">Todo List</h2>
      <table className="task-table">
        <thead>
          <tr className="table-header">
            <th className="table-cell">#</th>
            <th className="table-cell">Item Name</th>
            <th className="table-cell">Due Date</th>
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
                  isPastDue={task?.dueDate === '2024-04-25'}
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