import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI, supervisorAPI, assignmentAPI, registrationAPI, authAPI, vivaTeamAPI, submissionAPI } from '../utils/api';
import '../styles/dashboard.css';
import '../styles/student-dashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Student data states
  const [studentData, setStudentData] = useState(null);
  const [studentSupervisors, setStudentSupervisors] = useState([]);
  const [studentRegistration, setStudentRegistration] = useState(null);
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
  
  // Extension request state
  const [extensionRequest, setExtensionRequest] = useState({
    extension_days: '',
    reason: ''
  });
  
  // Submission states
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [showCreateSubmissionModal, setShowCreateSubmissionModal] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [showSubmissionDetailModal, setShowSubmissionDetailModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionForm, setSubmissionForm] = useState({
    submission_type: 'registration',
    title: '',
    description: ''
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [submissionError, setSubmissionError] = useState('');
  
  // Progress tracking states
  const [currentStage, setCurrentStage] = useState('registration');
  const [showStageSubmissionModal, setShowStageSubmissionModal] = useState(false);
  const [stageSubmissionType, setStageSubmissionType] = useState('registration');
  
  // Registration states
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationFilters, setRegistrationFilters] = useState({
    status: '',
    limit: 100
  });
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [extensionError, setExtensionError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal states
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [showVivaTeamModal, setShowVivaTeamModal] = useState(false);
  const [selectedVivaTeam, setSelectedVivaTeam] = useState(null);

  useEffect(() => {
    fetchStudentData();
    fetchUserProfile();
  }, []);

  // Refetch registrations when filters change
  useEffect(() => {
    if (activeSection === 'registrations') {
      fetchRegistrations();
    }
  }, [registrationFilters, activeSection]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get student details using the student number from user context
      const studentResponse = await studentAPI.getStudentByNumber(user.username);
      setStudentData(studentResponse);
      
      // Get student supervisors
      const supervisorsResponse = await assignmentAPI.getStudentSupervisors(user.username);
      setStudentSupervisors(supervisorsResponse);
      
      // Get student registration
      const registrationResponse = await registrationAPI.getRegistrationByStudent(user.username);
      setStudentRegistration(registrationResponse);
      
      // Get all supervisors for reference
      const allSupervisorsResponse = await supervisorAPI.getAllSupervisors();
      setAllSupervisors(allSupervisorsResponse);
      
      // Get student viva teams
      const vivaTeamsResponse = await vivaTeamAPI.getAll({ student_number: user.username });
      setVivaTeams(vivaTeamsResponse);
      
      // Get student submissions
      await fetchSubmissions();
      
      // Get student registrations
      await fetchRegistrations();
      
    } catch (err) {
      setError(err.message || 'Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const submissionsResponse = await submissionAPI.getSubmissions(user.username);
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
      setProfileError('');
      setSuccessMessage('');
      
      await authAPI.updateProfile(profileData);
      setSuccessMessage('Profile updated successfully!');
      
      // Refresh profile data
      await fetchUserProfile();
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
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
    }
  };

  // Registration functions
  const fetchRegistrations = async () => {
    try {
      setRegistrationsLoading(true);
      const response = await registrationAPI.getAllRegistrations(
        0, 
        registrationFilters.limit, 
        user.username, // Use current user's username as student_number
        registrationFilters.status
      );
      setRegistrations(response || []);
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
      setError('Failed to fetch registrations: ' + (err.message || 'Unknown error'));
      setRegistrations([]);
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const handleRegistrationFilterChange = (filterName, value) => {
    setRegistrationFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleExtensionRequest = async () => {
    try {
      setExtensionError('');
      setSuccessMessage('');
      
      if (!extensionRequest.extension_days || !extensionRequest.reason) {
        setExtensionError('Please fill in all fields');
        return;
      }
      
      if (extensionRequest.extension_days < 1 || extensionRequest.extension_days > 365) {
        setExtensionError('Extension days must be between 1 and 365');
        return;
      }
      
      await registrationAPI.requestExtension(
        studentRegistration.registration_id,
        parseInt(extensionRequest.extension_days),
        extensionRequest.reason
      );
      
      setSuccessMessage('Extension request submitted successfully!');
      setShowExtensionModal(false);
      setExtensionRequest({ extension_days: '', reason: '' });
      
      // Refresh registration data
      const registrationResponse = await registrationAPI.getRegistrationByStudent(user.username);
      setStudentRegistration(registrationResponse);
      
    } catch (err) {
      setExtensionError(err.message || 'Failed to submit extension request');
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
        student_number: user.username,
        submission_type: submissionForm.submission_type,
        title: submissionForm.title,
        description: submissionForm.description
      };
      
      const newSubmission = await submissionAPI.createSubmission(submissionData);
      setSuccessMessage('Submission created successfully!');
      setShowCreateSubmissionModal(false);
      setSubmissionForm({
        submission_type: 'registration',
        title: '',
        description: ''
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
      return stage === 'registration' ? 'In Progress' : 'Pending';
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
    
    return stage === 'registration' ? 'In Progress' : 'Pending';
  };
  
  const getStageSubmissions = (submissionType) => {
    return submissions.filter(s => s.submission_type === submissionType);
  };
  
  const getStageDeadline = (stage) => {
    const deadlines = {
      registration: 'September 15, 2024',
      progression: 'March 2025',
      final: 'September 2025'
    };
    return deadlines[stage] || 'Not set';
  };
  
  const getSubmissionTypeForStage = (stage) => {
    const typeMap = {
      registration: 'registration',
      progression: 'annual_report',
      final: 'thesis'
    };
    return typeMap[stage] || 'registration';
  };
  
  const handleStageSubmissionCreate = async (stage) => {
    // Reset form to default values
    setSubmissionForm({
      submission_type: 'registration',
      title: '',
      description: ''
    });
    setShowStageSubmissionModal(true);
  };

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

      <aside className={`student-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="student-sidebar-header">
          <h2>Student Portal</h2>
          <span className="user-info">Welcome, {user?.first_name || user?.username}</span>
          {/* Mobile Close Button */}
          <button 
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
      
      <nav className="student-sidebar-nav">
        <button 
          className={`student-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('dashboard');
            setSidebarOpen(false);
          }}
        >
          <span className="student-nav-icon">📊</span>
          <span className="student-nav-label">Dashboard</span>
        </button>
        <button 
          className={`student-nav-item ${activeSection === 'progress' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('progress');
            setSidebarOpen(false);
          }}
        >
          <span className="student-nav-icon">🎯</span>
          <span className="student-nav-label">Progress Tracking</span>
        </button>
        <button 
          className={`student-nav-item ${activeSection === 'submissions' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('submissions');
            setSidebarOpen(false);
          }}
        >
          <span className="student-nav-icon">📝</span>
          <span className="student-nav-label">Submissions</span>
        </button>
        <button 
          className={`student-nav-item ${activeSection === 'registrations' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('registrations');
            setSidebarOpen(false);
          }}
        >
          <span className="student-nav-icon">📋</span>
          <span className="student-nav-label">Registrations</span>
        </button>
        <button 
          className={`student-nav-item ${activeSection === 'viva-teams' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('viva-teams');
            setSidebarOpen(false);
          }}
        >
          <span className="student-nav-icon">🎓</span>
          <span className="student-nav-label">Viva Teams</span>
        </button>
        <button 
          className={`student-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => {
            setActiveSection('profile');
            setSidebarOpen(false);
          }}
        >
          <span className="student-nav-icon">👤</span>
          <span className="student-nav-label">Profile</span>
        </button>
      </nav>
      
      <div className="student-sidebar-footer">
        <button className="student-logout-btn" onClick={logout}>
          <span className="student-nav-icon">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );

  const renderDashboard = () => (
    <div className="student-dashboard-content">
      <h1>Student Dashboard</h1>
      <p>Track your academic progress and manage your research journey.</p>
      
      <div className="student-info-grid">
        <div className="student-info-card">
          <h3>Registration Status</h3>
          <div className="student-info-value">
            {studentRegistration?.registration_status === 'approved' ? '✅ Approved' :
             studentRegistration?.registration_status === 'pending' ? '⏳ Pending' :
             studentRegistration?.registration_status === 'rejected' ? '❌ Rejected' :
             studentRegistration?.registration_status || 'Not Available'}
          </div>
          <div className={`student-info-status ${
            studentRegistration?.registration_status === 'approved' ? 'student-status-active' :
            studentRegistration?.registration_status === 'pending' ? 'student-status-pending' :
            'student-status-inactive'
          }`}>
            {studentRegistration?.registration_status || 'Unknown'}
          </div>
        </div>
        
        <div className="student-info-card">
          <h3>Assigned Supervisors</h3>
          <div className="student-info-value">{studentSupervisors.length}</div>
          <div className="student-info-status student-status-active">
            {studentSupervisors.length > 0 ? 'Assigned' : 'None'}
          </div>
        </div>
        
        <div className="student-info-card">
          <h3>Viva Teams</h3>
          <div className="student-info-value">{vivaTeams.length}</div>
          <div className="student-info-status student-status-active">
            {vivaTeams.length > 0 ? 'Available' : 'None'}
          </div>
        </div>
        
        <div className="student-info-card">
          <h3>Course Code</h3>
          <div className="student-info-value">{studentData?.course_code || 'N/A'}</div>
          <div className="student-info-status student-status-active">
            {studentData?.course_code ? 'Enrolled' : 'Not Set'}
          </div>
        </div>
      </div>

      {/* Student Information */}
      <div className="info-section">
        <h2>Personal Information</h2>
        {studentData && (
          <div className="info-grid">
            <div className="info-item">
              <label>Student Number:</label>
              <span>{studentData.student_number}</span>
            </div>
            <div className="info-item">
              <label>Name:</label>
              <span>{studentData.forename} {studentData.surname}</span>
            </div>
            <div className="info-item">
              <label>Cohort:</label>
              <span>{studentData.cohort}</span>
            </div>
            <div className="info-item">
              <label>Course Code:</label>
              <span>{studentData.course_code}</span>
            </div>
            <div className="info-item">
              <label>Programme of Study:</label>
              <span>{studentData.programme_of_study}</span>
            </div>
            <div className="info-item">
              <label>Mode:</label>
              <span>{studentData.mode}</span>
            </div>
            <div className="info-item">
              <label>Subject Area:</label>
              <span>{studentData.subject_area}</span>
            </div>
            <div className="info-item">
              <label>International Student:</label>
              <span>{studentData.international_student ? 'Yes' : 'No'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Registration Information */}
      <div className="info-section">
        <div className="section-header">
          <h2>Registration Information</h2>
          {studentRegistration && studentRegistration.registration_status !== 'approved' && (
            <button 
              onClick={() => setShowExtensionModal(true)}
              className="btn btn-primary"
            >
              Request Extension
            </button>
          )}
        </div>
        {studentRegistration && (
          <div className="info-grid">
            <div className="info-item">
              <label>Status:</label>
              <span className={`status ${studentRegistration.registration_status}`}>
                {studentRegistration.registration_status === 'approved' ? '✅ Approved' :
                 studentRegistration.registration_status === 'pending' ? '⏳ Pending' :
                 studentRegistration.registration_status === 'rejected' ? '❌ Rejected' :
                 studentRegistration.registration_status}
              </span>
            </div>
            <div className="info-item">
              <label>Original Deadline:</label>
              <span>{studentRegistration.original_registration_deadline ? 
                new Date(studentRegistration.original_registration_deadline).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Revised Deadline:</label>
              <span>{studentRegistration.revised_registration_deadline ? 
                new Date(studentRegistration.revised_registration_deadline).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Extension Length:</label>
              <span>{studentRegistration.registration_extension_length_days || 0} days</span>
            </div>
            <div className="info-item">
              <label>Process Completed:</label>
              <span>{studentRegistration.pgr_registration_process_completed ? 'Yes' : 'No'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Supervisors */}
      <div className="info-section">
        <div className="section-header">
          <h2>My Supervisors</h2>
          <button 
            onClick={() => setShowSupervisorModal(true)}
            className="btn btn-secondary"
          >
            View All Supervisors
          </button>
        </div>
        <div className="supervisors-list">
          {studentSupervisors.map(supervision => {
            const supervisor = allSupervisors.find(s => s.supervisor_id === supervision.supervisor_id);
            return (
              <div key={supervision.student_supervisor_id} className="supervisor-card">
                <div className="supervisor-info">
                  <h4>{supervisor?.supervisor_name || `Supervisor ID: ${supervision.supervisor_id}`}</h4>
                  <p><strong>Role:</strong> {supervision.role}</p>
                  <p><strong>Email:</strong> {supervisor?.email || 'N/A'}</p>
                  <p><strong>Department:</strong> {supervisor?.department || 'N/A'}</p>
                  <p><strong>Start Date:</strong> {new Date(supervision.start_date).toLocaleDateString()}</p>
                  {supervision.end_date && (
                    <p><strong>End Date:</strong> {new Date(supervision.end_date).toLocaleDateString()}</p>
                  )}
                  {supervision.supervision_notes && (
                    <p><strong>Notes:</strong> {supervision.supervision_notes}</p>
                  )}
                </div>
              </div>
            );
          })}
          
          {studentSupervisors.length === 0 && (
            <div className="no-data">
              No supervisors assigned yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRegistrations = () => (
    <div className="student-dashboard-content">
      <div className="section-header">
        <h1>My Registrations</h1>
        <p>View your registration history and status updates.</p>
      </div>
      
      {/* Filters */}
      <div className="registrations-filters">
        <div className="filter-group">
          <label>Status:</label>
          <select
            value={registrationFilters.status}
            onChange={(e) => handleRegistrationFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Limit:</label>
          <select
            value={registrationFilters.limit}
            onChange={(e) => handleRegistrationFilterChange('limit', parseInt(e.target.value))}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
        <button 
          className="btn btn-primary"
          onClick={fetchRegistrations}
        >
          Refresh
        </button>
      </div>
      
      {/* Registrations Table */}
      <div className="registrations-container">
        {registrationsLoading ? (
          <div className="loading">Loading registrations...</div>
        ) : (
          <div className="registrations-table-wrapper">
            <table className="registrations-table-optimized">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Deadlines</th>
                  <th>Extension Info</th>
                  <th>Process</th>
                  <th>Timeline</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(registrations) && registrations.length > 0 ? (
                  registrations.map((registration) => (
                    <tr key={registration.registration_id}>
                      <td className="reg-id">#{registration.registration_id}</td>
                      <td className="reg-status">
                        <span className={`status-badge reg-status-${registration.registration_status}`}>
                          {registration.registration_status === 'approved' ? '✅' :
                           registration.registration_status === 'pending' ? '⏳' :
                           registration.registration_status === 'rejected' ? '❌' : '❓'}
                          <span className="status-text">{registration.registration_status}</span>
                        </span>
                      </td>
                      <td className="reg-deadlines">
                        <div className="deadlines-info">
                          <div className="deadline-item">
                            <span className="deadline-label">Original:</span>
                            <span className="deadline-value">
                              {registration.original_registration_deadline 
                                ? new Date(registration.original_registration_deadline).toLocaleDateString('en-GB')
                                : 'N/A'
                              }
                            </span>
                          </div>
                          <div className="deadline-item">
                            <span className="deadline-label">Revised:</span>
                            <span className="deadline-value">
                              {registration.revised_registration_deadline 
                                ? new Date(registration.revised_registration_deadline).toLocaleDateString('en-GB')
                                : 'N/A'
                              }
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="reg-extension">
                        <div className="extension-info">
                          <div className="extension-item">
                            <span className="extension-label">Days:</span>
                            <span className="extension-value">
                              {registration.registration_extension_length_days || 0}
                            </span>
                          </div>
                          <div className="extension-item">
                            <span className="extension-label">Requested:</span>
                            <span className="extension-value">
                              {registration.registration_extension_request_date 
                                ? new Date(registration.registration_extension_request_date).toLocaleDateString('en-GB')
                                : 'N/A'
                              }
                            </span>
                          </div>
                          <div className="extension-item">
                            <span className="extension-label">Approved:</span>
                            <span className="extension-value">
                              {registration.date_of_registration_extension_approval 
                                ? new Date(registration.date_of_registration_extension_approval).toLocaleDateString('en-GB')
                                : 'N/A'
                              }
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="reg-process">
                        <span className={`process-badge ${registration.pgr_registration_process_completed ? 'completed' : 'incomplete'}`}>
                          {registration.pgr_registration_process_completed ? '✅ Done' : '⏳ Progress'}
                        </span>
                      </td>
                      <td className="reg-timeline">
                        <div className="timeline-info">
                          <div className="timeline-item">
                            <span className="timeline-label">Created:</span>
                            <span className="timeline-value">
                              {new Date(registration.created_date).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                          <div className="timeline-item">
                            <span className="timeline-label">Updated:</span>
                            <span className="timeline-value">
                              {new Date(registration.updated_date).toLocaleDateString('en-GB')}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No registrations found. Your registration data will appear here once available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Registration Summary */}
      {Array.isArray(registrations) && registrations.length > 0 && (
        <div className="registrations-summary">
          <h3>Registration Summary</h3>
          <div className="summary-stats">
            <div className="stat-card">
              <div className="stat-value">{registrations.length}</div>
              <div className="stat-label">Total Registrations</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {registrations.filter(r => r.registration_status === 'approved').length}
              </div>
              <div className="stat-label">Approved</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {registrations.filter(r => r.registration_status === 'pending').length}
              </div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {registrations.filter(r => r.pgr_registration_process_completed).length}
              </div>
              <div className="stat-label">Completed Processes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="profile-content">
      <div className="profile-header">
        <h1>Profile Management</h1>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {/* Profile Update Form */}
      <div className="profile-section">
        <h2>Update Profile</h2>
        {profileError && (
          <div className="error-message">
            {profileError}
          </div>
        )}
        
        <form onSubmit={handleProfileUpdate} className="profile-form">
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => setProfileData({...profileData, username: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>First Name:</label>
              <input
                type="text"
                value={profileData.first_name}
                onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Last Name:</label>
              <input
                type="text"
                value={profileData.last_name}
                onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Department:</label>
            <input
              type="text"
              value={profileData.department}
              onChange={(e) => setProfileData({...profileData, department: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="tel"
              value={profileData.phone_number}
              onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={profileData.is_active}
                onChange={(e) => setProfileData({...profileData, is_active: e.target.checked})}
              />
              Active Account
            </label>
          </div>
          
          <button type="submit" className="btn btn-primary">
            Update Profile
          </button>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="profile-section">
        <h2>Change Password</h2>
        {passwordError && (
          <div className="error-message">
            {passwordError}
          </div>
        )}
        
        <form onSubmit={handlePasswordChange} className="password-form">
          <div className="form-group">
            <label>Current Password:</label>
            <input
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
              required
              minLength="6"
            />
          </div>
          
          <button type="submit" className="btn btn-primary">
            Change Password
          </button>
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
        description: 'Complete initial registration and submit required documents',
        icon: '📋'
      },
      {
        key: 'progression',
        title: 'Progression', 
        submissionType: 'annual_report',
        description: 'Submit annual progress reports and continue research',
        icon: '📊'
      },
      {
        key: 'final',
        title: 'Final',
        submissionType: 'thesis',
        description: 'Final dissertation submission and viva examination',
        icon: '🎓'
      }
    ];

    return (
      <div className="student-dashboard-content">
        <div className="section-header">
          <h1>Academic Progress Tracking</h1>
          <p>Track your progression through registration, progression, and final stages</p>
        </div>

        <div className="progress-tracker-container">
          {/* Progress Timeline */}
          <div className="progress-timeline">
            {stages.map((stage, index) => {
              const status = getStageStatus(stage.key);
              const isCompleted = status === 'Completed';
              const isCurrent = !isCompleted && (
                stage.key === 'registration' || 
                (stage.key === 'progression' && getStageStatus('registration') === 'Completed') ||
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
                    <span className={`timeline-status status-${status.toLowerCase().replace(' ', '-')}`}>
                      {status}
                    </span>
                  </div>
                  {index < stages.length - 1 && (
                    <div className={`timeline-connector ${isCompleted ? 'completed' : ''}`}></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Stage Cards */}
          <div className="stages-grid">
            {stages.map((stage, index) => {
              const status = getStageStatus(stage.key);
              const stageSubmissions = getStageSubmissions(stage.submissionType);
              const stageVivaTeams = vivaTeams.filter(vt => vt.stage === stage.key);
              
              const isAvailable = stage.key === 'registration' || 
                (stage.key === 'progression' && getStageStatus('registration') === 'Completed') ||
                (stage.key === 'final' && getStageStatus('progression') === 'Completed');
              
              return (
                <div key={stage.key} className={`progress-stage-card ${status.toLowerCase().replace(' ', '-')} ${!isAvailable ? 'locked' : ''}`}>
                  <div className="stage-card-header">
                    <div className="stage-icon-large">{stage.icon}</div>
                    <div className="stage-title-section">
                      <h3>{stage.title} Stage</h3>
                      <p className="stage-description">{stage.description}</p>
                    </div>
                    <div className="stage-status-badge">
                      <span className={`status-indicator status-${status.toLowerCase().replace(' ', '-')}`}>
                        {status === 'In Progress' && '🔄'}
                        {status === 'Viva Proposed' && '📋'}
                        {status === 'Viva Approved' && '✅'}
                        {status === 'Completed' && '🎓'}
                        {status === 'Pending' && '⏳'}
                        <span className="status-text">{status}</span>
                      </span>
                    </div>
                  </div>
                  
                  {isAvailable ? (
                    <div className="stage-card-content">
                      {/* Viva Team Section */}
                      <div className="stage-info-section">
                        <div className="section-header-mini">
                          <h4>🎯 Viva Team</h4>
                          <span className="section-count">{stageVivaTeams.length}</span>
                        </div>
                        {stageVivaTeams.length > 0 ? (
                          <div className="viva-teams-mini">
                            {stageVivaTeams.map(vivaTeam => (
                              <div key={vivaTeam.id} className="viva-team-mini">
                                <div className="viva-mini-status">
                                  <span className={`mini-badge viva-status-${vivaTeam.status}`}>
                                    {vivaTeam.status === 'proposed' && '📋'}
                                    {vivaTeam.status === 'approved' && '✅'}
                                    {vivaTeam.status === 'rejected' && '❌'}
                                    {vivaTeam.status === 'scheduled' && '📅'}
                                    {vivaTeam.status === 'completed' && '🎓'}
                                    {vivaTeam.status}
                                  </span>
                                </div>
                                {vivaTeam.scheduled_date && (
                                  <div className="viva-mini-date">
                                    📅 {new Date(vivaTeam.scheduled_date).toLocaleDateString('en-GB')}
                                  </div>
                                )}
                                {vivaTeam.outcome && (
                                  <div className={`viva-mini-outcome outcome-${vivaTeam.outcome}`}>
                                    {vivaTeam.outcome === 'pass' ? '✅ Passed' : '❌ Failed'}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="empty-state-mini">
                            <span className="empty-icon">👥</span>
                            <span className="empty-text">No viva team assigned</span>
                          </div>
                        )}
                      </div>

                      {/* Submissions Section */}
                      <div className="stage-info-section">
                        <div className="section-header-mini">
                          <h4>📄 Documents</h4>
                          <span className="section-count">{stageSubmissions.length}</span>
                        </div>
                        {stageSubmissions.length > 0 ? (
                          <div className="submissions-mini">
                            {stageSubmissions.slice(0, 3).map(submission => (
                              <div key={submission.id} className="submission-mini">
                                <div className="submission-mini-info">
                                  <span className="submission-mini-title">{submission.title}</span>
                                  <span className={`mini-badge submission-status-${submission.status}`}>
                                    {submission.status === 'draft' && '📝'}
                                    {submission.status === 'submitted' && '📤'}
                                    {submission.status === 'under_review' && '🔍'}
                                    {submission.status === 'approved' && '✅'}
                                    {submission.status === 'rejected' && '❌'}
                                    {submission.status === 'revision_required' && '🔄'}
                                    {submission.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <button 
                                  className="btn-mini btn-view-mini"
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setShowSubmissionDetailModal(true);
                                  }}
                                  title="View Details"
                                >
                                  👁️
                                </button>
                              </div>
                            ))}
                            {stageSubmissions.length > 3 && (
                              <div className="submissions-overflow">
                                +{stageSubmissions.length - 3} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="empty-state-mini">
                            <span className="empty-icon">📄</span>
                            <span className="empty-text">No documents submitted</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="stage-actions-section">
                        <button 
                          className="btn-stage-action"
                          onClick={() => handleStageSubmissionCreate(stage.key)}
                        >
                          <span className="action-icon">�</span>
                          <span className="action-text">Upload Documents</span>
                        </button>
                      </div>
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
    <div className="student-dashboard-content">
      <div className="section-header">
        <h1>My Submissions</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateSubmissionModal(true)}
          >
            📝 New Submission
          </button>
        </div>
      </div>

      {submissionError && (
        <div className="error-message">
          {submissionError}
        </div>
      )}

      <div className="submissions-container">
        {submissionsLoading ? (
          <div className="loading">Loading submissions...</div>
        ) : (
          <div className="submissions-table-wrapper">
            <table className="submissions-table">
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
                    <td className="submission-id">#{submission.id}</td>
                    <td className="submission-details">
                      <div className="submission-info">
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
                    <td className="submission-type-cell">
                      <span className={`type-badge type-${submission.submission_type}`}>
                        {submission.submission_type === 'registration' ? '📋 REG' :
                         submission.submission_type === 'viva_document' ? '📄 VIVA' :
                         submission.submission_type === 'thesis' ? '📚 THESIS' :
                         submission.submission_type === 'correction' ? '✏️ CORR' :
                         submission.submission_type === 'annual_report' ? '📊 REPORT' :
                         submission.submission_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="submission-status-cell">
                      <span className={`status-badge submission-status-${submission.status}`}>
                        {submission.status === 'draft' && '📝'}
                        {submission.status === 'submitted' && '📤'}
                        {submission.status === 'under_review' && '🔍'}
                        {submission.status === 'approved' && '✅'}
                        {submission.status === 'rejected' && '❌'}
                        {submission.status === 'revision_required' && '🔄'}
                        <span className="status-text">
                          {submission.status.replace('_', ' ')}
                        </span>
                      </span>
                    </td>
                    <td className="submission-dates">
                      <div className="dates-info">
                        <div className="date-item">
                          <span className="date-label">Submitted:</span>
                          <span className="date-value">
                            {submission.submission_date 
                              ? new Date(submission.submission_date).toLocaleDateString('en-GB')
                              : 'Not yet'
                            }
                          </span>
                        </div>
                        <div className="date-item">
                          <span className="date-label">Deadline:</span>
                          <span className="date-value">
                            {submission.review_deadline 
                              ? new Date(submission.review_deadline).toLocaleDateString('en-GB')
                              : 'Not set'
                            }
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="submission-file">
                      {submission.file_name ? (
                        <div className="file-info-compact">
                          <div className="file-name">📄 {submission.file_name.length > 15 ? submission.file_name.substring(0, 15) + '...' : submission.file_name}</div>
                          <div className="file-meta">
                            {submission.file_size && (
                              <span className="file-size">
                                {Math.round(submission.file_size / 1024)} KB
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="no-file">No file</span>
                      )}
                    </td>
                    <td className="submission-actions">
                      <div className="action-buttons-compact">
                        <button 
                          className="btn-compact btn-view"
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setShowSubmissionDetailModal(true);
                          }}
                          title="View Details"
                        >
                          👁️
                        </button>
                        
                        {submission.status === 'draft' && (
                          <>
                            <button 
                              className="btn-compact btn-upload"
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setShowFileUploadModal(true);
                              }}
                              title="Upload File"
                            >
                              📎
                            </button>
                            <button 
                              className="btn-compact btn-submit"
                              onClick={() => handleSubmitForReview(submission.id)}
                              disabled={!submission.file_name}
                              title={!submission.file_name ? "Please upload a file first" : "Submit for review"}
                            >
                              📤
                            </button>
                          </>
                        )}
                        
                        {submission.status === 'revision_required' && (
                          <>
                            <button 
                              className="btn-compact btn-revision"
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setShowFileUploadModal(true);
                              }}
                              title="Upload Revision"
                            >
                              🔄
                            </button>
                            <button 
                              className="btn-compact btn-submit"
                              onClick={() => handleSubmitForReview(submission.id)}
                              title="Resubmit"
                            >
                              📤
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {submissions.length === 0 && (
              <div className="no-data">
                No submissions found. Create your first submission using the "New Submission" button above.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderVivaTeams = () => (
    <div className="student-dashboard-content">
      <div className="section-header">
        <h1>My Viva Teams</h1>
        <p>View your viva team assignments and examination status</p>
      </div>

      <div className="viva-teams-container">
        <div className="viva-teams-table-wrapper">
          <table className="viva-teams-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Examiners</th>
                <th>Dates</th>
                <th>Location</th>
                <th>Outcome</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(vivaTeams) && vivaTeams.map(vivaTeam => (
                <tr key={vivaTeam.id}>
                  <td className="team-id">{vivaTeam.id}</td>
                  <td>
                    <span className={`stage-badge stage-${vivaTeam.stage}`}>
                      {vivaTeam.stage.charAt(0).toUpperCase() + vivaTeam.stage.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge viva-status-${vivaTeam.status}`}>
                      {vivaTeam.status === 'proposed' ? '📋' :
                       vivaTeam.status === 'approved' ? '✅' :
                       vivaTeam.status === 'rejected' ? '❌' :
                       vivaTeam.status === 'scheduled' ? '📅' :
                       vivaTeam.status === 'completed' ? '🎓' : '⏳'}
                      <span className="status-text">{vivaTeam.status}</span>
                    </span>
                  </td>
                  <td className="examiners-cell">
                    <div className="examiners-list">
                      <div className="examiner-item">
                        <span className="examiner-label">Int 1:</span>
                        <span className="examiner-name">{vivaTeam.internal_examiner_1_id || 'N/A'}</span>
                      </div>
                      <div className="examiner-item">
                        <span className="examiner-label">Int 2:</span>
                        <span className="examiner-name">{vivaTeam.internal_examiner_2_id || 'N/A'}</span>
                      </div>
                      <div className="examiner-item">
                        <span className="examiner-label">Ext:</span>
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
                  <td className="location-cell">
                    <span className="location-text">{vivaTeam.location || 'TBD'}</span>
                  </td>
                  <td className="outcome-cell">
                    <span className={`outcome-badge ${vivaTeam.outcome ? 'has-outcome' : 'pending-outcome'}`}>
                      {vivaTeam.outcome || 'Pending'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      onClick={() => {
                        setSelectedVivaTeam(vivaTeam);
                        setShowVivaTeamModal(true);
                      }}
                      className="btn-compact btn-view"
                      title="View Details"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {Array.isArray(vivaTeams) && vivaTeams.length === 0 && (
          <div className="no-data">
            No viva teams found. Your supervisors will propose viva teams when you're ready for examination.
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
      case 'registrations':
        return renderRegistrations();
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
      <div className="student-layout">
        <div className="loading">Loading student dashboard...</div>
      </div>
    );
  }

  return (
    <div className="student-layout">
      {renderNavigation()}
      
      <main className="student-main">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {renderContent()}
      </main>

      {/* Extension Request Modal */}
      {showExtensionModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Request Registration Extension</h3>
              <span 
                className="close" 
                onClick={() => {
                  setShowExtensionModal(false);
                  setExtensionRequest({ extension_days: '', reason: '' });
                  setExtensionError('');
                }}
              >
                &times;
              </span>
            </div>
            <div className="modal-body">
              {extensionError && (
                <div className="error-message">
                  {extensionError}
                </div>
              )}
              
              <div className="form-group">
                <label>Extension Days (1-365):</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={extensionRequest.extension_days}
                  onChange={(e) => setExtensionRequest({
                    ...extensionRequest, 
                    extension_days: e.target.value
                  })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Reason for Extension:</label>
                <textarea
                  value={extensionRequest.reason}
                  onChange={(e) => setExtensionRequest({
                    ...extensionRequest, 
                    reason: e.target.value
                  })}
                  rows="4"
                  placeholder="Please provide a detailed reason for your extension request..."
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => {
                  setShowExtensionModal(false);
                  setExtensionRequest({ extension_days: '', reason: '' });
                  setExtensionError('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleExtensionRequest}
                className="btn btn-primary"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Supervisors Modal */}
      {showSupervisorModal && (
        <div className="modal">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>All Available Supervisors</h3>
              <span 
                className="close" 
                onClick={() => {
                  setShowSupervisorModal(false);
                  setSelectedSupervisor(null);
                }}
              >
                &times;
              </span>
            </div>
            <div className="modal-body">
              <div className="supervisors-grid">
                {allSupervisors.map(supervisor => (
                  <div 
                    key={supervisor.supervisor_id} 
                    className="supervisor-card clickable"
                    onClick={() => setSelectedSupervisor(supervisor)}
                  >
                    <h4>{supervisor.supervisor_name}</h4>
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
        <div className="modal">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>Viva Team Details</h3>
              <span 
                className="close" 
                onClick={() => {
                  setShowVivaTeamModal(false);
                  setSelectedVivaTeam(null);
                }}
              >
                &times;
              </span>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Team ID:</label>
                  <span>{selectedVivaTeam.id}</span>
                </div>
                <div className="detail-item">
                  <label>Student Number:</label>
                  <span>{selectedVivaTeam.student_number}</span>
                </div>
                <div className="detail-item">
                  <label>Stage:</label>
                  <span className={`status stage-${selectedVivaTeam.stage}`}>
                    {selectedVivaTeam.stage.charAt(0).toUpperCase() + selectedVivaTeam.stage.slice(1)}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`status ${selectedVivaTeam.status}`}>
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
                  <div className="detail-item">
                    <label>Internal Examiner 1 ID:</label>
                    <span>{selectedVivaTeam.internal_examiner_1_id || 'Not assigned'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Internal Examiner 2 ID:</label>
                    <span>{selectedVivaTeam.internal_examiner_2_id || 'Not assigned'}</span>
                  </div>
                  <div className="detail-item">
                    <label>External Examiner Name:</label>
                    <span>{selectedVivaTeam.external_examiner_name || 'Not assigned'}</span>
                  </div>
                  <div className="detail-item">
                    <label>External Examiner Email:</label>
                    <span>{selectedVivaTeam.external_examiner_email || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>External Examiner Institution:</label>
                    <span>{selectedVivaTeam.external_examiner_institution || 'Not provided'}</span>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Scheduling Information</h4>
                  <div className="detail-item">
                    <label>Proposed Date:</label>
                    <span>{selectedVivaTeam.proposed_date ? new Date(selectedVivaTeam.proposed_date).toLocaleDateString() : 'Not set'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Scheduled Date:</label>
                    <span>{selectedVivaTeam.scheduled_date ? new Date(selectedVivaTeam.scheduled_date).toLocaleDateString() : 'Not scheduled'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Actual Date:</label>
                    <span>{selectedVivaTeam.actual_date ? new Date(selectedVivaTeam.actual_date).toLocaleDateString() : 'Not completed'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Location:</label>
                    <span>{selectedVivaTeam.location || 'Not specified'}</span>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Results & Outcome</h4>
                  <div className="detail-item">
                    <label>Outcome:</label>
                    <span>{selectedVivaTeam.outcome || 'Pending'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Outcome Notes:</label>
                    <span>{selectedVivaTeam.outcome_notes || 'No notes available'}</span>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Administrative Information</h4>
                  <div className="detail-item">
                    <label>Proposed By:</label>
                    <span>User ID: {selectedVivaTeam.proposed_by || 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Approved By:</label>
                    <span>User ID: {selectedVivaTeam.approved_by || 'Not approved yet'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Approval Date:</label>
                    <span>{selectedVivaTeam.approval_date ? new Date(selectedVivaTeam.approval_date).toLocaleString() : 'Not approved yet'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Created Date:</label>
                    <span>{selectedVivaTeam.created_date ? new Date(selectedVivaTeam.created_date).toLocaleString() : 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated:</label>
                    <span>{selectedVivaTeam.updated_date ? new Date(selectedVivaTeam.updated_date).toLocaleString() : 'Unknown'}</span>
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
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Submission</h3>
              <span 
                className="close" 
                onClick={() => {
                  setShowCreateSubmissionModal(false);
                  setSubmissionForm({
                    submission_type: 'registration',
                    title: '',
                    description: ''
                  });
                  setSubmissionError('');
                }}
              >
                &times;
              </span>
            </div>
            <div className="modal-body">
              {submissionError && (
                <div className="error-message">
                  {submissionError}
                </div>
              )}
              <form onSubmit={handleCreateSubmission}>
                <div className="form-group">
                  <label>Submission Type:</label>
                  <select
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
                  <label>Title:</label>
                  <input
                    type="text"
                    value={submissionForm.title}
                    onChange={(e) => setSubmissionForm({...submissionForm, title: e.target.value})}
                    required
                    placeholder="Enter submission title"
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={submissionForm.description}
                    onChange={(e) => setSubmissionForm({...submissionForm, description: e.target.value})}
                    required
                    placeholder="Enter submission description"
                    rows="4"
                  />
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    Create Submission
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowCreateSubmissionModal(false);
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
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileUploadModal && selectedSubmission && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Upload File for "{selectedSubmission.title}"</h3>
              <span 
                className="close" 
                onClick={() => {
                  setShowFileUploadModal(false);
                  setSelectedSubmission(null);
                  setUploadFile(null);
                  setSubmissionError('');
                }}
              >
                &times;
              </span>
            </div>
            <div className="modal-body">
              {submissionError && (
                <div className="error-message">
                  {submissionError}
                </div>
              )}
              <form onSubmit={handleFileUpload}>
                <div className="form-group">
                  <label>Select File:</label>
                  <input
                    type="file"
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
                    <p><strong>Selected file:</strong> {uploadFile.name}</p>
                    <p><strong>Size:</strong> {Math.round(uploadFile.size / 1024)} KB</p>
                  </div>
                )}
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    Upload File
                  </button>
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
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Submission Detail Modal */}
      {showSubmissionDetailModal && selectedSubmission && (
        <div className="modal">
          <div className="modal-content large">
            <div className="modal-header">
              <h3>Submission Details - ID #{selectedSubmission.id}</h3>
              <span 
                className="close" 
                onClick={() => {
                  setShowSubmissionDetailModal(false);
                  setSelectedSubmission(null);
                }}
              >
                &times;
              </span>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-item">
                    <label>ID:</label>
                    <span>#{selectedSubmission.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Student Number:</label>
                    <span>{selectedSubmission.student_number}</span>
                  </div>
                  <div className="detail-item">
                    <label>Title:</label>
                    <span>{selectedSubmission.title}</span>
                  </div>
                  <div className="detail-item">
                    <label>Type:</label>
                    <span className="submission-type">
                      {selectedSubmission.submission_type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Description:</label>
                    <span className="submission-description">
                      {selectedSubmission.description || 'No description provided'}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Status & Timeline</h4>
                  <div className="detail-item">
                    <label>Current Status:</label>
                    <span className={`status status-${selectedSubmission.status}`}>
                      {selectedSubmission.status === 'draft' && '📝 Draft'}
                      {selectedSubmission.status === 'submitted' && '📤 Submitted'}
                      {selectedSubmission.status === 'under_review' && '🔍 Under Review'}
                      {selectedSubmission.status === 'approved' && '✅ Approved'}
                      {selectedSubmission.status === 'rejected' && '❌ Rejected'}
                      {selectedSubmission.status === 'revision_required' && '🔄 Revision Required'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Submission Date:</label>
                    <span>
                      {selectedSubmission.submission_date 
                        ? new Date(selectedSubmission.submission_date).toLocaleString()
                        : 'Not submitted yet'
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Review Deadline:</label>
                    <span>
                      {selectedSubmission.review_deadline 
                        ? new Date(selectedSubmission.review_deadline).toLocaleDateString()
                        : 'Not set'
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Created Date:</label>
                    <span>{new Date(selectedSubmission.created_date).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated:</label>
                    <span>{new Date(selectedSubmission.updated_date).toLocaleString()}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>File Information</h4>
                  {selectedSubmission.file_name ? (
                    <>
                      <div className="detail-item">
                        <label>File Name:</label>
                        <span className="file-name">📄 {selectedSubmission.file_name}</span>
                      </div>
                      <div className="detail-item">
                        <label>File Size:</label>
                        <span>
                          {selectedSubmission.file_size 
                            ? `${Math.round(selectedSubmission.file_size / 1024)} KB` 
                            : 'Unknown'
                          }
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>File Type:</label>
                        <span>{selectedSubmission.mime_type || 'Unknown'}</span>
                      </div>
                      <div className="detail-item">
                        <label>File Path:</label>
                        <span className="file-path">{selectedSubmission.file_path}</span>
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
                  <div className="detail-item">
                    <label>Reviewed By:</label>
                    <span>
                      {selectedSubmission.reviewed_by 
                        ? `User ID: ${selectedSubmission.reviewed_by}` 
                        : 'Not reviewed yet'
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Review Date:</label>
                    <span>
                      {selectedSubmission.review_date 
                        ? new Date(selectedSubmission.review_date).toLocaleString()
                        : 'Not reviewed yet'
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Review Comments:</label>
                    <span className="review-comments">
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
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create New Submission</h3>
              <span 
                className="close" 
                onClick={() => {
                  setShowStageSubmissionModal(false);
                  setSubmissionForm({
                    submission_type: 'registration',
                    title: '',
                    description: ''
                  });
                  setSubmissionError('');
                }}
              >
                &times;
              </span>
            </div>
            <div className="modal-body">
              {submissionError && (
                <div className="error-message">
                  {submissionError}
                </div>
              )}
              <form onSubmit={handleCreateSubmission}>
                <div className="form-group">
                  <label>Submission Type:</label>
                  <select
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
                  <label>Title:</label>
                  <input
                    type="text"
                    value={submissionForm.title}
                    onChange={(e) => setSubmissionForm({...submissionForm, title: e.target.value})}
                    required
                    placeholder="Enter submission title"
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    value={submissionForm.description}
                    onChange={(e) => setSubmissionForm({...submissionForm, description: e.target.value})}
                    required
                    placeholder="Enter submission description"
                    rows="4"
                  />
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    Create Submission
                  </button>
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
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
