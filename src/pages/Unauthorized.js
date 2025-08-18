import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/auth.css';

const Unauthorized = () => {
  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>
      
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="error-icon">⚠️</div>
            <h1 className="auth-title">Access Denied</h1>
            <p className="auth-subtitle">You don't have permission to access this page</p>
          </div>

          <div className="auth-form">
            <Link to="/dashboard" className="auth-button primary">
              Go to Dashboard
            </Link>
            
            <Link to="/login" className="auth-button secondary">
              Back to Login
            </Link>
          </div>

          <div className="auth-footer">
            <p>&copy; 2025 Edge Hill University. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
