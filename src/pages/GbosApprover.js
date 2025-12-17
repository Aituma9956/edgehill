import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { vivaTeamAPI, vivaAPI, submissionAPI } from '../utils/api';
import '../styles/shared-dashboard.css';
import logo from '../image/logo.png';

// Utility function to extract error messages safely
const extractErrorMessage = (error, defaultMessage) => {
  if (error.response?.data?.detail) {
    if (Array.isArray(error.response.data.detail)) {
      // Handle array of validation errors
      return error.response.data.detail
        .map(err => err.msg || err.message || String(err))
        .join(', ');
    } else if (typeof error.response.data.detail === 'string') {
      // Handle string error message
      return error.response.data.detail;
    } else {
      // Handle object error
      return error.response.data.detail.message || 
             error.response.data.detail.msg || 
             String(error.response.data.detail);
    }
  } else if (error.message) {
    return error.message;
  }
  return defaultMessage;
};

const GbosApprover = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // Viva Team management state
  const [vivaTeams, setVivaTeams] = useState([]);
  const [vivaTeamsLoading, setVivaTeamsLoading] = useState(false);
  const [vivaTeamsError, setVivaTeamsError] = useState('');
  const [selectedVivaTeam, setSelectedVivaTeam] = useState(null);
  const [showVivaTeamDetailModal, setShowVivaTeamDetailModal] = useState(false);
  const [vivaTeamSearch, setVivaTeamSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [vivaTeamStatusFilter, setVivaTeamStatusFilter] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Viva management state
  const [vivas, setVivas] = useState([]);
  const [vivasLoading, setVivasLoading] = useState(false);
  const [vivasError, setVivasError] = useState('');
  const [selectedViva, setSelectedViva] = useState(null);
  const [showVivaDetailModal, setShowVivaDetailModal] = useState(false);
  const [showVivaOutcomeModal, setShowVivaOutcomeModal] = useState(false);
  const [vivaSearchTerm, setVivaSearchTerm] = useState('');
  const [vivaStageFilter, setVivaStageFilter] = useState('');
  const [vivaOutcomes, setVivaOutcomes] = useState([]);
  const [studentVivaTeams, setStudentVivaTeams] = useState([]);
  const [showStudentVivaTeamsModal, setShowStudentVivaTeamsModal] = useState(false);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  const [showStudentSubmissionsModal, setShowStudentSubmissionsModal] = useState(false);
  
  // Dropdown for actions
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Dashboard stats state
  const [stats, setStats] = useState({
    totalVivaTeams: 0,
    pendingApprovals: 0,
    approvedTeams: 0,
    completedVivas: 0
  });

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', iconClass: 'fas fa-chart-pie' },
    { id: 'viva-teams', label: 'Viva Teams', icon: '🎯', iconClass: 'fas fa-bullseye' },
    { id: 'viva', label: 'Viva', icon: '🎓', iconClass: 'fas fa-graduation-cap' }
  ];

  useEffect(() => {
    if (activeSection === 'viva-teams') {
      fetchVivaTeams();
    } else if (activeSection === 'viva') {
      fetchVivas();
    } else if (activeSection === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeSection]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch functions
  const fetchVivaTeams = async () => {
    try {
      setVivaTeamsLoading(true);
      setVivaTeamsError('');
      
      const data = await vivaTeamAPI.getAllVivaTeams(0, 100, vivaTeamSearch, stageFilter, vivaTeamStatusFilter);
      setVivaTeams(data);
    } catch (error) {
      console.error('Error fetching viva teams:', error);
      setVivaTeamsError(`Failed to fetch viva teams: ${extractErrorMessage(error, 'Failed to fetch viva teams')}`);
    } finally {
      setVivaTeamsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch viva teams for dashboard stats
      const vivaTeamsData = await vivaTeamAPI.getAllVivaTeams(0, 1000);
      
      // Calculate viva team stats
      const vivaStats = {
        totalVivaTeams: vivaTeamsData.length,
        pendingApprovals: vivaTeamsData.filter(vt => vt.status === 'proposed').length,
        approvedTeams: vivaTeamsData.filter(vt => vt.status === 'approved').length,
        completedVivas: vivaTeamsData.filter(vt => vt.status === 'completed').length
      };
      
      setStats(vivaStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchVivas = async () => {
    try {
      setVivasLoading(true);
      setVivasError('');
      
      const data = await vivaAPI.getAllVivas(0, 100, vivaSearchTerm, vivaStageFilter);
      setVivas(data);
    } catch (error) {
      console.error('Error fetching vivas:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to fetch vivas');
      setVivasError(`Failed to fetch vivas: ${errorMessage}`);
    } finally {
      setVivasLoading(false);
    }
  };

  // Viva Team management functions
  const handleApproveVivaTeam = async (vivaTeamId) => {
    try {
      await vivaTeamAPI.approveVivaTeam(vivaTeamId);
      fetchVivaTeams(); // Refresh list
    } catch (error) {
      console.error('Error approving viva team:', error);
      setVivaTeamsError(`Failed to approve viva team: ${extractErrorMessage(error, 'Failed to approve viva team')}`);
    }
  };

  const handleRejectVivaTeam = async (vivaTeamId, reason) => {
    try {
      await vivaTeamAPI.rejectVivaTeam(vivaTeamId, { reason });
      fetchVivaTeams(); // Refresh list
      setShowRejectModal(false);
      setSelectedVivaTeam(null);
    } catch (error) {
      console.error('Error rejecting viva team:', error);
      throw error;
    }
  };

  const handleScheduleViva = async (vivaTeamId, scheduleData) => {
    try {
      await vivaTeamAPI.scheduleViva(vivaTeamId, scheduleData);
      fetchVivaTeams(); // Refresh list
      setShowScheduleModal(false);
      setSelectedVivaTeam(null);
    } catch (error) {
      console.error('Error scheduling viva:', error);
      throw error;
    }
  };

  const handleRecordOutcome = async (vivaTeamId, outcomeData) => {
    try {
      await vivaTeamAPI.recordOutcome(vivaTeamId, outcomeData);
      fetchVivaTeams(); // Refresh list
      setShowOutcomeModal(false);
      setSelectedVivaTeam(null);
    } catch (error) {
      console.error('Error recording outcome:', error);
      throw error;
    }
  };

  // Render functions
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
              <p className="sidebar-portal-name">GBOS Approver</p>
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
                {item.id === 'dashboard' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {item.id === 'viva-teams' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {item.id === 'viva' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 10V15C22 16.1046 21.1046 17 20 17H4C2.89543 17 2 16.1046 2 15V10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 17L7 21" stroke="currentColor" strokeWidth="2"/>
                    <path d="M17 17L17 21" stroke="currentColor" strokeWidth="2"/>
                    <path d="M22 5L12 13L2 5L12 2L22 5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    <circle cx="12" cy="9" r="1.5" fill="currentColor"/>
                  </svg>
                )}
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
              <p className="user-role">GBOS Approver</p>
            </div>
            <button className="user-menu-toggle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
          </div>
          
          {/* User Dropdown */}
          <div className={`user-dropdown ${userDropdownOpen ? 'show' : ''}`}>
            <button className="dropdown-item" onClick={logout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/>
              </svg>
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
        <h1 className="page-title">GBOS Approver Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.username}! Manage viva team approvals and examinations.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-value">{stats.totalVivaTeams}</div>
          <div className="stats-label">Total Viva Teams</div>
          <div className="stats-icon">🎯</div>
        </div>
        <div className="stats-card">
          <div className="stats-value">{stats.pendingApprovals}</div>
          <div className="stats-label">Pending Approvals</div>
          <div className="stats-icon">⏳</div>
        </div>
        <div className="stats-card">
          <div className="stats-value">{stats.approvedTeams}</div>
          <div className="stats-label">Approved Teams</div>
          <div className="stats-icon">✅</div>
        </div>
        <div className="stats-card">
          <div className="stats-value">{stats.completedVivas}</div>
          <div className="stats-label">Completed Vivas</div>
          <div className="stats-icon">🎓</div>
        </div>
      </div>
      
      {/* Quick Actions */}
      
      {/* Recent Activity */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Recent Viva Teams</h2>
          <p className="card-subtitle">Latest viva team proposals and updates</p>
        </div>
        <div className="recent-activity">
          {Array.isArray(vivaTeams) && vivaTeams.slice(0, 5).map(vivaTeam => (
            <div key={vivaTeam.id} className="activity-item">
              <div className="activity-icon">
                {vivaTeam.status === 'proposed' ? '📋' :
                 vivaTeam.status === 'approved' ? '✅' :
                 vivaTeam.status === 'rejected' ? '❌' :
                 vivaTeam.status === 'scheduled' ? '📅' :
                 vivaTeam.status === 'completed' ? '🎓' : '🎯'}
              </div>
              <div className="activity-content">
                <div className="activity-title">
                  Viva Team #{vivaTeam.id} - {vivaTeam.student_number}
                </div>
                <div className="activity-description">
                  Stage: {vivaTeam.stage} | Status: 
                  <span className={`status-badge ${vivaTeam.status}`}>
                    {vivaTeam.status.charAt(0).toUpperCase() + vivaTeam.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="activity-date">
                {vivaTeam.proposed_date ? new Date(vivaTeam.proposed_date).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          ))}
          {(!Array.isArray(vivaTeams) || vivaTeams.length === 0) && (
            <div className="no-activity">
              <p>No recent viva team activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVivaTeamManagement = () => (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Viva Team Management</h1>
        <p className="page-subtitle">Manage examination teams, approvals, and viva scheduling</p>
      </div>

      {/* Search Section */}
      <div className="search-filter-section">
        <div className="form-group">
          <label className="form-label">Search by Student Number</label>
          <input
            type="text"
            placeholder="Enter student number..."
            value={vivaTeamSearch}
            onChange={(e) => setVivaTeamSearch(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group button-shift">
          <button 
            onClick={fetchVivaTeams} 
            className="btn secondary"
          >
            🔍 Search
          </button>
        </div>
        <div className="form-group">
          <label className="form-label">Filter by Stage</label>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="form-input"
          >
            <option value="">All Stages</option>
            <option value="registration">Registration</option>
            <option value="progression">Progression</option>
            <option value="final">Final</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Filter by Status</label>
          <select
            value={vivaTeamStatusFilter}
            onChange={(e) => setVivaTeamStatusFilter(e.target.value)}
            className="form-input"
          >
            <option value="">All Statuses</option>
            <option value="proposed">Proposed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {vivaTeamsError && (
        <div className="alert alert-error">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">{vivaTeamsError}</div>
        </div>
      )}

      {/* Viva Teams Table */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Viva Teams</h2>
          <span className="card-subtitle">{Array.isArray(vivaTeams) ? vivaTeams.length : 0} teams found</span>
        </div>
        {vivaTeamsLoading ? (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading viva teams...</div>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Team ID</th>
                  <th>Student Number</th>
                  <th>Stage & Status</th>
                  <th>Examiners</th>
                  <th>Dates</th>
                  <th>Location & Outcome</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(vivaTeams) && vivaTeams.map(vivaTeam => (
                  <tr key={vivaTeam.id}>
                    <td><strong>#{vivaTeam.id}</strong></td>
                    <td>{vivaTeam.student_number}</td>
                    <td>
                      <div className="stage-status-info">
                        <div className="stage-info">
                          <span className={`status-badge stage-${vivaTeam.stage}`}>
                            {vivaTeam.stage.charAt(0).toUpperCase() + vivaTeam.stage.slice(1)}
                          </span>
                        </div>
                        <div className="status-info">
                          <span className={`status-badge ${vivaTeam.status}`}>
                            {vivaTeam.status === 'proposed' ? '📋 Proposed' :
                             vivaTeam.status === 'approved' ? '✅ Approved' :
                             vivaTeam.status === 'rejected' ? '❌ Rejected' :
                             vivaTeam.status === 'scheduled' ? '📅 Scheduled' :
                             vivaTeam.status === 'completed' ? '🎓 Completed' :
                             vivaTeam.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="examiners-cell">
                      <div className="examiners-list">
                        <div className="examiner-item">
                          <span className="examiner-label">Supervisor 1 ID:</span>
                          <span className="examiner-name">{vivaTeam.internal_examiner_1_id || 'N/A'}</span>
                        </div>
                        <div className="examiner-item">
                          <span className="examiner-label">Supervisor 2 ID:</span>
                          <span className="examiner-name">{vivaTeam.internal_examiner_2_id || 'N/A'}</span>
                        </div>
                        <div className="examiner-item">
                          <span className="examiner-label">External Examiner:</span>
                          <span className="examiner-name">{vivaTeam.external_examiner_name || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="dates-info">
                        <div className="proposed-date">
                          <strong>Proposed:</strong> {vivaTeam.proposed_date ? new Date(vivaTeam.proposed_date).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="scheduled-date">
                          <strong>Scheduled:</strong> {vivaTeam.scheduled_date ? new Date(vivaTeam.scheduled_date).toLocaleDateString() : 'Not Scheduled'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="location-outcome-info">
                        <div className="location-info">
                          <strong>Location:</strong> {vivaTeam.location || 'TBD'}
                        </div>
                        <div className="outcome-info">
                          <strong>Outcome:</strong> {
                            vivaTeam.outcome ? (
                              <span className={`status-badge outcome-${vivaTeam.outcome.toLowerCase()}`}>
                                {vivaTeam.outcome}
                              </span>
                            ) : 'Pending'
                          }
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="action-dropdown-wrapper">
                        <button
                          className="hamburger-btn"
                          onClick={() => setOpenDropdown(openDropdown === vivaTeam.id ? null : vivaTeam.id)}
                          title="Actions"
                        >
                          <span className="hamburger-icon">&#9776;</span>
                        </button>
                        {openDropdown === vivaTeam.id && (
                          <div className="action-dropdown-row">
                            <button
                              onClick={() => {
                                setSelectedVivaTeam(vivaTeam);
                                setShowVivaTeamDetailModal(true);
                                setOpenDropdown(null);
                              }}
                              className="dropdown-btn secondary btn-sm"
                              title="View Details"
                            >
                              View
                            </button>
                            {vivaTeam.status === 'proposed' && (
                              <>
                                <button
                                  onClick={() => {
                                    handleApproveVivaTeam(vivaTeam.id);
                                    setOpenDropdown(null);
                                  }}
                                  className="dropdown-btn primary btn-sm"
                                  title="Approve Team"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedVivaTeam(vivaTeam);
                                    setShowRejectModal(true);
                                    setOpenDropdown(null);
                                  }}
                                  className="dropdown-btn danger btn-sm"
                                  title="Reject Team"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {vivaTeam.status === 'approved' && (
                              <button
                                onClick={() => {
                                  setSelectedVivaTeam(vivaTeam);
                                  setShowScheduleModal(true);
                                  setOpenDropdown(null);
                                }}
                                className="dropdown-btn primary btn-sm"
                                title="Schedule Viva"
                              >
                                Schedule
                              </button>
                            )}
                            {vivaTeam.status === 'scheduled' && (
                              <button
                                onClick={() => {
                                  setSelectedVivaTeam(vivaTeam);
                                  setShowOutcomeModal(true);
                                  setOpenDropdown(null);
                                }}
                                className="dropdown-btn success btn-sm"
                                title="Record Outcome"
                              >
                                Record Outcome
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(!Array.isArray(vivaTeams) || vivaTeams.length === 0) && !vivaTeamsLoading && (
          <div className="no-data">
            <div className="no-data-icon">🎯</div>
            <div className="no-data-message">No viva teams found</div>
            <div className="no-data-description">
              {vivaTeamSearch || stageFilter || vivaTeamStatusFilter 
                ? 'Try adjusting your search filters to see more results.'
                : 'No viva teams have been proposed yet.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render Viva Management Section (Read-only for GBOS Approver)
  const renderVivaManagement = () => (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Viva Management</h1>
        <p className="page-subtitle">View and confirm vivas for students</p>
      </div>

      {/* Search Section */}
      <div className="search-filter-section">
        <div className="form-group">
          <label className="form-label">Search by Student Number</label>
          <input
            type="text"
            placeholder="Enter student number..."
            value={vivaSearchTerm}
            onChange={(e) => setVivaSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group button-shift">
          <button 
            onClick={fetchVivas} 
            className="btn secondary"
          >
            🔍 Search
          </button>
        </div>
        <div className="form-group">
          <label className="form-label">Filter by Stage</label>
          <select
            value={vivaStageFilter}
            onChange={(e) => setVivaStageFilter(e.target.value)}
            className="form-input"
          >
            <option value="">All Stages</option>
            <option value="registration">Registration</option>
            <option value="progression">Progression</option>
            <option value="final">Final</option>
          </select>
        </div>
      </div>

      {vivasError && (
        <div className="alert alert-error">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">{vivasError}</div>
        </div>
      )}

      {/* Vivas Table */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Vivas</h2>
          <span className="card-subtitle">{Array.isArray(vivas) ? vivas.length : 0} vivas found</span>
        </div>
        {vivasLoading ? (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading vivas...</div>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Viva ID</th>
                  <th>Student Number</th>
                  <th>Stage & Type</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(vivas) && vivas.length > 0 ? vivas.map(viva => (
                  <tr key={viva.viva_id}>
                    <td><strong>#{viva.viva_id}</strong></td>
                    <td>{viva.student_number}</td>
                    <td>
                      <div className="stage-type-info">
                        <span className={`status-badge stage-${viva.stage}`}>
                          {viva.stage.charAt(0).toUpperCase() + viva.stage.slice(1)}
                        </span>
                        <span className={`status-badge viva-type-${viva.viva_type}`}>
                          {viva.viva_type.charAt(0).toUpperCase() + viva.viva_type.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="datetime-info">
                        <div className="date-info">
                          <strong>📅</strong> {viva.date_of_viva ? new Date(viva.date_of_viva).toLocaleDateString() : 'Not set'}
                        </div>
                        <div className="time-info">
                          <strong>🕐</strong> {viva.time_of_viva || 'Not set'}
                        </div>
                      </div>
                    </td>
                    <td>{viva.location_of_viva || 'TBD'}</td>
                    <td>
                      <div className="status-info-group">
                        {viva.confirmation_viva_has_taken_place ? (
                          <span className="status-badge confirmed">✅ Confirmed</span>
                        ) : (
                          <span className="status-badge pending">⏳ Pending</span>
                        )}
                        {viva.organisation_process_completed && (
                          <span className="status-badge organized">📋 Organized</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedViva(viva);
                          setShowVivaDetailModal(true);
                        }}
                        className="btn btn-sm secondary"
                        title="View Details"
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                      No vivas found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Viva Detail Modal */}
      {showVivaDetailModal && selectedViva && (
        <VivaDetailModal
          viva={selectedViva}
          onClose={() => {
            setShowVivaDetailModal(false);
            setSelectedViva(null);
          }}
          onConfirm={async () => {
            try {
              await vivaAPI.confirmViva(selectedViva.viva_id);
              fetchVivas();
              setShowVivaDetailModal(false);
              setSelectedViva(null);
            } catch (error) {
              alert('Failed to confirm viva: ' + extractErrorMessage(error, 'Unknown error'));
            }
          }}
          onViewOutcomes={async () => {
            try {
              const outcomes = await vivaAPI.getVivaOutcomes(selectedViva.viva_id);
              setVivaOutcomes(outcomes);
              setShowVivaOutcomeModal(true);
            } catch (error) {
              alert('Failed to fetch outcomes: ' + extractErrorMessage(error, 'Unknown error'));
            }
          }}
          onViewVivaTeams={async () => {
            try {
              const teams = await vivaTeamAPI.getAllVivaTeams(0, 100, selectedViva.student_number);
              setStudentVivaTeams(teams);
              setShowStudentVivaTeamsModal(true);
            } catch (error) {
              alert('Failed to fetch viva teams: ' + extractErrorMessage(error, 'Unknown error'));
            }
          }}
          onViewSubmissions={async () => {
            try {
              const submissions = await submissionAPI.getSubmissions(0, 100, selectedViva.student_number);
              setStudentSubmissions(submissions);
              setShowStudentSubmissionsModal(true);
            } catch (error) {
              alert('Failed to fetch submissions: ' + extractErrorMessage(error, 'Unknown error'));
            }
          }}
        />
      )}

      {/* Viva Outcomes Modal */}
      {showVivaOutcomeModal && selectedViva && (
        <VivaOutcomesModal
          viva={selectedViva}
          outcomes={vivaOutcomes}
          onClose={() => {
            setShowVivaOutcomeModal(false);
            setSelectedViva(null);
            setVivaOutcomes([]);
          }}
        />
      )}

      {/* Student Viva Teams Modal */}
      {showStudentVivaTeamsModal && selectedViva && (
        <StudentVivaTeamsModal
          studentNumber={selectedViva.student_number}
          vivaTeams={studentVivaTeams}
          onClose={() => {
            setShowStudentVivaTeamsModal(false);
            setStudentVivaTeams([]);
          }}
        />
      )}

      {/* Student Submissions Modal */}
      {showStudentSubmissionsModal && selectedViva && (
        <StudentSubmissionsModal
          studentNumber={selectedViva.student_number}
          submissions={studentSubmissions}
          onClose={() => {
            setShowStudentSubmissionsModal(false);
            setStudentSubmissions([]);
          }}
        />
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'viva-teams':
        return renderVivaTeamManagement();
      case 'viva':
        return renderVivaManagement();
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
            {activeSection === 'dashboard' && 'GBOS Approver Dashboard'}
            {activeSection === 'viva-teams' && 'Viva Teams'}
            {activeSection === 'viva' && 'Viva Management'}
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

      {/* Modals */}
      {showVivaTeamDetailModal && selectedVivaTeam && (
        <VivaTeamDetailModal
          vivaTeam={selectedVivaTeam}
          onClose={() => {
            setShowVivaTeamDetailModal(false);
            setSelectedVivaTeam(null);
          }}
        />
      )}

      {showScheduleModal && selectedVivaTeam && (
        <ScheduleVivaModal
          vivaTeam={selectedVivaTeam}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedVivaTeam(null);
          }}
          onSave={handleScheduleViva}
        />
      )}

      {showOutcomeModal && selectedVivaTeam && (
        <OutcomeModal
          vivaTeam={selectedVivaTeam}
          onClose={() => {
            setShowOutcomeModal(false);
            setSelectedVivaTeam(null);
          }}
          onSave={handleRecordOutcome}
        />
      )}

      {showRejectModal && selectedVivaTeam && (
        <RejectVivaTeamModal
          vivaTeam={selectedVivaTeam}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedVivaTeam(null);
          }}
          onSave={handleRejectVivaTeam}
        />
      )}
    </div>
  );
};

// Viva Team Detail Modal Component
const VivaTeamDetailModal = ({ vivaTeam, onClose }) => (
  <div className="modal-overlay show" onClick={onClose}>
    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3 className="modal-title">Viva Team Details</h3>
        <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="modal-body">
        <div className="detail-grid">
          <div className="detail-section">
            <h4>Team Information</h4>
            <div className="detail-row">
              <span className="detail-label">Team ID:</span>
              <span className="detail-value">#{vivaTeam.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Student Number:</span>
              <span className="detail-value">{vivaTeam.student_number}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Stage:</span>
              <span className={`status-badge stage-${vivaTeam.stage}`}>
                {vivaTeam.stage.charAt(0).toUpperCase() + vivaTeam.stage.slice(1)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`status-badge ${vivaTeam.status}`}>
                {vivaTeam.status.charAt(0).toUpperCase() + vivaTeam.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h4>Examination Team</h4>
            <div className="detail-row">
              <span className="detail-label">Internal Examiner 1:</span>
              <span className="detail-value">{vivaTeam.internal_examiner_1_id || 'Not assigned'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Internal Examiner 2:</span>
              <span className="detail-value">{vivaTeam.internal_examiner_2_id || 'Not assigned'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">External Examiner:</span>
              <span className="detail-value">{vivaTeam.external_examiner_name || 'Not assigned'}</span>
            </div>
            {vivaTeam.external_examiner_email && (
              <div className="detail-row">
                <span className="detail-label">External Examiner Email:</span>
                <span className="detail-value">{vivaTeam.external_examiner_email}</span>
              </div>
            )}
          </div>

          <div className="detail-section">
            <h4>Scheduling Information</h4>
            <div className="detail-row">
              <span className="detail-label">Proposed Date:</span>
              <span className="detail-value">
                {vivaTeam.proposed_date ? new Date(vivaTeam.proposed_date).toLocaleDateString() : 'Not set'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Scheduled Date:</span>
              <span className="detail-value">
                {vivaTeam.scheduled_date ? new Date(vivaTeam.scheduled_date).toLocaleDateString() : 'Not scheduled'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Location:</span>
              <span className="detail-value">{vivaTeam.location || 'TBD'}</span>
            </div>
          </div>

          {vivaTeam.outcome && (
            <div className="detail-section">
              <h4>Examination Outcome</h4>
              <div className="detail-row">
                <span className="detail-label">Result:</span>
                <span className={`status-badge outcome-${vivaTeam.outcome.toLowerCase()}`}>
                  {vivaTeam.outcome}
                </span>
              </div>
              {vivaTeam.feedback && (
                <div className="detail-row">
                  <span className="detail-label">Feedback:</span>
                  <span className="detail-value">{vivaTeam.feedback}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="modal-footer">
        <button type="button" className="btn secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

// Schedule Viva Modal Component
const ScheduleVivaModal = ({ vivaTeam, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    scheduled_date: '',
    scheduled_time: '',
    location: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Combine date and time
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);
      
      await onSave(vivaTeam.id, {
        scheduled_date: scheduledDateTime.toISOString(),
        location: formData.location,
        notes: formData.notes
      });
      onClose();
    } catch (error) {
      console.error('Error scheduling viva:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Schedule Viva Examination</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Team:</label>
              <div className="team-info">
                <strong>#{vivaTeam.id}</strong> - {vivaTeam.student_number} ({vivaTeam.stage})
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Time *</label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                type="text"
                className="form-input"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., Conference Room A, Online (Zoom), etc."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea
                className="form-input"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any special instructions or notes..."
                rows="3"
              />
            </div>
          </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Scheduling...' : 'Schedule Viva'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Outcome Modal Component
const OutcomeModal = ({ vivaTeam, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    outcome: '',
    feedback: '',
    recommendations: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSave(vivaTeam.id, formData);
      onClose();
    } catch (error) {
      console.error('Error recording outcome:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Record Viva Outcome</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Team:</label>
              <div className="team-info">
                <strong>#{vivaTeam.id}</strong> - {vivaTeam.student_number} ({vivaTeam.stage})
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Outcome *</label>
              <select
                className="form-input"
                value={formData.outcome}
                onChange={(e) => setFormData({...formData, outcome: e.target.value})}
                required
              >
                <option value="">Select outcome...</option>
                <option value="PASS">Pass</option>
                <option value="PASS_WITH_MINOR_CORRECTIONS">Pass with Minor Corrections</option>
                <option value="PASS_WITH_MAJOR_CORRECTIONS">Pass with Major Corrections</option>
                <option value="REFER">Refer</option>
                <option value="FAIL">Fail</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Feedback *</label>
              <textarea
                className="form-input"
                value={formData.feedback}
                onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                placeholder="Detailed feedback from the examination..."
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Recommendations</label>
              <textarea
                className="form-input"
                value={formData.recommendations}
                onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                placeholder="Any recommendations for the student..."
                rows="3"
              />
            </div>
          </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Recording...' : 'Record Outcome'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Reject Viva Team Modal Component
const RejectVivaTeamModal = ({ vivaTeam, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSave(vivaTeam.id, formData.reason);
      onClose();
    } catch (error) {
      console.error('Error rejecting viva team:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Reject Viva Team</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Team:</label>
              <div className="team-info">
                <strong>#{vivaTeam.id}</strong> - {vivaTeam.student_number} ({vivaTeam.stage})
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Rejection Reason *</label>
              <textarea
                className="form-input"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Please provide a detailed reason for rejecting this viva team..."
                rows="4"
                required
              />
            </div>
          </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn danger" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Rejecting...' : 'Reject Team'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Viva Detail Modal Component
const VivaDetailModal = ({ viva, onClose, onConfirm, onViewOutcomes, onViewVivaTeams, onViewSubmissions }) => {
  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Viva Details - #{viva.viva_id}</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="detail-section">
            <h4 className="detail-section-title">Basic Information</h4>
            <div className="detail-row">
              <span className="detail-label">Viva ID:</span>
              <span className="detail-value">#{viva.viva_id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Student Number:</span>
              <span className="detail-value">{viva.student_number}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Stage:</span>
              <span className={`status-badge stage-${viva.stage}`}>
                {viva.stage.charAt(0).toUpperCase() + viva.stage.slice(1)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Viva Type:</span>
              <span className={`status-badge viva-type-${viva.viva_type}`}>
                {viva.viva_type.charAt(0).toUpperCase() + viva.viva_type.slice(1)}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="detail-section-title">Schedule</h4>
            <div className="detail-row">
              <span className="detail-label">Date of Viva:</span>
              <span className="detail-value">
                {viva.date_of_viva ? new Date(viva.date_of_viva).toLocaleDateString() : 'Not set'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Time of Viva:</span>
              <span className="detail-value">{viva.time_of_viva || 'Not set'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Location:</span>
              <span className="detail-value">{viva.location_of_viva || 'Not set'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="detail-section-title">Confirmations</h4>
            <div className="detail-row">
              <span className="detail-label">Date Confirmed to Examiners:</span>
              <span className="detail-value">
                {viva.date_confirmed_to_examiners ? new Date(viva.date_confirmed_to_examiners).toLocaleDateString() : 'Not confirmed'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date Confirmed to PGR:</span>
              <span className="detail-value">
                {viva.date_confirmed_to_pgr ? new Date(viva.date_confirmed_to_pgr).toLocaleDateString() : 'Not confirmed'}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h4 className="detail-section-title">Status</h4>
            <div className="detail-row">
              <span className="detail-label">Organization Process:</span>
              <span className={`status-badge ${viva.organisation_process_completed ? 'confirmed' : 'pending'}`}>
                {viva.organisation_process_completed ? '✅ Completed' : '⏳ Pending'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Viva Status:</span>
              <span className={`status-badge ${viva.confirmation_viva_has_taken_place ? 'confirmed' : 'pending'}`}>
                {viva.confirmation_viva_has_taken_place ? '✅ Taken Place' : '⏳ Not Confirmed'}
              </span>
            </div>
          </div>

          {viva.viva_notes && (
            <div className="detail-section">
              <h4 className="detail-section-title">Notes</h4>
              <div className="detail-notes">
                {viva.viva_notes}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h4 className="detail-section-title">Timestamps</h4>
            <div className="detail-row">
              <span className="detail-label">Created:</span>
              <span className="detail-value">
                {viva.created_date ? new Date(viva.created_date).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Close</button>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {!viva.confirmation_viva_has_taken_place && (
              <button type="button" className="btn btn-sm warning" onClick={onConfirm}>
                ✅ Confirm
              </button>
            )}
            <button type="button" className="btn btn-sm success" onClick={onViewOutcomes}>
              📊 Outcomes
            </button>
            <button type="button" className="btn btn-sm primary" onClick={onViewVivaTeams}>
              🎯 Viva Teams
            </button>
            <button type="button" className="btn btn-sm info" onClick={onViewSubmissions}>
              📝 Submissions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Student Viva Teams Modal Component
const StudentVivaTeamsModal = ({ studentNumber, vivaTeams, onClose }) => {
  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content extra-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Viva Teams for Student {studentNumber}</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {vivaTeams && vivaTeams.length > 0 ? (
            <div className="table-scroll">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Team ID</th>
                    <th>Stage</th>
                    <th>Status</th>
                    <th>Examiners</th>
                    <th>Dates</th>
                    <th>Location</th>
                    <th>Outcome</th>
                  </tr>
                </thead>
                <tbody>
                  {vivaTeams.map(team => (
                    <tr key={team.id}>
                      <td><strong>#{team.id}</strong></td>
                      <td>
                        <span className={`status-badge stage-${team.stage}`}>
                          {team.stage.charAt(0).toUpperCase() + team.stage.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${team.status}`}>
                          {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          <div><strong>Int 1:</strong> {team.internal_examiner_1_id || 'N/A'}</div>
                          <div><strong>Int 2:</strong> {team.internal_examiner_2_id || 'N/A'}</div>
                          <div><strong>Ext:</strong> {team.external_examiner_name || 'N/A'}</div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          <div><strong>Proposed:</strong> {team.proposed_date ? new Date(team.proposed_date).toLocaleDateString() : 'N/A'}</div>
                          <div><strong>Scheduled:</strong> {team.scheduled_date ? new Date(team.scheduled_date).toLocaleDateString() : 'N/A'}</div>
                        </div>
                      </td>
                      <td>{team.location || 'TBD'}</td>
                      <td>
                        {team.outcome ? (
                          <span className={`status-badge outcome-${team.outcome.toLowerCase()}`}>
                            {team.outcome}
                          </span>
                        ) : 'Pending'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No viva teams found for this student.</p>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// Student Submissions Modal Component
const StudentSubmissionsModal = ({ studentNumber, submissions, onClose }) => {
  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content extra-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Submissions for Student {studentNumber}</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {submissions && submissions.length > 0 ? (
            <div className="table-scroll">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Submission ID</th>
                    <th>Type</th>
                    <th>Stage</th>
                    <th>Status</th>
                    <th>Submitted Date</th>
                    <th>Reviewed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(submission => (
                    <tr key={submission.id}>
                      <td><strong>#{submission.id}</strong></td>
                      <td>
                        <span className={`status-badge type-${submission.submission_type}`}>
                          {submission.submission_type?.charAt(0).toUpperCase() + submission.submission_type?.slice(1) || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge stage-${submission.stage}`}>
                          {submission.stage?.charAt(0).toUpperCase() + submission.stage?.slice(1) || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${submission.status}`}>
                          {submission.status?.charAt(0).toUpperCase() + submission.status?.slice(1) || 'N/A'}
                        </span>
                      </td>
                      <td>
                        {submission.submission_date ? new Date(submission.submission_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        {submission.reviewed_date ? new Date(submission.reviewed_date).toLocaleDateString() : 'Not reviewed'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No submissions found for this student.</p>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// Viva Outcomes Modal Component (Read-only for GBOS Approver)
const VivaOutcomesModal = ({ viva, outcomes, onClose }) => {
  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content extra-large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Viva Outcomes - Viva #{viva.viva_id}</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="outcomes-header">
            <h4>Student: {viva.student_number}</h4>
          </div>

          {outcomes && outcomes.length > 0 ? (
            <div className="outcomes-list">
              {outcomes.map((outcome, index) => (
                <div key={outcome.outcome_id} className="outcome-card">
                  <div className="outcome-header">
                    <h5>Outcome #{index + 1} (ID: {outcome.outcome_id})</h5>
                  </div>
                  <div className="outcome-details">
                    <div className="detail-row">
                      <span className="detail-label">Initial Outcome:</span>
                      <span className="detail-value">{outcome.initial_outcome || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">GSBOS Outcome:</span>
                      <span className="detail-value">{outcome.gsbos_outcome || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Resubmission Required:</span>
                      <span className={`status-badge ${outcome.resubmission_required ? 'warning' : 'confirmed'}`}>
                        {outcome.resubmission_required ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Amendments Received:</span>
                      <span className="detail-value">
                        {outcome.date_specification_of_amendments_received 
                          ? new Date(outcome.date_specification_of_amendments_received).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Chair's Report:</span>
                      <span className="detail-value">
                        {outcome.date_chairs_report_received 
                          ? new Date(outcome.date_chairs_report_received).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Considered by GSBOS:</span>
                      <span className="detail-value">
                        {outcome.date_paperwork_considered_by_gsbos 
                          ? new Date(outcome.date_paperwork_considered_by_gsbos).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Sent to PGR:</span>
                      <span className="detail-value">
                        {outcome.date_outcome_sent_to_pgr 
                          ? new Date(outcome.date_outcome_sent_to_pgr).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </div>
                    {outcome.outcome_notes && (
                      <div className="detail-row">
                        <span className="detail-label">Notes:</span>
                        <span className="detail-value">{outcome.outcome_notes}</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">
                        {outcome.created_date ? new Date(outcome.created_date).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No outcomes recorded for this viva yet.</p>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default GbosApprover;
