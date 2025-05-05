import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

export const getAnonymousToken = async () => {
  try {
    const response = await axios.post(`${API_URL}/anonymous`);
    return response.data.anonymousId;
  } catch (error) {
    console.error('Error getting anonymous token:', error);
    throw error;
  }
};

export const setAnonymousToken = (anonymousId) => {
  localStorage.setItem('anonymousToken', anonymousId);
};

export const getAnonymousTokenFromStorage = () => {
  return localStorage.getItem('anonymousToken');
};

export const removeAnonymousToken = () => {
  localStorage.removeItem('anonymousToken');
}; 