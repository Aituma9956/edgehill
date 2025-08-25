import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>
      <div className="auth-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 0 }}>
        <div className="auth-card" style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderRadius: 12,
          background: '#fff',
          padding: '24px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '80vh',
        }}>
          <div style={{ marginBottom: 12 }}>
            <div className="auth-logo" style={{ textAlign: 'center', marginBottom: 0 }}>
              <img 
                src={require('../image/logo.png')} 
                alt="Edge Hill University" 
                className="logo-image"
                style={{ maxWidth: 110, maxHeight: 110 }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="logo-fallback" style={{ display: 'none' }}>
                <div className="logo-circle">EHU</div>
              </div>
            </div>
            <h1 className="auth-title" style={{ fontSize: 22, margin: '0 0 0 0', textAlign: 'center' }}>Welcome Back</h1>
            <p className="auth-subtitle" style={{ fontSize: 15, margin: 0, textAlign: 'center' }}>Sign in to your PGR Management account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" style={{ margin: 0, padding: 0 }}>
            {errors.general && (
              <div className="error-banner" style={{ marginBottom: 8 }}>
                {errors.general}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 6 }}>
              <label htmlFor="username" className="form-label" style={{ fontSize: 14, marginBottom: 0 }}>
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="Enter your username"
                disabled={loading}
                style={{ fontSize: 16, padding: '8px 12px', height: 40 }}
              />
              {errors.username && (
                <span className="error-text" style={{ fontSize: 13 }}>{errors.username}</span>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="password" className="form-label" style={{ fontSize: 14, marginBottom: 2 }}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                disabled={loading}
                style={{ fontSize: 16, padding: '8px 12px', height: 40 }}
              />
              {errors.password && (
                <span className="error-text" style={{ fontSize: 13 }}>{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              className="auth-button primary"
              disabled={loading}
              style={{ width: '100%', height: 36, fontSize: 15, marginBottom: 0 }}
            >
              {loading ? (
                <span className="loading-spinner-inline">Signing in...</span>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="auth-divider" style={{ textAlign: 'center', margin: 0, fontSize: 11, lineHeight: 1 }}>
              <span>Don't have an account?</span>
            </div>

            <Link to="/register" className="auth-button secondary" style={{ width: '100%', height: 34, fontSize: 15, marginTop: 0 }}>
              Create Account
            </Link>
          </form>

          <div className="auth-footer" style={{ textAlign: 'center', fontSize: 12, marginTop: 10 }}>
            <p style={{ margin: 0 }}>&copy; 2025 Edge Hill University. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
