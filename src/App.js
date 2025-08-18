import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './components/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            
            {/* System Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <PrivateRoute requiredRole="system_admin">
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Academic Admin Routes */}
            <Route 
              path="/academic/*" 
              element={
                <PrivateRoute requiredRole="academic_admin">
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Student Routes */}
            <Route 
              path="/student/*" 
              element={
                <PrivateRoute requiredRole="student">
                  <StudentDashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
