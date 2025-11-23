import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';


const ProtectedRoute = ({ children }) => {
  const { token } = useAuth(); 
  if (!token) {
    
    return <Navigate to="/login" />;
  }
  return children; 
};


// This component holds the actual app content
function AppContent() {
  return (
    <div className="App">
      <Routes> {/* The main "GPS" router */}
        {/* === Public Routes === */}
        {/* These pages are always visible */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* === Protected Routes === */}
        {/* These pages are wrapped by our "Security Guard" */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/editor/:snippetId" 
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}


function App() {
  return (
    
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
