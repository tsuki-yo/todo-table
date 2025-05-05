import axios from 'axios';
import { getAnonymousTokenFromStorage } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

const getAuthHeader = () => {
  const anonymousToken = getAnonymousTokenFromStorage();
  if (anonymousToken) {
    return `Anonymous ${anonymousToken}`;
  }
  return null;
};

export const getTasks = async () => {
  const authHeader = getAuthHeader();
  const headers = authHeader ? { Authorization: authHeader } : {};
  const response = await axios.get(`${API_URL}/tasks`, { headers });
  return response.data;
};

export const createTask = async (task) => {
  const authHeader = getAuthHeader();
  const headers = authHeader ? { Authorization: authHeader } : {};
  const response = await axios.post(`${API_URL}/tasks`, task, { headers });
  return response.data;
};

export const updateTask = async (id, task) => {
  const authHeader = getAuthHeader();
  const headers = authHeader ? { Authorization: authHeader } : {};
  const response = await axios.put(`${API_URL}/tasks/${id}`, task, { headers });
  return response.data;
}; 