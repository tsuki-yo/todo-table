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
  const [newTaskInput, setNewTaskInput] = useState("");
  const isGuestUser = localStorage.getItem('authType') === 'guest';

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
    if (isGuestUser) return; // Don't save for guest users
    
    axios
      .put(`${API_URL}/${index}`, task, {
        headers: { Authorization: `Bearer ${auth.user?.access_token}` },
      })
      .catch((err) => console.error("Error updating task:", err));
  };

  const handleAddTask = async () => {
    if (!newTaskInput.trim()) return;

    if (isGuestUser) {
      // For guest users, use backend AI processing but don't save to server
      try {
        const guestToken = localStorage.getItem('guestToken');
        const response = await axios.post(`${API_URL}/process`, 
          { input: newTaskInput },
          {
            headers: { Authorization: `Bearer ${guestToken}` },
          }
        );
        
        const processedTask = response.data;
        const firstEmptyIndex = tasks.findIndex(task => !task.task);
        if (firstEmptyIndex !== -1) {
          setTasks((prevTasks) => {
            const updatedTasks = [...prevTasks];
            updatedTasks[firstEmptyIndex] = {
              id: firstEmptyIndex.toString(),
              task: processedTask.task,
              dueDate: processedTask.dueDate
            };
            return updatedTasks;
          });
        }
      } catch (aiError) {
        console.log("AI service unavailable for guest, using fallback:", aiError.message);
        // Fallback: add raw text without processing
        const firstEmptyIndex = tasks.findIndex(task => !task.task);
        if (firstEmptyIndex !== -1) {
          setTasks((prevTasks) => {
            const updatedTasks = [...prevTasks];
            updatedTasks[firstEmptyIndex] = {
              id: firstEmptyIndex.toString(),
              task: newTaskInput.trim(),
              dueDate: ""
            };
            return updatedTasks;
          });
        }
      }
      setNewTaskInput("");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/process`, 
        { input: newTaskInput },
        {
          headers: { Authorization: `Bearer ${auth.user?.access_token}` },
        }
      );

      // Update the tasks state with the new task
      const newTask = response.data;
      setTasks((prevTasks) => {
        const updatedTasks = [...prevTasks];
        updatedTasks[parseInt(newTask.id)] = {
          id: newTask.id,
          task: newTask.task,
          dueDate: newTask.dueDate
        };
        return updatedTasks;
      });

      // Clear the input
      setNewTaskInput("");
    } catch (err) {
      console.error("Error adding task:", err);
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
      <div className="new-task-input-container">
        <input
          type="text"
          value={newTaskInput}
          onChange={(e) => setNewTaskInput(e.target.value)}
          placeholder="Add a new task..."
          className="new-task-input"
        />
        <button 
          className="add-task-button"
          onClick={handleAddTask}
        >
          Add
        </button>
      </div>
      <table className="task-table">
        <thead>
          <tr className="table-header">
            <th>#</th>
            <th>✓</th>
            <th>Item Name</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, index) => (
            <tr key={index}>
              <td className="table-cell text-center">{index + 1}</td>
              <td className="table-cell text-center">
                <input
                  type="checkbox"
                  checked={!!task.completed}
                  onChange={e => {
                    handleEdit(index, "completed", e.target.checked);
                    handleBlur({ ...task, completed: e.target.checked }, index);
                  }}
                />
              </td>
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