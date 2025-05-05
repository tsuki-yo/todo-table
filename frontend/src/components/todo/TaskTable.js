import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "react-oidc-context";
import DateInput from './DateInput';
import { isPastDue } from '../../utils/dateUtils';
import './TaskTable.css';
import { useNavigate } from 'react-router-dom';

const API_URL = "https://todo-app.natsuki-cloud.dev/tasks";
const TOTAL_ROWS = 20;

const TaskTable = () => {
  const auth = useAuth();
  const [tasks, setTasks] = useState(
    Array(TOTAL_ROWS).fill({ id: null, task: "", dueDate: "" })
  );
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login');
      return;
    }

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
      .catch((err) => console.error("Error fetching tasks:", err))
      .finally(() => setIsLoading(false));
  }, [auth.isAuthenticated, auth.user]);

  const handleEdit = (task) => {
    setEditingTask(task);
  };

  const handleSave = () => {
    axios
      .put(`${API_URL}/${editingTask.id}`, editingTask, {
        headers: { Authorization: `Bearer ${auth.user?.access_token}` },
      })
      .then((res) => {
        setTasks(tasks.map(task => task.id === res.data.id ? res.data : task));
        setEditingTask(null);
      })
      .catch((err) => console.error("Error updating task:", err));
  };

  const handleCancel = () => {
    setEditingTask(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e) => {
    const { value } = e.target;
    setEditingTask(prev => ({
      ...prev,
      dueDate: value
    }));
  };

  const handleDateBlur = (e) => {
    const { value } = e.target;
    if (!value) {
      setEditingTask(prev => ({
        ...prev,
        dueDate: null
      }));
    }
  };

  const handleBlur = (task, index) => {
    if (!task.task) return;
    axios
      .put(`${API_URL}/${index}`, task, {
        headers: { Authorization: `Bearer ${auth.user?.access_token}` },
      })
      .catch((err) => console.error("Error updating task:", err));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="task-table-container">
      <h2 className="task-table-title">Todo List</h2>
      <table className="task-table">
        <thead>
          <tr className="table-header">
            <th>#</th>
            <th>Item Name</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr key={index}>
              <td className="table-cell text-center">{index + 1}</td>
              <td className="table-cell">
                {editingTask?.id === task.id ? (
                  <input
                    type="text"
                    name="task"
                    value={editingTask.task}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur(task, index)}
                    className="task-input"
                    placeholder="Enter task..."
                  />
                ) : (
                  task.task
                )}
              </td>
              <td className="table-cell">
                {editingTask?.id === task.id ? (
                  <DateInput
                    value={editingTask.dueDate || ''}
                    onChange={handleDateChange}
                    onBlur={handleDateBlur}
                    isPastDue={isPastDue(editingTask.dueDate)}
                  />
                ) : (
                  <DateInput
                    value={task.dueDate || ''}
                    onChange={() => {}}
                    onBlur={() => {}}
                    isPastDue={isPastDue(task.dueDate)}
                  />
                )}
              </td>
              <td className="table-cell">
                {editingTask?.id === task.id ? (
                  <>
                    <button onClick={handleSave} className="save-button">
                      Save
                    </button>
                    <button onClick={handleCancel} className="cancel-button">
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleEdit(task)} className="edit-button">
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable; 