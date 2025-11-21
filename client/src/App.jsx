import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

// Import our pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';

// This is our "Security Guard" component
// It checks if the user is logged in before
// letting them see the "children" (the protected page)
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth(); // Listen to the "broadcast"
  if (!token) {
    // If no "ID card" (token), send them to the /login page
    return <Navigate to="/login" />;
  }
  return children; // If they have a token, show them the page
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

// This is the main App component
function App() {
  return (
    // We wrap AppContent in AuthProvider
    // so all components inside it
    // can "listen" to our auth broadcast
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;