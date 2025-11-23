import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';


const AuthContext = createContext();


export const AuthProvider = ({ children }) => {

  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate(); 
 
  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    navigate('/'); 
  };

 
  const logout = () => {
    setToken(null);
    localStorage.removeItem('token'); 
    navigate('/login'); 
  };

  
  const value = {
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const useAuth = () => {
  return useContext(AuthContext);
};
