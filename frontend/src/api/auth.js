// Authentication API endpoints
import { apiCall } from './index';

/**
 * Register a new user
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} User data and auth token
 */
export const registerUser = async (name, email, password) => {
  return apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
};

/**
 * Login user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise} User data and auth token
 */
export const loginUser = async (email, password) => {
  const data = await apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Store token for subsequent requests
  if (data.token) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
};

/**
 * Logout user
 * @returns {Promise} Logout confirmation
 */
export const logoutUser = async () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  
  // Optional: Notify backend
  try {
    return await apiCall('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.log('Logout from server failed, but local session cleared');
  }
};

/**
 * Get current user profile
 * @returns {Promise} Current user data
 */
export const getCurrentUser = async () => {
  return apiCall('/api/auth/me', {
    method: 'GET',
  });
};

/**
 * Update user profile
 * @param {object} updates - Profile fields to update (name, email, etc.)
 * @returns {Promise} Updated user data
 */
export const updateUserProfile = async (updates) => {
  return apiCall('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

/**
 * Get stored user from localStorage
 * @returns {object|null} User data or null
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
