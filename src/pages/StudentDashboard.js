import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI, supervisorAPI, assignmentAPI, authAPI, vivaTeamAPI, submissionAPI } from '../utils/api';
import '../styles/shared-dashboard.css';
import logo from '../image/logo.png';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Student data states
  const [studentData, setStudentData] = useState(null);
  const [studentSupervisors, setStudentSupervisors] = useState([]);
  const [allSupervisors, setAllSupervisors] = useState([]);
  const [vivaTeams, setVivaTeams] = useState([]);
  
  // Profile states
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    department: '',
    phone_number: '',
    is_active: true
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Submission states
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [showCreateSubmissionModal, setShowCreateSubmissionModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showSubmissionDetailModal, setShowSubmissionDetailModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [openActionDropdownId, setOpenActionDropdownId] = useState(null);
  const [submissionForm, setSubmissionForm] = useState({
    submission_type: 'THESIS',
    status: 'DRAFT',
    title: '',
    description: '',
    date_expected: '',
    submission_notes: ''
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [submissionError, setSubmissionError] = useState('');
  
  // Progress tracking states
  const [currentStage, setCurrentStage] = useState('proposal');
  const [showStageSubmissionModal, setShowStageSubmissionModal] = useState(false);
  const [stageSubmissionType, setStageSubmissionType] = useState('thesis');
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal states
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [showVivaTeamModal, setShowVivaTeamModal] = useState(false);
  const [selectedVivaTeam, setSelectedVivaTeam] = useState(null);

  useEffect(() => {
    if (!user) return; // Wait for user to be loaded
    
    fetchStudentData();
    fetchUserProfile();
  }, [user]); // Re-fetch when user changes

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user || !user.username) {
        throw new Error('User not logged in');
      }
      
      // Get student record - use username as student_number
      const studentNumber = user.username;
      console.log('Fetching student data for student_number:', studentNumber);
      
      const studentResponse = await studentAPI.getStudentByNumber(studentNumber);
      console.log('Student data fetched:', studentResponse);
      setStudentData(studentResponse);
      
      // Fetch all related data in parallel
      const [supervisorsResponse, allSupervisorsResponse, vivaTeamsResponse, submissionsResponse] = await Promise.all([
        assignmentAPI.getStudentSupervisors(studentNumber),
        supervisorAPI.getAllSupervisors(0, 100),
        vivaTeamAPI.getAllVivaTeams(0, 100, studentNumber),
        submissionAPI.getSubmissions(studentNumber)
      ]);
      
      console.log('Supervisors:', supervisorsResponse);
      console.log('Viva Teams:', vivaTeamsResponse);
      console.log('Submissions:', submissionsResponse);
      
      setStudentSupervisors(supervisorsResponse || []);
      setAllSupervisors(allSupervisorsResponse || []);
      setVivaTeams(vivaTeamsResponse || []);
      setSubmissions(submissionsResponse || []);
      
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError(err.message || 'Failed to fetch student data');
      
      // Set empty arrays so UI doesn't break
      setStudentSupervisors([]);
      setAllSupervisors([]);
      setVivaTeams([]);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      // Use student_number from studentData if available, fallback to user.username
      const studentNumber = studentData?.student_number || user.username;
      const submissionsResponse = await submissionAPI.getSubmissions(studentNumber);
      setSubmissions(submissionsResponse || []);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const profile = await authAPI.getProfile();
      setProfileData({
        username: profile.username || '',
        email: profile.email || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        department: profile.department || '',
        phone_number: profile.phone_number || '',
        is_active: profile.is_active !== undefined ? profile.is_active : true
      });
    } catch (err) {
      setProfileError('Failed to fetch profile data');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      setProfileError('');
      setSuccessMessage('');
      
      await authAPI.updateProfile(profileData);
      setSuccessMessage('Profile updated successfully!');
      
      // Refresh profile data
      await fetchUserProfile();
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    setPasswordError('');
    setSuccessMessage('');
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    
    try {
      setPasswordLoading(true);
      
      await authAPI.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      
      setSuccessMessage('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Submission handler functions
  const handleCreateSubmission = async (e) => {
    e.preventDefault();
    try {
      setSubmissionError('');
      setSuccessMessage('');
      
      if (!submissionForm.title || !submissionForm.description) {
        setSubmissionError('Please fill in all fields');
        return;
      }
      
      const submissionData = {
        student_number: studentData?.student_number || user.username,
        submission_type: submissionForm.submission_type,
        status: submissionForm.status,
        title: submissionForm.title,
        description: submissionForm.description,
        date_expected: submissionForm.date_expected || null,
        submission_notes: submissionForm.submission_notes || ''
      };
      
      const newSubmission = await submissionAPI.createSubmission(submissionData);
      setSuccessMessage('Submission created successfully!');
      setShowCreateSubmissionModal(false);
      setSubmissionForm({
        submission_type: 'THESIS',
        status: 'DRAFT',
        title: '',
        description: '',
        date_expected: '',
        submission_notes: ''
      });
      
      // Refresh submissions
      await fetchSubmissions();
      
    } catch (err) {
      setSubmissionError(err.message || 'Failed to create submission');
    }
  };
  
  const handleUpdateSubmission = async (submissionId, updateData) => {
    try {
      setSubmissionError('');
      setSuccessMessage('');
      
      await submissionAPI.updateSubmission(submissionId, updateData);
      setSuccessMessage('Submission updated successfully!');
      
      // Refresh submissions
      await fetchSubmissions();
      
    } catch (err) {
      setSubmissionError(err.message || 'Failed to update submission');
    }
  };
  
  const handleFileUpload = async (e) => {
    e.preventDefault();
    try {
      setSubmissionError('');
      setSuccessMessage('');
      
      if (!uploadFile || !selectedSubmission) {
        setSubmissionError('Please select a file and submission');
        return;
      }
      
      await submissionAPI.uploadFile(selectedSubmission.id, uploadFile);
      setSuccessMessage('File uploaded successfully!');
      setShowFileUploadModal(false);
      setUploadFile(null);
      setSelectedSubmission(null);
      
      // Refresh submissions
      await fetchSubmissions();
      
    } catch (err) {
      setSubmissionError(err.message || 'Failed to upload file');
    }
  };
  
  const handleSubmitForReview = async (submissionId) => {
    try {
      setSubmissionError('');
      setSuccessMessage('');
      
      // Update status from 'draft' to 'submitted'
      await submissionAPI.updateSubmission(submissionId, { status: 'submitted' });
      setSuccessMessage('Submission submitted for review successfully! Status changed to "Submitted".');
      
      // Close any open modals
      setShowSubmissionDetailModal(false);
      setSelectedSubmission(null);
      
      // Refresh submissions
      await fetchSubmissions();
      
    } catch (err) {
      setSubmissionError(err.message || 'Failed to submit for review');
    }
  };

  // Progress tracking helper functions
  const getStageStatus = (stage) => {
    // Get viva teams for this stage
    const stageVivaTeams = vivaTeams.filter(vt => vt.stage === stage);
    
    if (stageVivaTeams.length === 0) {
      return 'Pending';
    }
    
    // Check if any viva team is completed with pass
    const completedViva = stageVivaTeams.find(vt => vt.status === 'completed' && vt.outcome === 'pass');
    if (completedViva) return 'Completed';
    
    // Check if any viva team is approved or scheduled
    const approvedViva = stageVivaTeams.find(vt => vt.status === 'approved' || vt.status === 'scheduled');
    if (approvedViva) return 'Viva Approved';
    
    // Check if any viva team is proposed
    const proposedViva = stageVivaTeams.find(vt => vt.status === 'proposed');
    if (proposedViva) return 'Viva Proposed';
    
    return 'Pending';
  };
  
  const getStageSubmissions = (submissionType) => {
    return submissions.filter(s => s.submission_type === submissionType);
  };
  
  const getStageDeadline = (stage) => {
    const deadlines = {
      progression: 'March 2025',
      final: 'September 2025'
    };
    return deadlines[stage] || 'Not set';
  };
  
  const getSubmissionTypeForStage = (stage) => {
    const typeMap = {
      progression: 'annual_report',
      final: 'thesis'
    };
    return typeMap[stage] || 'thesis';
  };
  
  const handleStageSubmissionCreate = async (stage) => {
    // Reset form to default values
    setSubmissionForm({
      submission_type: 'thesis',
      title: '',
      description: ''
    });
    setShowStageSubmissionModal(true);
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const renderNavigation = () => (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        className="mobile-hamburger"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <span className={`hamburger-line ${sidebarOpen ? 'active' : ''}`}></span>
        <span className={`hamburger-line ${sidebarOpen ? 'active' : ''}`}></span>
        <span className={`hamburger-line ${sidebarOpen ? 'active' : ''}`}></span>
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo-section">
            <img src={logo} alt="Logo" className="sidebar-logo" />
            <div className="sidebar-branding">
              <p className="sidebar-portal-name">Student</p>
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
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-item">
            <button 
              className={`nav-link ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('dashboard');
                setSidebarOpen(false);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span className="nav-text">Dashboard</span>
            </button>
          </div>
          <div className="nav-item">
            <button 
              className={`nav-link ${activeSection === 'progress' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('progress');
                setSidebarOpen(false);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4864 2.02168 11.3363C2.16356 9.18616 2.99721 7.13656 4.39828 5.49984C5.79935 3.86312 7.69279 2.72636 9.79619 2.24422C11.8996 1.76208 14.1003 1.95718 16.07 2.81" stroke="currentColor" strokeWidth="2"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span className="nav-text">Progress Tracking</span>
            </button>
          </div>
          <div className="nav-item">
            <button 
              className={`nav-link ${activeSection === 'submissions' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('submissions');
                setSidebarOpen(false);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span className="nav-text">Submissions</span>
            </button>
          </div>
          <div className="nav-item">
            <button 
              className={`nav-link ${activeSection === 'viva-teams' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('viva-teams');
                setSidebarOpen(false);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span className="nav-text">Viva Teams</span>
            </button>
          </div>
          <div className="nav-item">
            <button 
              className={`nav-link ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('profile');
                setSidebarOpen(false);
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span className="nav-text">Profile</span>
            </button>
          </div>
        </nav>
        
        {/* Sidebar Footer - User Profile */}
        <div className="sidebar-footer">
          <div className="user-profile" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
            <div className="user-avatar">
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <div className="user-info">
              <p className="user-name">{user?.first_name || user?.username}</p>
              <p className="user-role">Student</p>
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
            <button 
              className="dropdown-item"
              onClick={() => {
                setActiveSection('profile');
                setUserDropdownOpen(false);
                setSidebarOpen(false);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Profile
            </button>
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
        <h1 className="page-title">Student Dashboard</h1>
        <p className="page-subtitle">Overview of your academic progress and information</p>
      </div>
      
      {/* Statistics Grid */}
      <div className="stats-grid">        
        <div className="stats-card">
          <div className="stats-value">{studentSupervisors.length}</div>
          <div className="stats-label">Supervisors</div>
          <span className={`status-badge ${studentSupervisors.length > 0 ? 'active' : 'inactive'}`}>
            {studentSupervisors.length > 0 ? 'Assigned' : 'None'}
          </span>
        </div>
        
        <div className="stats-card">
          <div className="stats-value">{submissions.length}</div>
          <div className="stats-label">Submissions</div>
          <span className={`status-badge ${submissions.length > 0 ? 'active' : 'inactive'}`}>
            {submissions.length > 0 ? 'Available' : 'None'}
          </span>
        </div>
        
        <div className="stats-card">
          <div className="stats-value">{vivaTeams.length}</div>
          <div className="stats-label">Viva Teams</div>
          <span className={`status-badge ${vivaTeams.length > 0 ? 'active' : 'inactive'}`}>
            {vivaTeams.length > 0 ? 'Available' : 'None'}
          </span>
        </div>
        
        <div className="stats-card">
          <div className="stats-value">{studentData?.cohort || 'N/A'}</div>
          <div className="stats-label">Cohort</div>
          <span className={`status-badge ${studentData?.cohort ? 'active' : 'inactive'}`}>
            {studentData?.cohort ? 'Enrolled' : 'Not Set'}
          </span>
        </div>
      </div>

      {/* Student Information - Professional Rows */}
      <div className="page-header">
        <h2 className="page-title">Personal Information</h2>
        <p className="page-subtitle">Your student details and academic information</p>
      </div>
      
      {studentData && (
        <div className="info-rows-container">
          <div className="info-row">
            <div className="info-label">Student Number</div>
            <div className="info-value">{studentData.student_number}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Full Name</div>
            <div className="info-value">{studentData.forename} {studentData.surname}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Cohort</div>
            <div className="info-value">{studentData.cohort}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Course Code</div>
            <div className="info-value">{studentData.course_code}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Programme of Study</div>
            <div className="info-value">{studentData.programme_of_study}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Mode</div>
            <div className="info-value">{studentData.mode}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Subject Area</div>
            <div className="info-value">{studentData.subject_area}</div>
          </div>
          <div className="info-row">
            <div className="info-label">International Student</div>
            <div className="info-value">{studentData.international_student ? 'Yes' : 'No'}</div>
          </div>
        </div>
      )}

      {/* Supervisors */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">My Supervisors</h2>
          <button 
            onClick={() => setShowSupervisorModal(true)}
            className="btn secondary"
          >
            View All Supervisors
          </button>
        </div>
        <div className="professional-list">
          {studentSupervisors.map(supervision => {
            const supervisor = allSupervisors.find(s => s.supervisor_id === supervision.supervisor_id);
            return (
              <div key={supervision.student_supervisor_id} className="list-item">
                <div className="list-item-content">
                  <h4 className="list-item-title">{supervisor?.supervisor_name || `Supervisor ID: ${supervision.supervisor_id}`}</h4>
                  <p className="list-item-subtitle">
                    <strong>Role:</strong> {supervision.role} | 
                    <strong> Email:</strong> {supervisor?.email || 'N/A'} | 
                    <strong> Department:</strong> {supervisor?.department || 'N/A'}
                  </p>
                  <p className="list-item-subtitle">
                    <strong>Period:</strong> {new Date(supervision.start_date).toLocaleDateString()}
                    {supervision.end_date && ` - ${new Date(supervision.end_date).toLocaleDateString()}`}
                  </p>
                  {supervision.supervision_notes && (
                    <p className="list-item-subtitle"><strong>Notes:</strong> {supervision.supervision_notes}</p>
                  )}
                </div>
              </div>
            );
          })}
          
          {studentSupervisors.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">👨‍🏫</div>
              <h3 className="empty-state-title">No Supervisors Assigned</h3>
              <p className="empty-state-description">Your supervisors will appear here once they have been assigned to you.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );



  const renderProfile = () => (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Student Profile</h1>
        <p className="page-subtitle">Manage your account information and security settings</p>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <div className="alert-icon">✅</div>
          <div className="alert-content">{successMessage}</div>
        </div>
      )}

      {/* Profile Update Card */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Update Profile</h2>
          <span className="card-subtitle">Update your personal information</span>
        </div>
        
        <form onSubmit={handleProfileUpdate} className="profile-form compact-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👤</span>
                Username
              </label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                className="form-input"
                placeholder="Enter username"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📧</span>
                Email Address
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className="form-input"
                placeholder="Enter email"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📝</span>
                First Name
              </label>
              <input
                type="text"
                value={profileData.first_name}
                onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                className="form-input"
                placeholder="First name"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📝</span>
                Last Name
              </label>
              <input
                type="text"
                value={profileData.last_name}
                onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                className="form-input"
                placeholder="Last name"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🏢</span>
                Department
              </label>
              <input
                type="text"
                value={profileData.department}
                onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                className="form-input"
                placeholder="Department"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📞</span>
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone_number}
                onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})}
                className="form-input"
                placeholder="Phone number"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">✅</span>
                Account Status
              </label>
              {/* <div className="checkbox-wrapper">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profileData.is_active}
                    onChange={(e) => setProfileData({...profileData, is_active: e.target.checked})}
                    className="form-checkbox"
                  />
                  <span className="checkbox-text">Active Account</span>
                </label>
              </div> */}
            </div>
            
            <div className="form-group">
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  const renderProgressTracking = () => {
    const stages = [
      {
        key: 'registration',
        title: 'Registration',
        submissionType: 'registration',
        description: 'Complete your registration by submitting required documents.',
        icon: '📝',
        requiredDocuments: ['Research Proposal', 'Ethics Approval Form']
      },
      {
        key: 'progression',
        title: 'Progression',
        submissionType: 'annual_report',
        description: 'Submit annual progress reports and continue research.',
        icon: '📊'
      },
      {
        key: 'final',
        title: 'Final',
        submissionType: 'thesis',
        description: 'Final dissertation submission and viva.',
        icon: '🎓'
      }
    ];

    return (
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Progress Tracker</h1>
          <p className="page-subtitle">Track your progress through Registration, Progression, and Final stages.</p>
        </div>
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Progress Timeline</h2>
            <span className="card-subtitle">Your academic journey overview</span>
          </div>
          <div className="progress-timeline">
            {stages.map((stage, index) => {
              let status = getStageStatus(stage.key);
              if (stage.key === 'progression' && getStageStatus('registration') !== 'Approved') status = 'Pending';
              if (stage.key === 'final' && getStageStatus('progression') !== 'Completed') status = 'Pending';
              const isCompleted = status === 'Completed' || status === 'Approved';
              const isCurrent = !isCompleted && (
                (stage.key === 'registration') ||
                (stage.key === 'progression' && getStageStatus('registration') === 'Approved') ||
                (stage.key === 'final' && getStageStatus('progression') === 'Completed')
              );
              return (
                <div key={stage.key} className={`timeline-item ${isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'}`}>
                  <div className="timeline-marker">
                    <span className="timeline-icon">{stage.icon}</span>
                    <span className="timeline-number">{index + 1}</span>
                  </div>
                  <div className="timeline-content">
                    <h3>{stage.title}</h3>
                    <span className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
                  </div>
                  {index < stages.length - 1 && (
                    <div className={`timeline-connector ${isCompleted ? 'completed' : ''}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Stage Details</h2>
            <span className="card-subtitle">Detailed information about each academic stage</span>
          </div>
          <div className="stages-row">
            {stages.map((stage, index) => {
              let status = getStageStatus(stage.key);
              if (stage.key === 'progression' && getStageStatus('registration') !== 'Approved') status = 'Pending';
              if (stage.key === 'final' && getStageStatus('progression') !== 'Completed') status = 'Pending';
              const stageSubmissions = getStageSubmissions(stage.submissionType);
              const stageVivaTeams = vivaTeams.filter(vt => vt.stage === stage.key);
              const isAvailable =
                (stage.key === 'registration') ||
                (stage.key === 'progression' && getStageStatus('registration') === 'Approved') ||
                (stage.key === 'final' && getStageStatus('progression') === 'Completed');
                return (
                <div key={stage.key} className={`progress-stage-card ${status.toLowerCase().replace(' ', '-')} ${!isAvailable ? 'locked' : ''}`} style={{flex:1, minWidth:'320px', marginRight:index<stages.length-1?'1.5rem':'0'}}>
                  <div className="stage-card-header">
                  <div className="stage-title-section">
                    <h3>{stage.title} Stage</h3>
                    <p className="stage-description">{stage.description}</p>
                  </div>
                  <div className="stage-status-badge">
                    <span className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}>{status}</span>
                  </div>
                  </div>
                  {isAvailable ? (
                  <div className="stage-card-content">
                    {stage.key === 'registration' && (
                    <>
                      <div className="stage-info-section">
                      <h4>Required Documents</h4>
                      <ul>
                        {stage.requiredDocuments.map(doc => (
                        <li key={doc}>{doc}</li>
                        ))}
                      </ul>
                      </div>
                      <div className="stage-info-section">
                      <h4>Uploaded Documents</h4>
                      {stageSubmissions.length > 0 ? (
                        <ul>
                        {stageSubmissions.map(submission => (
                          <li key={submission.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                          <div>
                            <span style={{fontWeight:'600',color:'var(--primary-color)'}}>{submission.title}</span>
                            <span className={`status-badge ${submission.status}`} style={{marginLeft:'1rem'}}>{submission.status}</span>
                          </div>
                          <button
                            className="btn-stage-action"
                            style={{marginLeft:'auto', minWidth:'90px', textAlign:'center'}}
                            onClick={() => {
                            setSelectedSubmission(submission);
                            setShowSubmissionDetailModal(true);
                            }}
                          >
                            View
                          </button>
                          </li>
                        ))}
                        </ul>
                      ) : (
                        <div style={{color:'var(--text-muted)',fontSize:'0.9rem'}}>No documents uploaded yet.</div>
                      )}
                      <div className="stage-actions-section" style={{display:'flex',justifyContent:'flex-end'}}>
                        <button className="btn-stage-action" style={{minWidth:'90px', textAlign:'center'}} onClick={() => handleStageSubmissionCreate(stage.key)}>Upload Document</button>
                      </div>
                      </div>
                    </>
                    )}
                    {stage.key === 'progression' && (
                    <div className="stage-info-section">
                      <h4>Progression Status</h4>
                      <div className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}>{status}</div>
                      {isAvailable ? (
                      <div className="stage-actions-section" style={{display:'flex',justifyContent:'flex-end'}}>
                        <button className="btn-stage-action" style={{minWidth:'90px', textAlign:'center'}} onClick={() => handleStageSubmissionCreate(stage.key)}>Upload Progress Report</button>
                      </div>
                      ) : (
                      <div style={{color:'var(--text-muted)',fontSize:'0.9rem'}}>Complete Registration to enable Progression.</div>
                      )}
                    </div>
                    )}
                    {stage.key === 'final' && (
                    <div className="stage-info-section">
                      <h4>Final Stage Instructions</h4>
                      <div style={{marginBottom:'0.5rem'}}>Submit your final dissertation and attend your viva.</div>
                      {isAvailable ? (
                      <div className="stage-actions-section" style={{display:'flex',justifyContent:'flex-end'}}>
                        <button className="btn-stage-action" style={{minWidth:'90px', textAlign:'center'}} onClick={() => handleStageSubmissionCreate(stage.key)}>Upload Final Dissertation</button>
                      </div>
                      ) : (
                      <div style={{color:'var(--text-muted)',fontSize:'0.9rem'}}>Complete Progression to enable Final Stage.</div>
                      )}
                    </div>
                    )}
                  </div>
                  ) : (
                  <div className="stage-locked-content">
                    <div className="locked-icon">🔒</div>
                    <p className="locked-text">Available after completing previous stage</p>
                  </div>
                  )}
                </div>
                );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderSubmissions = () => (
    <div className="main-content submissions-page">
      {/* Fixed Header Section */}
      <div className="fixed-header">
        <div className="page-header">
          <h1 className="page-title">My Submissions</h1>
          <p className="page-subtitle">Manage and track your academic document submissions</p>
          <div className="header-actions">
            <button 
              className="btn primary"
              onClick={() => setShowCreateSubmissionModal(true)}
            >
              📝 New Submission
            </button>
          </div>
        </div>
        {/* Welcome message, always visible */}
        <div className="welcome-message">
          Welcome, {user?.first_name || user?.username}
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Submission Records</h2>
        </div>
        <div className="table-scroll">
          {submissionsLoading ? (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading submissions...</div>
            </div>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Details</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Dates</th>
                  <th>File</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td><strong>#{submission.id}</strong></td>
                    <td>
                      <div className="submission-details">
                        <div className="submission-title">{submission.title}</div>
                        {submission.description && (
                          <div className="submission-desc">
                            {submission.description.length > 60 
                              ? submission.description.substring(0, 60) + '...'
                              : submission.description
                            }
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge type-${submission.submission_type}`}>
                        {submission.submission_type === 'registration' ? '📋' :
                         submission.submission_type === 'viva_document' ? '📄' :
                         submission.submission_type === 'thesis' ? '📚' :
                         submission.submission_type === 'correction' ? '✏️' :
                         submission.submission_type === 'annual_report' ? '📊' : '📄'}
                        {' ' + submission.submission_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${submission.status}`}>
                        {submission.status === 'draft' && '📝'}
                        {submission.status === 'submitted' && '📤'}
                        {submission.status === 'under_review' && '🔍'}
                        {submission.status === 'approved' && '✅'}
                        {submission.status === 'rejected' && '❌'}
                        {submission.status === 'revision_required' && '🔄'}
                        {' ' + submission.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>Created:</strong> {new Date(submission.created_date).toLocaleDateString('en-GB')}
                      </div>
                      <div>
                        <strong>Updated:</strong> {new Date(submission.updated_date).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td>
                      {submission.file_path ? (
                        <div className="file-info">
                          <span className="file-icon">📎</span>
                          <span className="file-name">{submission.file_path.split('/').pop()}</span>
                        </div>
                      ) : (
                        <span className="no-file">No file</span>
                      )}
                    </td>
                    <td>
                      <div className="action-dropdown-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          className="hamburger-btn"
                          title="Actions"
                          onClick={() => setOpenActionDropdownId(openActionDropdownId === submission.id ? null : submission.id)}
                        >
                          <span className="hamburger-icon">&#9776;</span>
                        </button>
                        {openActionDropdownId === submission.id && (
                          <div className="action-dropdown-row">
                            <button
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setShowSubmissionDetailModal(true);
                                setOpenActionDropdownId(null);
                              }}
                              className="dropdown-btn secondary btn-sm"
                              title="View Details"
                            >
                              View
                            </button>
                            {submission.status === 'draft' && (
                              <button
                                onClick={() => {
                                  handleSubmitForReview(submission.id);
                                  setOpenActionDropdownId(null);
                                }}
                                className="dropdown-btn primary btn-sm"
                                title="Submit for Review"
                              >
                                Submit
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
          )}
          
          {!submissionsLoading && submissions.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <div className="empty-state-title">No Submissions Found</div>
              <div className="empty-state-description">Create your first submission using the "New Submission" button above</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVivaTeams = () => (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">My Viva Teams</h1>
        <p className="page-subtitle">View your viva team assignments and examination status</p>
      </div>

      {/* Viva Teams Table */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Viva Team Assignments</h2>
          <span className="card-subtitle">{Array.isArray(vivaTeams) ? vivaTeams.length : 0} teams assigned</span>
        </div>
        {Array.isArray(vivaTeams) && vivaTeams.length > 0 ? (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Stage & Status</th>
                <th>Examiners</th>
                <th>Dates</th>
                <th>Location & Outcome</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vivaTeams.map(vivaTeam => (
                <tr key={vivaTeam.id}>
                  <td className="team-id"><strong>#{vivaTeam.id}</strong></td>
                  <td>
                    <div className="stage-status-info">
                      <div className="stage-info">
                        <span className={`status-badge stage-${vivaTeam.stage}`}>
                          {vivaTeam.stage.charAt(0).toUpperCase() + vivaTeam.stage.slice(1)}
                        </span>
                      </div>
                      <div className="status-info">
                        <span className={`status-badge viva-status-${vivaTeam.status}`}>
                          {vivaTeam.status === 'proposed' ? '📋' :
                           vivaTeam.status === 'approved' ? '✅' :
                           vivaTeam.status === 'rejected' ? '❌' :
                           vivaTeam.status === 'scheduled' ? '📅' :
                           vivaTeam.status === 'completed' ? '🎓' : '⏳'}
                          <span className="status-text">{vivaTeam.status}</span>
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
                  <td className="dates-cell">
                    <div className="dates-list">
                      <div className="date-item">
                        <span className="date-label">Proposed:</span>
                        <span className="date-value">
                          {vivaTeam.proposed_date ? new Date(vivaTeam.proposed_date).toLocaleDateString('en-GB') : 'N/A'}
                        </span>
                      </div>
                      <div className="date-item">
                        <span className="date-label">Scheduled:</span>
                        <span className="date-value">
                          {vivaTeam.scheduled_date ? new Date(vivaTeam.scheduled_date).toLocaleDateString('en-GB') : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="location-outcome-cell">
                    <div className="location-outcome-info">
                      <div className="location-info">
                        <strong>Location:</strong> <span className="location-text">{vivaTeam.location || 'TBD'}</span>
                      </div>
                      <div className="outcome-info">
                        <strong>Outcome:</strong> 
                        <span className={`outcome-badge ${vivaTeam.outcome ? 'has-outcome' : 'pending-outcome'}`}>
                          {vivaTeam.outcome || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="actions-cell">
                    <button 
                      onClick={() => {
                        setSelectedVivaTeam(vivaTeam);
                        setShowVivaTeamModal(true);
                      }}
                      className="btn secondary btn-sm"
                      title="View Details"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No Viva Teams Found</div>
            <div className="empty-state-description">Your supervisors will propose viva teams when you're ready for examination.</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'progress':
        return renderProgressTracking();
      case 'submissions':
        return renderSubmissions();
      case 'viva-teams':
        return renderVivaTeams();
      case 'profile':
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <div className="loading">Loading student dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {renderNavigation()}
      
      <main className="dashboard-main">
        {/* Main Header */}
        <div className="main-header">
          <h1 className="header-title">
            {activeSection === 'dashboard' && 'Student Dashboard'}
            {activeSection === 'progress' && 'Progress Tracking'}
            {activeSection === 'submissions' && 'Submissions'}
            {activeSection === 'registrations' && 'Registrations'}
            {activeSection === 'viva-teams' && 'Viva Teams'}
            {activeSection === 'profile' && 'Profile'}
          </h1>
          <div className="header-actions">
            <span>Welcome, {user?.first_name || user?.username}</span>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="main-content">
          {renderContent()}
        </div>
      </main>

      {/* All Supervisors Modal */}
      {showSupervisorModal && (
        <div className="modal-overlay show">
          <div className="modal-content large">
            <div className="modal-header">
              <h3 className="modal-title">All Available Supervisors</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowSupervisorModal(false);
                  setSelectedSupervisor(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allSupervisors.map(supervisor => (
                  <div 
                    key={supervisor.supervisor_id} 
                    className="dashboard-card clickable cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedSupervisor(supervisor)}
                  >
                    <h4 className="font-semibold">{supervisor.supervisor_name}</h4>
                    <p><strong>Email:</strong> {supervisor.email}</p>
                    <p><strong>Department:</strong> {supervisor.department}</p>
                    {supervisor.supervisor_notes && (
                      <p><strong>Notes:</strong> {supervisor.supervisor_notes}</p>
                    )}
                    <p><strong>Added:</strong> {new Date(supervisor.created_date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
              
              {allSupervisors.length === 0 && (
                <div className="no-data">
                  No supervisors available.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => {
                  setShowSupervisorModal(false);
                  setSelectedSupervisor(null);
                }}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viva Team Detail Modal */}
      {showVivaTeamModal && selectedVivaTeam && (
        <div className="modal-overlay show" onClick={() => {
          setShowVivaTeamModal(false);
          setSelectedVivaTeam(null);
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Viva Team Details</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowVivaTeamModal(false);
                  setSelectedVivaTeam(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-content">
                <div className="detail-row">
                  <strong>Team ID:</strong> {selectedVivaTeam.id}
                </div>
                <div className="detail-row">
                  <strong>Student Number:</strong> {selectedVivaTeam.student_number}
                </div>
                <div className="detail-row">
                  <strong>Stage:</strong> <span className={`status stage-${selectedVivaTeam.stage}`}>
                    {selectedVivaTeam.stage.charAt(0).toUpperCase() + selectedVivaTeam.stage.slice(1)}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Status:</strong> <span className={`status ${selectedVivaTeam.status}`}>
                    {selectedVivaTeam.status === 'proposed' ? '📋 Proposed' :
                     selectedVivaTeam.status === 'approved' ? '✅ Approved' :
                     selectedVivaTeam.status === 'rejected' ? '❌ Rejected' :
                     selectedVivaTeam.status === 'scheduled' ? '📅 Scheduled' :
                     selectedVivaTeam.status === 'completed' ? '🎓 Completed' :
                     selectedVivaTeam.status}
                  </span>
                </div>
                
                <div className="detail-section">
                  <h4>Examiner Information</h4>
                  <div className="detail-row">
                    <strong>Internal Examiner 1 ID:</strong> {selectedVivaTeam.internal_examiner_1_id || 'Not assigned'}
                  </div>
                  <div className="detail-row">
                    <strong>Internal Examiner 2 ID:</strong> {selectedVivaTeam.internal_examiner_2_id || 'Not assigned'}
                  </div>
                  <div className="detail-row">
                    <strong>External Examiner Name:</strong> {selectedVivaTeam.external_examiner_name || 'Not assigned'}
                  </div>
                  <div className="detail-row">
                    <strong>External Examiner Email:</strong> {selectedVivaTeam.external_examiner_email || 'Not provided'}
                  </div>
                  <div className="detail-row">
                    <strong>External Examiner Institution:</strong> {selectedVivaTeam.external_examiner_institution || 'Not provided'}
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Scheduling Information</h4>
                  <div className="detail-row">
                    <strong>Proposed Date:</strong> {selectedVivaTeam.proposed_date ? new Date(selectedVivaTeam.proposed_date).toLocaleDateString() : 'Not set'}
                  </div>
                  <div className="detail-row">
                    <strong>Scheduled Date:</strong> {selectedVivaTeam.scheduled_date ? new Date(selectedVivaTeam.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                  </div>
                  <div className="detail-row">
                    <strong>Actual Date:</strong> {selectedVivaTeam.actual_date ? new Date(selectedVivaTeam.actual_date).toLocaleDateString() : 'Not completed'}
                  </div>
                  <div className="detail-row">
                    <strong>Location:</strong> {selectedVivaTeam.location || 'Not specified'}
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Results & Outcome</h4>
                  <div className="detail-row">
                    <strong>Outcome:</strong> {selectedVivaTeam.outcome || 'Pending'}
                  </div>
                  <div className="detail-row">
                    <strong>Outcome Notes:</strong> {selectedVivaTeam.outcome_notes || 'No notes available'}
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Administrative Information</h4>
                  <div className="detail-row">
                    <strong>Proposed By:</strong> User ID: {selectedVivaTeam.proposed_by || 'Unknown'}
                  </div>
                  <div className="detail-row">
                    <strong>Approved By:</strong> User ID: {selectedVivaTeam.approved_by || 'Not approved yet'}
                  </div>
                  <div className="detail-row">
                    <strong>Approval Date:</strong> {selectedVivaTeam.approval_date ? new Date(selectedVivaTeam.approval_date).toLocaleString() : 'Not approved yet'}
                  </div>
                  <div className="detail-row">
                    <strong>Created Date:</strong> {selectedVivaTeam.created_date ? new Date(selectedVivaTeam.created_date).toLocaleString() : 'Unknown'}
                  </div>
                  <div className="detail-row">
                    <strong>Last Updated:</strong> {selectedVivaTeam.updated_date ? new Date(selectedVivaTeam.updated_date).toLocaleString() : 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => {
                  setShowVivaTeamModal(false);
                  setSelectedVivaTeam(null);
                }}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Submission Modal */}
      {showCreateSubmissionModal && (
        <div className="modal-overlay show" onClick={() => {
          setShowCreateSubmissionModal(false);
          setSubmissionForm({
            submission_type: 'THESIS',
            status: 'DRAFT',
            title: '',
            description: '',
            date_expected: '',
            submission_notes: ''
          });
          setSubmissionError('');
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Submission</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowCreateSubmissionModal(false);
                  setSubmissionForm({
                    submission_type: 'THESIS',
                    status: 'DRAFT',
                    title: '',
                    description: '',
                    date_expected: '',
                    submission_notes: ''
                  });
                  setSubmissionError('');
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {submissionError && (
                <div className="error-message">
                  {submissionError}
                </div>
              )}
              
              <form onSubmit={handleCreateSubmission}>
                <div className="form-group">
                  <label className="form-label">Submission Type: *</label>
                  <select
                    className="form-input"
                    value={submissionForm.submission_type}
                    onChange={(e) => setSubmissionForm({...submissionForm, submission_type: e.target.value})}
                    required
                  >
                    <option value="REGISTRATION">Registration</option>
                    <option value="VIVA_DOCUMENT">Viva Document</option>
                    <option value="THESIS">Thesis</option>
                    <option value="CORRECTION">Correction</option>
                    <option value="ANNUAL_REPORT">Annual Report</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status: *</label>
                  <select
                    className="form-input"
                    value={submissionForm.status}
                    onChange={(e) => setSubmissionForm({...submissionForm, status: e.target.value})}
                    required
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="REVISION_REQUIRED">Revision Required</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Title: *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={submissionForm.title}
                    onChange={(e) => setSubmissionForm({...submissionForm, title: e.target.value})}
                    required
                    placeholder="Enter submission title"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description: *</label>
                  <textarea
                    className="form-input"
                    value={submissionForm.description}
                    onChange={(e) => setSubmissionForm({...submissionForm, description: e.target.value})}
                    required
                    placeholder="Enter submission description"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expected Date:</label>
                  <input
                    type="date"
                    className="form-input"
                    value={submissionForm.date_expected}
                    onChange={(e) => setSubmissionForm({...submissionForm, date_expected: e.target.value})}
                    placeholder="Select expected date"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Submission Notes:</label>
                  <textarea
                    className="form-input"
                    value={submissionForm.submission_notes}
                    onChange={(e) => setSubmissionForm({...submissionForm, submission_notes: e.target.value})}
                    placeholder="Add any additional notes (optional)"
                    rows="3"
                  />
                </div>
              </form>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button"
                onClick={() => {
                  setShowCreateSubmissionModal(false);
                  setSubmissionForm({
                    submission_type: 'THESIS',
                    status: 'DRAFT',
                    title: '',
                    description: '',
                    date_expected: '',
                    submission_notes: ''
                  });
                  setSubmissionError('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                onClick={handleCreateSubmission}
              >
                Create Submission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileUploadModal && selectedSubmission && (
        <div className="modal-overlay show" onClick={() => {
          setShowFileUploadModal(false);
          setSelectedSubmission(null);
          setUploadFile(null);
          setSubmissionError('');
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Upload File for "{selectedSubmission.title}"</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowFileUploadModal(false);
                  setSelectedSubmission(null);
                  setUploadFile(null);
                  setSubmissionError('');
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {submissionError && (
                <div className="error-message">
                  {submissionError}
                </div>
              )}
              
              <form onSubmit={handleFileUpload}>
                <div className="form-group">
                  <label className="form-label">Select File:</label>
                  <input
                    type="file"
                    className="form-input"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    required
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  />
                  <small className="form-help">
                    Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG
                  </small>
                </div>
                
                {uploadFile && (
                  <div className="file-preview">
                    <div className="detail-item">
                      <label>Selected File:</label>
                      <span>{uploadFile.name}</span>
                    </div>
                    <div className="detail-item">
                      <label>File Size:</label>
                      <span>{Math.round(uploadFile.size / 1024)} KB</span>
                    </div>
                  </div>
                )}
              </form>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button"
                onClick={() => {
                  setShowFileUploadModal(false);
                  setSelectedSubmission(null);
                  setUploadFile(null);
                  setSubmissionError('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                onClick={handleFileUpload}
                disabled={!uploadFile}
              >
                Upload File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Detail Modal */}
      {showSubmissionDetailModal && selectedSubmission && (
        <div className="modal-overlay show" onClick={() => {
          setShowSubmissionDetailModal(false);
          setSelectedSubmission(null);
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Submission Details - ID #{selectedSubmission.id}</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowSubmissionDetailModal(false);
                  setSelectedSubmission(null);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-content">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-row">
                    <strong>ID:</strong> #{selectedSubmission.id}
                  </div>
                  <div className="detail-row">
                    <strong>Student Number:</strong> {selectedSubmission.student_number}
                  </div>
                  <div className="detail-row">
                    <strong>Title:</strong> {selectedSubmission.title}
                  </div>
                  <div className="detail-row">
                    <strong>Type:</strong> <span className="submission-type">
                      {selectedSubmission.submission_type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Description:</strong> <span className="submission-description">
                      {selectedSubmission.description || 'No description provided'}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Status & Timeline</h4>
                  <div className="detail-row">
                    <strong>Current Status:</strong> <span className={`status status-${selectedSubmission.status}`}>
                      {selectedSubmission.status === 'draft' && '📝 Draft'}
                      {selectedSubmission.status === 'submitted' && '📤 Submitted'}
                      {selectedSubmission.status === 'under_review' && '🔍 Under Review'}
                      {selectedSubmission.status === 'approved' && '✅ Approved'}
                      {selectedSubmission.status === 'rejected' && '❌ Rejected'}
                      {selectedSubmission.status === 'revision_required' && '🔄 Revision Required'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Submission Date:</strong> {selectedSubmission.submission_date 
                      ? new Date(selectedSubmission.submission_date).toLocaleString()
                      : 'Not submitted yet'
                    }
                  </div>
                  <div className="detail-row">
                    <strong>Review Deadline:</strong> {selectedSubmission.review_deadline 
                      ? new Date(selectedSubmission.review_deadline).toLocaleDateString()
                      : 'Not set'
                    }
                  </div>
                  <div className="detail-row">
                    <strong>Created Date:</strong> {new Date(selectedSubmission.created_date).toLocaleString()}
                  </div>
                  <div className="detail-row">
                    <strong>Last Updated:</strong> {new Date(selectedSubmission.updated_date).toLocaleString()}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>File Information</h4>
                  {selectedSubmission.file_name ? (
                    <>
                      <div className="detail-row">
                        <strong>File Name:</strong> <span className="file-name">📄 {selectedSubmission.file_name}</span>
                      </div>
                      <div className="detail-row">
                        <strong>File Size:</strong> {selectedSubmission.file_size 
                          ? `${Math.round(selectedSubmission.file_size / 1024)} KB` 
                          : 'Unknown'
                        }
                      </div>
                      <div className="detail-row">
                        <strong>File Type:</strong> {selectedSubmission.mime_type || 'Unknown'}
                      </div>
                      <div className="detail-row">
                        <strong>File Path:</strong> <span className="file-path">{selectedSubmission.file_path}</span>
                      </div>
                    </>
                  ) : (
                    <div className="no-file-info">
                      <p>No file uploaded yet</p>
                      {selectedSubmission.status === 'draft' && (
                        <button 
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowSubmissionDetailModal(false);
                            setShowFileUploadModal(true);
                          }}
                        >
                          Upload File
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="detail-section">
                  <h4>Review Information</h4>
                  <div className="detail-row">
                    <strong>Reviewed By:</strong> {selectedSubmission.reviewed_by 
                      ? `User ID: ${selectedSubmission.reviewed_by}` 
                      : 'Not reviewed yet'
                    }
                  </div>
                  <div className="detail-row">
                    <strong>Review Date:</strong> {selectedSubmission.review_date 
                      ? new Date(selectedSubmission.review_date).toLocaleString()
                      : 'Not reviewed yet'
                    }
                  </div>
                  <div className="detail-row">
                    <strong>Review Comments:</strong> <span className="review-comments">
                      {selectedSubmission.review_comments || 'No comments provided'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => {
                  setShowSubmissionDetailModal(false);
                  setSelectedSubmission(null);
                }}
                className="btn btn-secondary"
              >
                Close
              </button>
              
              {selectedSubmission.status === 'draft' && (
                <>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowSubmissionDetailModal(false);
                      setShowFileUploadModal(true);
                    }}
                  >
                    Upload File
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setShowSubmissionDetailModal(false);
                      handleSubmitForReview(selectedSubmission.id);
                    }}
                    disabled={!selectedSubmission.file_name}
                  >
                    Submit for Review
                  </button>
                </>
              )}
              
              {selectedSubmission.status === 'revision_required' && (
                <>
                  <button 
                    className="btn btn-warning"
                    onClick={() => {
                      setShowSubmissionDetailModal(false);
                      setShowFileUploadModal(true);
                    }}
                  >
                    Upload Revision
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setShowSubmissionDetailModal(false);
                      handleSubmitForReview(selectedSubmission.id);
                    }}
                  >
                    Resubmit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stage-Specific Submission Modal */}
      {showStageSubmissionModal && (
        <div className="modal-overlay show" onClick={() => {
          setShowStageSubmissionModal(false);
          setSubmissionForm({
            submission_type: 'thesis',
            title: '',
            description: ''
          });
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Submission Details</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowStageSubmissionModal(false);
                  setSubmissionForm({
                    submission_type: 'thesis',
                    title: '',
                    description: ''
                  });
                  setSubmissionError('');
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {submissionError && (
                <div className="error-message">
                  {submissionError}
                </div>
              )}
              
              <form onSubmit={handleCreateSubmission}>
                <div className="form-group">
                  <label className="form-label">Submission Type:</label>
                  <select
                    className="form-input"
                    value={submissionForm.submission_type}
                    onChange={(e) => setSubmissionForm({...submissionForm, submission_type: e.target.value})}
                    required
                  >
                    <option value="registration">Registration</option>
                    <option value="viva_document">Viva Document</option>
                    <option value="thesis">Thesis</option>
                    <option value="correction">Correction</option>
                    <option value="annual_report">Annual Report</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Title:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={submissionForm.title}
                    onChange={(e) => setSubmissionForm({...submissionForm, title: e.target.value})}
                    required
                    placeholder="Enter submission title"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description:</label>
                  <textarea
                    className="form-input"
                    value={submissionForm.description}
                    onChange={(e) => setSubmissionForm({...submissionForm, description: e.target.value})}
                    required
                    placeholder="Enter submission description"
                    rows="4"
                  />
                </div>
              </form>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button"
                onClick={() => {
                  setShowStageSubmissionModal(false);
                  setSubmissionForm({
                    submission_type: 'registration',
                    title: '',
                    description: ''
                  });
                  setSubmissionError('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                onClick={handleCreateSubmission}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
