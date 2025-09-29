import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import SupervisorDashboard from './pages/SupervisorDashboard';
import Dashboard from './components/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import GbosAdminDashboard from './pages/GbosAdminDashboard';
import DosDashboard from './pages/Dos';
import Login from './pages/Login';
import Register from './pages/Register';
import './styles/globals.css';
import './styles/shared-dashboard.css';
import GbosApprover from './pages/GbosApprover';  


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
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
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Academic Admin Routes */}
            <Route 
              path="/academic/*" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Student Routes */}
            <Route 
              path="/student/*" 
              element={
                <PrivateRoute>
                  <StudentDashboard />
                </PrivateRoute>
              } 
            />

            {/* GBOS Admin Routes */}
            <Route 
              path="/gbos/*" 
              element={
                <PrivateRoute>
                  <GbosAdminDashboard />
                </PrivateRoute>
              } 
            />
            {/* Dos Admin Routes */}
            <Route 
              path="/Dos/*" 
              element={
                <PrivateRoute>
                  <DosDashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Supervisor Routes */}
            <Route 
              path="/supervisor/*"
              element={
                <PrivateRoute>
                  <SupervisorDashboard />
                </PrivateRoute>
              } 
            />

            {/* GBOS Approver Routes */}
            <Route 
              path="/gbos-approver/*"
              element={
                <PrivateRoute>
                  <GbosApprover />
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
