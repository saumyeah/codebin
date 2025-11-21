import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Create the "Context" (the announcement system)
const AuthContext = createContext();

// 2. Create the "Provider" (the broadcaster)
// This component will wrap our app and "provide" the auth info
export const AuthProvider = ({ children }) => {
  // Get token from "localStorage" (the browser's small storage box)
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate(); // Get the "GPS" to move between pages

  // Call this function when we log in
  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken); // Save token to browser
    navigate('/'); // Go to the dashboard
  };

  // Call this function when we log out
  const logout = () => {
    setToken(null);
    localStorage.removeItem('token'); // Remove token from browser
    navigate('/login'); // Go to the login page
  };

  // The 'value' is what we "broadcast" to our app
  const value = {
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Create a helper "hook" to easily listen to the broadcast
export const useAuth = () => {
  return useContext(AuthContext);
};