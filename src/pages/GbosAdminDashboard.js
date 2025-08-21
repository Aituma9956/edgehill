import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/shared-dashboard.css';
import logo from '../image/logo.png';

const GbosAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', iconClass: 'fas fa-chart-pie' },
    { id: 'students', label: 'Student Management', iconClass: 'fas fa-user-graduate' },
    { id: 'registrations', label: 'Registration Review', iconClass: 'fas fa-file-alt' },
    { id: 'submissions', label: 'Submission Review', iconClass: 'fas fa-file-upload' },
    { id: 'reports', label: 'Reports', iconClass: 'fas fa-chart-bar' },
    { id: 'profile', label: 'Profile', iconClass: 'fas fa-cog' }
  ];

  const renderSidebar = () => (
    <>
      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}

      <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo-section">
            <img src={logo} alt="Logo" className="sidebar-logo" />
            <div className="sidebar-branding">
              <p className="sidebar-portal-name">GBOS Admin</p>
            </div>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          {/* Mobile Close Button */}
          <button 
            className="mobile-close"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          {navigationItems.map(item => (
            <div key={item.id} className="nav-item">
              <button
                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileSidebarOpen(false);
                }}
              >
                <i className={item.iconClass}></i>
                <span className="nav-text">{item.label}</span>
              </button>
            </div>
          ))}
        </nav>
        
        {/* Sidebar Footer - User Profile */}
        <div className="sidebar-footer">
          <div className="user-profile" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'G'}
            </div>
            <div className="user-info">
              <p className="user-name">{user?.username}</p>
              <p className="user-role">GBOS Admin</p>
            </div>
            <button className="user-menu-toggle">
              <i className="fas fa-ellipsis-h"></i>
            </button>
          </div>
          
          {/* User Dropdown */}
          <div className={`user-dropdown ${userDropdownOpen ? 'show' : ''}`}>
            <button 
              className="dropdown-item"
              onClick={() => {
                setActiveSection('profile');
                setUserDropdownOpen(false);
                setMobileSidebarOpen(false);
              }}
            >
              <i className="fas fa-user"></i>
              Profile
            </button>
            <button className="dropdown-item" onClick={logout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );

  const renderDashboard = () => (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">GBOS Admin Dashboard</h1>
        <p className="page-subtitle">Welcome, {user?.first_name} {user?.last_name}! Manage postgraduate research operations and student progression.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-value">0</div>
          <div className="stats-label">Total Students</div>
          <div className="stats-icon">🎓</div>
        </div>
        
        <div className="stats-card">
          <div className="stats-value">0</div>
          <div className="stats-label">Pending Registrations</div>
          <div className="stats-icon">⏳</div>
        </div>
        
        <div className="stats-card">
          <div className="stats-value">0</div>
          <div className="stats-label">Active Submissions</div>
          <div className="stats-icon">📄</div>
        </div>
        
        <div className="stats-card">
          <div className="stats-value">0</div>
          <div className="stats-label">Completed Reviews</div>
          <div className="stats-icon">✅</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="content-grid">
        <div className="info-panel">
          <div className="panel-header">
            <h3 className="panel-title">🚀 Quick Actions</h3>
          </div>
          <div className="professional-list">
            <div className="list-item">
              <span className="list-icon">🎓</span>
              <span className="list-text">Review Student Records</span>
              <button 
                className="btn secondary btn-sm"
                onClick={() => setActiveSection('students')}
              >
                Go →
              </button>
            </div>
            <div className="list-item">
              <span className="list-icon">📋</span>
              <span className="list-text">Registration Reviews</span>
              <button 
                className="btn secondary btn-sm"
                onClick={() => setActiveSection('registrations')}
              >
                Go →
              </button>
            </div>
            <div className="list-item">
              <span className="list-icon">📄</span>
              <span className="list-text">Submission Reviews</span>
              <button 
                className="btn secondary btn-sm"
                onClick={() => setActiveSection('submissions')}
              >
                Go →
              </button>
            </div>
            <div className="list-item">
              <span className="list-icon">📊</span>
              <span className="list-text">Generate Reports</span>
              <button 
                className="btn secondary btn-sm"
                onClick={() => setActiveSection('reports')}
              >
                Go →
              </button>
            </div>
          </div>
        </div>

        <div className="info-panel">
          <div className="panel-header">
            <h3 className="panel-title">📋 GBOS Overview</h3>
          </div>
          <div className="professional-list">
            <div className="list-item">
              <span className="list-icon">📈</span>
              <span className="list-text">Registration Status</span>
              <span className="status-badge active">Active</span>
            </div>
            <div className="list-item">
              <span className="list-icon">⏰</span>
              <span className="list-text">Pending Reviews</span>
              <span className="list-value">0</span>
            </div>
            <div className="list-item">
              <span className="list-icon">✅</span>
              <span className="list-text">Completed Today</span>
              <span className="status-badge active">0</span>
            </div>
            <div className="list-item">
              <span className="list-icon">🎯</span>
              <span className="list-text">System Status</span>
              <span className="status-badge active">Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">📚 GBOS Admin Portal</h2>
        </div>
        <div className="card-content">
          <p className="text-secondary">
            This portal provides GBOS administrators with comprehensive tools to manage student registrations, 
            review submissions, and oversee the postgraduate research process. Use the navigation menu to access 
            specific management functions and maintain oversight of academic progress.
          </p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'students':
        return (
          <div className="main-content">
            {/* Page Header */}
            <div className="page-header">
              <h1 className="page-title">Student Management</h1>
              <p className="page-subtitle">View and manage student records and academic progress</p>
            </div>

            {/* Student Overview Cards */}
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Active Students</h3>
                  <div className="card-icon">🎓</div>
                </div>
                <div className="card-content">
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="stat-label">Total Active:</span>
                      <span className="stat-value">0</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">International:</span>
                      <span className="stat-value">0</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Domestic:</span>
                      <span className="stat-value">0</span>
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn secondary">View All Students</button>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Recent Activities</h3>
                  <div className="card-icon">📋</div>
                </div>
                <div className="card-content">
                  <div className="professional-list">
                    <div className="list-item">
                      <span className="list-icon">📝</span>
                      <span className="list-text">New Registrations</span>
                      <span className="status-badge pending">0</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🔄</span>
                      <span className="list-text">Status Updates</span>
                      <span className="status-badge active">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Panel */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2 className="card-title">Student Management Overview</h2>
              </div>
              <div className="card-content">
                <p className="text-secondary">
                  This section provides comprehensive student management capabilities. GBOS administrators can view student records, 
                  track academic progress, and manage student-related administrative tasks. Full functionality will be available soon.
                </p>
              </div>
            </div>
          </div>
        );
      case 'registrations':
        return (
          <div className="main-content">
            {/* Page Header */}
            <div className="page-header">
              <h1 className="page-title">Registration Review</h1>
              <p className="page-subtitle">Review and approve student registration applications</p>
            </div>

            {/* Registration Status Cards */}
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Pending Reviews</h3>
                  <div className="card-icon">⏳</div>
                </div>
                <div className="card-content">
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="stat-label">Awaiting Review:</span>
                      <span className="stat-value">0</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Priority Reviews:</span>
                      <span className="stat-value">0</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Avg. Review Time:</span>
                      <span className="stat-value">2.5 days</span>
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn primary">📋 Start Reviews</button>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Review Statistics</h3>
                  <div className="card-icon">📊</div>
                </div>
                <div className="card-content">
                  <div className="professional-list">
                    <div className="list-item">
                      <span className="list-icon">✅</span>
                      <span className="list-text">Approved This Week</span>
                      <span className="status-badge success">0</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">❌</span>
                      <span className="list-text">Rejected This Week</span>
                      <span className="status-badge danger">0</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🔄</span>
                      <span className="list-text">Returned for Revision</span>
                      <span className="status-badge warning">0</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Recent Actions</h3>
                  <div className="card-icon">🕒</div>
                </div>
                <div className="card-content">
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <div className="empty-state-title">No Recent Activity</div>
                    <div className="empty-state-description">
                      Registration review activities will appear here.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Panel */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2 className="card-title">Registration Review System</h2>
              </div>
              <div className="card-content">
                <p className="text-secondary">
                  The registration review system allows GBOS administrators to efficiently process student registration applications. 
                  Review applications, approve or reject submissions, and track the progress of registration procedures.
                </p>
              </div>
            </div>
          </div>
        );
      case 'submissions':
        return (
          <div className="main-content">
            {/* Page Header */}
            <div className="page-header">
              <h1 className="page-title">Submission Review</h1>
              <p className="page-subtitle">Review and manage student academic submissions</p>
            </div>

            {/* Submission Status Cards */}
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Active Submissions</h3>
                  <div className="card-icon">📄</div>
                </div>
                <div className="card-content">
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="stat-label">Under Review:</span>
                      <span className="stat-value">0</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Awaiting Feedback:</span>
                      <span className="stat-value">0</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Ready for Decision:</span>
                      <span className="stat-value">0</span>
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn primary">📄 Review Submissions</button>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Submission Types</h3>
                  <div className="card-icon">📚</div>
                </div>
                <div className="card-content">
                  <div className="professional-list">
                    <div className="list-item">
                      <span className="list-icon">📋</span>
                      <span className="list-text">Registration Documents</span>
                      <span className="status-badge pending">0</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📈</span>
                      <span className="list-text">Progress Reports</span>
                      <span className="status-badge active">0</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🎓</span>
                      <span className="list-text">Thesis Submissions</span>
                      <span className="status-badge success">0</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Review Timeline</h3>
                  <div className="card-icon">⏰</div>
                </div>
                <div className="card-content">
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="stat-label">Avg. Review Time:</span>
                      <span className="stat-value">5.2 days</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Overdue Reviews:</span>
                      <span className="stat-value">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Panel */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2 className="card-title">Submission Management System</h2>
              </div>
              <div className="card-content">
                <p className="text-secondary">
                  The submission review system enables GBOS administrators to manage and evaluate all types of student submissions. 
                  Track review progress, provide feedback, and ensure timely processing of academic documentation.
                </p>
              </div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="main-content">
            {/* Page Header */}
            <div className="page-header">
              <h1 className="page-title">Reports & Analytics</h1>
              <p className="page-subtitle">Generate comprehensive reports and view system analytics</p>
            </div>

            {/* Reports Grid */}
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Student Reports</h3>
                  <div className="card-icon">🎓</div>
                </div>
                <div className="card-content">
                  <p className="card-description">Generate detailed reports on student enrollment, progress, and completion rates</p>
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="stat-label">Total Students:</span>
                      <span className="stat-value">0</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Active Programs:</span>
                      <span className="stat-value">0</span>
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn secondary">Generate Report</button>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Registration Analytics</h3>
                  <div className="card-icon">📋</div>
                </div>
                <div className="card-content">
                  <p className="card-description">Track registration trends and processing efficiency</p>
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="stat-label">Monthly Applications:</span>
                      <span className="stat-value">0</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Approval Rate:</span>
                      <span className="stat-value">0%</span>
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn secondary">Generate Report</button>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Submission Analytics</h3>
                  <div className="card-icon">📄</div>
                </div>
                <div className="card-content">
                  <p className="card-description">Monitor submission volumes and review performance</p>
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="stat-label">Active Submissions:</span>
                      <span className="stat-value">0</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Avg. Review Time:</span>
                      <span className="stat-value">5.2 days</span>
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn secondary">Generate Report</button>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">System Performance</h3>
                  <div className="card-icon">⚡</div>
                </div>
                <div className="card-content">
                  <p className="card-description">Monitor system usage and performance metrics</p>
                  <div className="stats-list">
                    <div className="stat-item">
                      <span className="stat-label">System Uptime:</span>
                      <span className="stat-value">99.9%</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Active Users:</span>
                      <span className="stat-value">0</span>
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn secondary">Generate Report</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="main-content">
            {/* Page Header */}
            <div className="page-header">
              <h1 className="page-title">Profile Management</h1>
              <p className="page-subtitle">Manage your account settings and preferences</p>
            </div>

            {/* Profile Cards */}
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Account Information</h3>
                  <div className="card-icon">👤</div>
                </div>
                <div className="card-content">
                  <div className="professional-list">
                    <div className="list-item">
                      <span className="list-icon">👤</span>
                      <span className="list-text">Username</span>
                      <span className="list-value">{user?.username}</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📧</span>
                      <span className="list-text">Email</span>
                      <span className="list-value">{user?.email || 'Not provided'}</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🏛️</span>
                      <span className="list-text">Role</span>
                      <span className="status-badge active">GBOS Admin</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📅</span>
                      <span className="list-text">Member Since</span>
                      <span className="list-value">{user?.created_date ? new Date(user.created_date).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn primary">Edit Profile</button>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Security Settings</h3>
                  <div className="card-icon">🔒</div>
                </div>
                <div className="card-content">
                  <div className="professional-list">
                    <div className="list-item">
                      <span className="list-icon">🔑</span>
                      <span className="list-text">Password</span>
                      <span className="list-value">••••••••</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🛡️</span>
                      <span className="list-text">Two-Factor Auth</span>
                      <span className="status-badge warning">Disabled</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🕒</span>
                      <span className="list-text">Last Login</span>
                      <span className="list-value">Today</span>
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn secondary">🔒 Change Password</button>
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h3 className="card-title">Preferences</h3>
                  <div className="card-icon">⚙️</div>
                </div>
                <div className="card-content">
                  <div className="professional-list">
                    <div className="list-item">
                      <span className="list-icon">🌙</span>
                      <span className="list-text">Theme</span>
                      <span className="status-badge active">Light</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">📧</span>
                      <span className="list-text">Email Notifications</span>
                      <span className="status-badge active">Enabled</span>
                    </div>
                    <div className="list-item">
                      <span className="list-icon">🌐</span>
                      <span className="list-text">Language</span>
                      <span className="list-value">English (UK)</span>
                    </div>
                  </div>
                </div>
                <div className="card-actions">
                  <button className="btn secondary">Configure</button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Hamburger Button */}
      <button 
        className="mobile-hamburger"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open menu"
      >
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </button>

      {renderSidebar()}
      
      <main className="dashboard-main">
        {/* Main Header */}
        <div className="main-header">
          <h1 className="header-title">
            {activeSection === 'dashboard' && 'GBOS Admin Dashboard'}
            {activeSection === 'students' && 'Student Management'}
            {activeSection === 'registrations' && 'Registration Review'}
            {activeSection === 'submissions' && 'Submission Review'}
            {activeSection === 'reports' && 'Reports'}
            {activeSection === 'profile' && 'Profile'}
          </h1>
          <div className="header-actions">
            <span>Welcome, {user?.username}</span>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="main-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default GbosAdminDashboard;
