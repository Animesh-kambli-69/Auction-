// Base API Configuration
// This file sets up the API client and base URL for all backend calls

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Helper function to make requests with authentication
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  return handleResponse(response);
};

// Helper for file uploads (multipart/form-data)
export const apiCallFormData = async (endpoint, formData, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    ...options,
    headers,
    body: formData,
  });
  
  return handleResponse(response);
};

export default {
  API_BASE_URL,
  apiCall,
  apiCallFormData,
};
