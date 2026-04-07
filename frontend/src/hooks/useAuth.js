// src/hooks/useAuth.js - Authentication Hook

import { useContext } from 'react';
import { AuthContext } from '../components/nav bar/nav';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default useAuth;
