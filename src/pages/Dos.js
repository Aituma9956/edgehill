import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, authAPI, studentAPI, supervisorAPI, assignmentAPI, registrationAPI, vivaTeamAPI, submissionAPI } from '../utils/api';
import { appraisalAPI } from '../utils/api';
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

const DosDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  // User management state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  // Dropdown for user and student actions
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [showUserByIdModal, setShowUserByIdModal] = useState(false);
  const [userIdSearch, setUserIdSearch] = useState('');
  const [searchedUser, setSearchedUser] = useState(null);
  const [searchingById, setSearchingById] = useState(false);
  
  // Student management state
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [programmeFilter, setProgrammeFilter] = useState('');
  const [studentNumberSearch, setStudentNumberSearch] = useState('');
  const [searchedStudent, setSearchedStudent] = useState(null);
  const [searchingStudentById, setSearchingStudentById] = useState(false);
  
  // Supervisor management state
  const [supervisors, setSupervisors] = useState([]);
  const [supervisorsLoading, setSupervisorsLoading] = useState(false);
  const [supervisorsError, setSupervisorsError] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);
  const [showCreateSupervisorModal, setShowCreateSupervisorModal] = useState(false);
  const [showSupervisorDetailModal, setShowSupervisorDetailModal] = useState(false);
  const [supervisorSearch, setSupervisorSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [supervisorIdSearch, setSupervisorIdSearch] = useState('');
  const [searchedSupervisor, setSearchedSupervisor] = useState(null);
  const [searchingSupervisorById, setSearchingSupervisorById] = useState(false);
  
  // Assignment management state
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  
  // Registration management state
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsError, setRegistrationsError] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showCreateRegistrationModal, setShowCreateRegistrationModal] = useState(false);
  const [showRegistrationDetailModal, setShowRegistrationDetailModal] = useState(false);
  const [registrationSearch, setRegistrationSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [registrationIdSearch, setRegistrationIdSearch] = useState('');
  const [searchedRegistration, setSearchedRegistration] = useState(null);
  const [searchingRegistrationById, setSearchingRegistrationById] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  
  // Viva Team management state
  const [vivaTeams, setVivaTeams] = useState([]);
  const [vivaTeamsLoading, setVivaTeamsLoading] = useState(false);
  const [vivaTeamsError, setVivaTeamsError] = useState('');
  const [selectedVivaTeam, setSelectedVivaTeam] = useState(null);
  const [showVivaTeamModal, setShowVivaTeamModal] = useState(false);
  const [showCreateVivaTeamModal, setShowCreateVivaTeamModal] = useState(false);
  const [showVivaTeamDetailModal, setShowVivaTeamDetailModal] = useState(false);
  const [vivaTeamSearch, setVivaTeamSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [vivaTeamStatusFilter, setVivaTeamStatusFilter] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Submission management state
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showSubmissionDetailModal, setShowSubmissionDetailModal] = useState(false);
  const [showSubmissionReviewModal, setShowSubmissionReviewModal] = useState(false);
  const [showSubmissionRejectModal, setShowSubmissionRejectModal] = useState(false);
  const [submissionSearchTerm, setSubmissionSearchTerm] = useState('');
  const [submissionTypeFilter, setSubmissionTypeFilter] = useState('');
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState('');
  
  // Profile management state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  
  // Dashboard stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    studentUsers: 0,
    totalStudents: 0,
    internationalStudents: 0,
    previousEhuStudents: 0
  });

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', iconClass: 'fas fa-chart-pie' },
    { id: 'students', label: 'Student Management', icon: '🎓', iconClass: 'fas fa-user-graduate' },
    { id: 'supervisors', label: 'Supervisor Management', icon: '👨‍🏫', iconClass: 'fas fa-chalkboard-teacher' },
    { id: 'assignments', label: 'Assignments', icon: '📋', iconClass: 'fas fa-clipboard-list' },
    { id: 'submissions', label: 'Submissions', icon: '📄', iconClass: 'fas fa-file-upload' },
    { id: 'viva-teams', label: 'Viva Teams', icon: '🎯', iconClass: 'fas fa-bullseye' },
    { id: 'appraisals', label: 'Appraisals', icon: '📑', iconClass: 'fas fa-file-signature' },
    { id: 'profile', label: 'Profile', icon: '⚙️', iconClass: 'fas fa-cog' }
  ];
  // Appraisal management state
  const [showCreateAppraisalModal, setShowCreateAppraisalModal] = useState(false);
  const [newAppraisal, setNewAppraisal] = useState({
    student_number: '',
    academic_year: '',
    appraisal_period: '',
    due_date: ''
  });
  const [creatingAppraisal, setCreatingAppraisal] = useState(false);
  const [createAppraisalError, setCreateAppraisalError] = useState('');

  const handleCreateAppraisal = async () => {
    setCreatingAppraisal(true);
    setCreateAppraisalError('');
    try {
      await appraisalAPI.createAppraisal(newAppraisal);
      setShowCreateAppraisalModal(false);
      setNewAppraisal({ student_number: '', academic_year: '', appraisal_period: '', due_date: '' });
      fetchAppraisals();
    } catch (error) {
      setCreateAppraisalError('Failed to create appraisal');
    } finally {
      setCreatingAppraisal(false);
    }
  };
  const [appraisals, setAppraisals] = useState([]);
  const [appraisalsLoading, setAppraisalsLoading] = useState(false);
  const [appraisalsError, setAppraisalsError] = useState('');
  const [appraisalSearch, setAppraisalSearch] = useState('');
  const [appraisalStatusFilter, setAppraisalStatusFilter] = useState('');

  // Fetch appraisals
  const fetchAppraisals = async () => {
    try {
      setAppraisalsLoading(true);
      setAppraisalsError('');
      let data = [];
      if (appraisalSearch && appraisalSearch.trim() !== '') {
        // If searching by student number, use the student-specific endpoint
        data = await appraisalAPI.getStudentAppraisals(appraisalSearch.trim());
      } else {
        // Otherwise, fetch all appraisals
        data = await appraisalAPI.getAllAppraisals(0, 100, appraisalStatusFilter, '');
      }
      setAppraisals(data);
    } catch (error) {
      setAppraisalsError('Failed to fetch appraisals');
    } finally {
      setAppraisalsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'appraisals') {
      fetchAppraisals();
    }
  }, [activeSection, appraisalStatusFilter, appraisalSearch]);

  // Render Appraisal Table
  const renderAppraisalManagement = () => (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Appraisals</h1>
        <p className="page-subtitle">Manage student appraisals and review their progress</p>
        <div className="header-actions">
          <button className="btn primary" onClick={() => setShowCreateAppraisalModal(true)}>
            ➕ Create Appraisal
          </button>
        </div>
      </div>
      <div className="search-filter-section">
        <div className="form-group">
          <label className="form-label">Search by Student Number or ID</label>
          <input
            type="text"
            placeholder="Student Number or ID..."
            value={appraisalSearch}
            onChange={e => setAppraisalSearch(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Status Filter</label>
          <select
            value={appraisalStatusFilter}
            onChange={e => setAppraisalStatusFilter(e.target.value)}
            className="form-input"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="student_submitted">Student Submitted</option>
            <option value="dos_submitted">DOS Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="unsatisfactory">Unsatisfactory</option>
            <option value="resubmission_required">Resubmission Required</option>
          </select>
        </div>
        <div className="form-group button-shift">
          <button
            onClick={fetchAppraisals}
            disabled={appraisalsLoading}
            className="btn secondary"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
      {appraisalsError && (
        <div className="alert alert-error">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">{appraisalsError}</div>
        </div>
      )}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Appraisal Records</h2>
          <span className="card-subtitle">{appraisals.length} appraisals found</span>
        </div>
        {appraisalsLoading ? (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading appraisals...</div>
          </div>
        ) : (
          <div className="appraisal-list">
            {appraisals.length > 0 ? (
              appraisals.map(appraisal => (
                <div key={appraisal.id} className="appraisal-list-item">
                  <div><strong>Student:</strong> {appraisal.student_number}</div>
                  <div><strong>Year:</strong> {appraisal.academic_year}</div>
                  <div><strong>Period:</strong> {appraisal.appraisal_period}</div>
                  <div><strong>Due:</strong> {appraisal.due_date}</div>
                  <div><strong>Status:</strong> <span className="status-badge">{appraisal.status.replace(/_/g, ' ')}</span></div>
                  <button className="btn btn-sm secondary" title="View Details">View</button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📑</div>
                <div className="empty-state-title">No Appraisals Found</div>
                <div className="empty-state-description">Try adjusting your search or filter criteria.</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Appraisal Modal */}
      {showCreateAppraisalModal && (
        <div className={`modal-overlay show`}>
          <div className="modal">
            <div className="modal-header">
              <h2>Create Appraisal</h2>
              <button className="modal-close" onClick={() => setShowCreateAppraisalModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Student Number</label>
                <input type="text" value={newAppraisal.student_number} onChange={e => setNewAppraisal({ ...newAppraisal, student_number: e.target.value })} className="form-input" />
              </div>
              <div className="form-group">
                <label>Academic Year</label>
                <input type="text" value={newAppraisal.academic_year} onChange={e => setNewAppraisal({ ...newAppraisal, academic_year: e.target.value })} className="form-input" />
              </div>
              <div className="form-group">
                <label>Appraisal Period</label>
                <input type="text" value={newAppraisal.appraisal_period} onChange={e => setNewAppraisal({ ...newAppraisal, appraisal_period: e.target.value })} className="form-input" />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={newAppraisal.due_date} onChange={e => setNewAppraisal({ ...newAppraisal, due_date: e.target.value })} className="form-input" />
              </div>
              {createAppraisalError && <div className="alert alert-error">{createAppraisalError}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn primary" onClick={handleCreateAppraisal} disabled={creatingAppraisal}>
                {creatingAppraisal ? 'Creating...' : 'Create'}
              </button>
              <button className="btn secondary" onClick={() => setShowCreateAppraisalModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    if (activeSection === 'users') {
      fetchUsers();
    } else if (activeSection === 'students') {
      fetchStudents();
    } else if (activeSection === 'supervisors') {
      fetchSupervisors();
    } else if (activeSection === 'assignments') {
      fetchAssignments();
    } else if (activeSection === 'registrations') {
      fetchRegistrations();
    } else if (activeSection === 'viva-teams') {
      fetchVivaTeams();
    } else if (activeSection === 'submissions') {
      fetchSubmissions();
    } else if (activeSection === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeSection]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch functions
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError('');
      
      const data = await adminAPI.getAllUsers(0, 100);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to fetch users');
      setUsersError(`Failed to fetch users: ${errorMessage}`);
      
      if (error.response?.status === 401) {
        setUsersError('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        setUsersError('Access denied. You don\'t have permission to view users.');
      }
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      setStudentsError('');
      
      const data = await studentAPI.getAllStudents(0, 100, studentSearch, programmeFilter);
      console.log('Fetched students data:', data);
      console.log('First student:', data[0]);
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to fetch students');
      setStudentsError(`Failed to fetch students: ${errorMessage}`);
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      setSupervisorsLoading(true);
      setSupervisorsError('');
      
      const data = await supervisorAPI.getAllSupervisors(0, 100, supervisorSearch, departmentFilter);
      setSupervisors(data);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to fetch supervisors');
      setSupervisorsError(`Failed to fetch supervisors: ${errorMessage}`);
    } finally {
      setSupervisorsLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      setAssignmentsError('');
      
      const data = await assignmentAPI.getAllAssignments();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to fetch assignments');
      setAssignmentsError(`Failed to fetch assignments: ${errorMessage}`);
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setRegistrationsLoading(true);
      setRegistrationsError('');
      
      const data = await registrationAPI.getAllRegistrations(0, 100, registrationSearch, statusFilter);
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to fetch registrations');
      setRegistrationsError(`Failed to fetch registrations: ${errorMessage}`);
    } finally {
      setRegistrationsLoading(false);
    }
  };

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

  const fetchSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      setSubmissionsError('');
      
      const data = await submissionAPI.getSubmissions(
        submissionSearchTerm || null, 
        submissionTypeFilter || null, 
        submissionStatusFilter || null
      );
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissionsError(`Failed to fetch submissions: ${extractErrorMessage(error, 'Failed to fetch submissions')}`);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch both users and students for dashboard stats
      const [usersData, studentsData] = await Promise.all([
        adminAPI.getAllUsers(0, 1000),
        studentAPI.getAllStudents(0, 1000)
      ]);
      
      // Calculate user stats
      const userStats = {
        totalUsers: usersData.length,
        activeUsers: usersData.filter(u => u.is_active).length,
        adminUsers: usersData.filter(u => u.role === 'system_admin').length,
        studentUsers: usersData.filter(u => u.role === 'student').length
      };
      
      // Calculate student stats
      const studentStats = {
        totalStudents: studentsData.length,
        internationalStudents: studentsData.filter(s => s.international_student).length,
        previousEhuStudents: studentsData.filter(s => s.previous_ehu_student).length
      };
      
      setStats({ ...userStats, ...studentStats });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };



  // Student management functions
  const fetchStudentByNumber = async (studentNumber) => {
    try {
      setStudentsError('');
      setSearchingStudentById(true);
      
      const studentData = await studentAPI.getStudentByNumber(studentNumber);
      setSearchedStudent(studentData);
      return studentData;
    } catch (error) {
      console.error('Error fetching student by number:', error);
      const errorMessage = extractErrorMessage(error, 'Student not found');
      setStudentsError(`Failed to fetch student: ${errorMessage}`);
      setSearchedStudent(null);
    } finally {
      setSearchingStudentById(false);
    }
  };

  const handleSearchStudentByNumber = async () => {
    if (!studentNumberSearch.trim()) {
      setStudentsError('Please enter a student number');
      return;
    }

    try {
      const studentData = await fetchStudentByNumber(studentNumberSearch);
      if (studentData) {
        setShowStudentDetailModal(true);
        setSelectedStudent(studentData);
      }
    } catch (error) {
      console.error('Error searching student by number:', error);
    }
  };

  // Add handler to fetch student details by ID
  const handleViewStudent = async (studentNumber) => {
    try {
      setStudentDetailLoading(true);
      setStudentsError('');
      console.log('Fetching student details for:', studentNumber);
      const studentDetails = await studentAPI.getStudentByNumber(studentNumber);
      console.log('Fetched student details:', studentDetails);
      setSelectedStudent(studentDetails);
      setShowStudentDetailModal(true);
    } catch (error) {
      console.error('Error fetching student details:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to fetch student details');
      setStudentsError(`Failed to fetch student details: ${errorMessage}`);
    } finally {
      setStudentDetailLoading(false);
    }
  };

  const handleCreateStudent = async (studentData) => {
    try {
      await studentAPI.createStudent(studentData);
      fetchStudents(); // Refresh list
      setShowCreateStudentModal(false);
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  };

  const handleUpdateStudent = async (studentNumber, studentData) => {
    try {
      await studentAPI.updateStudent(studentNumber, studentData);
      fetchStudents(); // Refresh list
      setShowStudentModal(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  };

  const handleDeleteStudent = async (studentNumber) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentAPI.deleteStudent(studentNumber);
        fetchStudents(); // Refresh list
        setShowStudentDetailModal(false);
        setSelectedStudent(null);
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student');
      }
    }
  };

  // Supervisor management functions
  const handleCreateSupervisor = async (supervisorData) => {
    try {
      await supervisorAPI.createSupervisor(supervisorData);
      fetchSupervisors(); // Refresh list
      setShowCreateSupervisorModal(false);
    } catch (error) {
      console.error('Error creating supervisor:', error);
      throw error;
    }
  };

  const handleUpdateSupervisor = async (supervisorId, supervisorData) => {
    try {
      await supervisorAPI.updateSupervisor(supervisorId, supervisorData);
      fetchSupervisors(); // Refresh list
      setShowSupervisorModal(false);
      setSelectedSupervisor(null);
    } catch (error) {
      console.error('Error updating supervisor:', error);
      throw error;
    }
  };

  const handleDeleteSupervisor = async (supervisorId) => {
    if (window.confirm('Are you sure you want to delete this supervisor?')) {
      try {
        await supervisorAPI.deleteSupervisor(supervisorId);
        fetchSupervisors(); // Refresh list
        setShowSupervisorDetailModal(false);
        setSelectedSupervisor(null);
      } catch (error) {
        console.error('Error deleting supervisor:', error);
        alert('Failed to delete supervisor');
      }
    }
  };

  // Assignment management functions
  const handleAssignmentSave = async (assignmentData) => {
    try {
      if (selectedAssignment) {
        // Update existing assignment
        await assignmentAPI.updateAssignment(selectedAssignment.student_supervisor_id, assignmentData);
      } else {
        // Create new assignment
        await assignmentAPI.assignSupervisor(assignmentData);
      }
      fetchAssignments(); // Refresh list
      setShowAssignmentModal(false);
      setSelectedAssignment(null);
    } catch (error) {
      console.error('Error saving assignment:', error);
      throw error;
    }
  };

  // Registration management functions
  const handleCreateRegistration = async (registrationData) => {
    try {
      await registrationAPI.createRegistration(registrationData);
      fetchRegistrations();
      setShowCreateRegistrationModal(false);
    } catch (error) {
      console.error('Error creating registration:', error);
      throw error;
    }
  };

  const handleUpdateRegistration = async (registrationId, registrationData) => {
    try {
      await registrationAPI.updateRegistration(registrationId, registrationData);
      fetchRegistrations();
      setShowRegistrationModal(false);
      setSelectedRegistration(null);
    } catch (error) {
      console.error('Error updating registration:', error);
      throw error;
    }
  };

  const handleExtensionRequest = async (registrationId, extensionDays, reason) => {
    try {
      await registrationAPI.requestExtension(registrationId, extensionDays, reason);
      fetchRegistrations();
      setShowExtensionModal(false);
      alert('Extension request submitted successfully!');
    } catch (error) {
      console.error('Error requesting extension:', error);
      throw error;
    }
  };

  const handleApproveExtension = async (registrationId) => {
    if (!window.confirm('Are you sure you want to approve this extension request?')) {
      return;
    }
    
    try {
      await registrationAPI.approveExtension(registrationId);
      fetchRegistrations();
      alert('Extension approved successfully!');
    } catch (error) {
      console.error('Error approving extension:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to approve extension');
      alert(`Failed to approve extension: ${errorMessage}`);
    }
  };

  // Viva Team management functions
  const handleCreateVivaTeam = async (vivaTeamData) => {
    try {
      await vivaTeamAPI.createVivaTeam(vivaTeamData);
      fetchVivaTeams();
      setShowCreateVivaTeamModal(false);
    } catch (error) {
      console.error('Error creating viva team:', error);
      throw error;
    }
  };

  const handleUpdateVivaTeam = async (vivaTeamId, vivaTeamData) => {
    try {
      await vivaTeamAPI.updateVivaTeam(vivaTeamId, vivaTeamData);
      fetchVivaTeams();
      setShowVivaTeamModal(false);
      setSelectedVivaTeam(null);
    } catch (error) {
      console.error('Error updating viva team:', error);
      throw error;
    }
  };

  const handleApproveVivaTeam = async (vivaTeamId) => {
    if (!window.confirm('Are you sure you want to approve this viva team?')) {
      return;
    }
    
    try {
      await vivaTeamAPI.approveVivaTeam(vivaTeamId);
      fetchVivaTeams();
      alert('Viva team approved successfully!');
    } catch (error) {
      console.error('Error approving viva team:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to approve viva team');
      alert(`Failed to approve viva team: ${errorMessage}`);
    }
  };

  const handleRejectVivaTeam = async (vivaTeamId, reason) => {
    try {
      await vivaTeamAPI.rejectVivaTeam(vivaTeamId, reason);
      fetchVivaTeams();
      setShowRejectModal(false);
      alert('Viva team rejected successfully!');
    } catch (error) {
      console.error('Error rejecting viva team:', error);
      throw error;
    }
  };

  const handleScheduleViva = async (vivaTeamId, scheduledDate, location) => {
    try {
      await vivaTeamAPI.scheduleViva(vivaTeamId, scheduledDate, location);
      fetchVivaTeams();
      setShowScheduleModal(false);
      alert('Viva scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling viva:', error);
      throw error;
    }
  };

  const handleSubmitVivaOutcome = async (vivaTeamId, outcome, outcomeNotes) => {
    try {
      await vivaTeamAPI.submitVivaOutcome(vivaTeamId, outcome, outcomeNotes);
      fetchVivaTeams();
      setShowOutcomeModal(false);
      alert('Viva outcome submitted successfully!');
    } catch (error) {
      console.error('Error submitting viva outcome:', error);
      throw error;
    }
  };

  // Submission management functions
  const fetchSubmissionById = async (submissionId) => {
    try {
      const submissionData = await submissionAPI.getSubmissionById(submissionId);
      setSelectedSubmission(submissionData);
      return submissionData;
    } catch (error) {
      console.error('Error fetching submission by ID:', error);
      throw error;
    }
  };

  const testSubmissionAPI = async () => {
    try {
      console.log('Testing Submission API...');
      
      // Test getSubmissions
      const allSubmissions = await submissionAPI.getSubmissions();
      console.log('All submissions:', allSubmissions);
      
      // Test getSubmissionById if we have submissions
      if (allSubmissions && allSubmissions.length > 0) {
        const firstSubmission = allSubmissions[0];
        console.log('Testing getSubmissionById with ID:', firstSubmission.id);
        const submissionDetail = await submissionAPI.getSubmissionById(firstSubmission.id);
        console.log('Submission detail:', submissionDetail);
      }
      
      return allSubmissions;
    } catch (error) {
      console.error('Error testing submission API:', error);
      throw error;
    }
  };

  const handleApproveSubmission = async (submissionId) => {
    try {
      await submissionAPI.approveSubmission(submissionId);
      await fetchSubmissions();
      setShowSubmissionDetailModal(false);
      setSelectedSubmission(null);
      alert('Submission approved successfully!');
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('Error approving submission. Please check console for details.');
      throw error;
    }
  };

  const handleRejectSubmission = async (submissionId, rejectionData) => {
    try {
      // Extract reason from rejectionData object
      const reason = rejectionData.reason || rejectionData.feedback || 'No reason provided';
      await submissionAPI.rejectSubmission(submissionId, reason);
      await fetchSubmissions();
      setShowSubmissionRejectModal(false);
      setShowSubmissionDetailModal(false);
      setSelectedSubmission(null);
      alert('Submission rejected successfully!');
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert('Error rejecting submission. Please check console for details.');
      throw error;
    }
  };

  const handleReviewSubmission = async (submissionId, reviewData) => {
    try {
      await submissionAPI.reviewSubmission(submissionId, reviewData);
      await fetchSubmissions();
      setShowSubmissionReviewModal(false);
      setShowSubmissionDetailModal(false);
      setSelectedSubmission(null);
      alert('Submission review submitted successfully!');
    } catch (error) {
      console.error('Error reviewing submission:', error);
      alert('Error reviewing submission. Please check console for details.');
      throw error;
    }
  };

  // Profile management functions
  const handleProfileUpdate = async (profileData) => {
    try {
      await authAPI.updateProfile(profileData);
      setShowProfileModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const handleChangePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      setShowChangePasswordModal(false);
    } catch (error) {
      console.error('Error changing password:', error);
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
              <p className="sidebar-portal-name">Dos Admin</p>
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
                {item.id === 'users' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {item.id === 'students' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 10V15C22 16.1046 21.1046 17 20 17H4C2.89543 17 2 16.1046 2 15V10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 17V22H17V17" stroke="currentColor" strokeWidth="2"/>
                    <path d="M22 5L12 13L2 5L12 1L22 5Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {item.id === 'supervisors' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {item.id === 'assignments' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11H15M9 15H15M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H12.586C12.8512 3.00006 13.1055 3.10545 13.293 3.293L19.707 9.707C19.8946 9.89449 19.9999 10.1488 20 10.414V19C20 19.5304 19.7893 20.0391 19.4142 20.4142C19.0391 20.7893 18.5304 21 18 21H17Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M13 3V9H19" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {item.id === 'registrations' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {item.id === 'submissions' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {item.id === 'viva-teams' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {item.id === 'profile' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12.22 2H11.78C11.2496 2 10.7409 2.21071 10.3658 2.58579C9.99072 2.96086 9.78 3.46957 9.78 4V4.18C9.77964 4.53073 9.68706 4.87519 9.51154 5.17884C9.33602 5.48248 9.08374 5.73464 8.78 5.91L8.35 6.16C8.04626 6.33536 7.79398 6.58752 7.61846 6.89116C7.44294 7.19481 7.35036 7.53927 7.35 7.89V8.11C7.35036 8.46073 7.44294 8.80519 7.61846 9.10884C7.79398 9.41248 8.04626 9.66464 8.35 9.84L8.78 10.09C9.08374 10.2654 9.33602 10.5175 9.51154 10.8212C9.68706 11.1248 9.77964 11.4693 9.78 11.82V12.18C9.77964 12.5307 9.68706 12.8752 9.51154 13.1788C9.33602 13.4825 9.08374 13.7346 8.78 13.91L8.35 14.16C8.04626 14.3354 7.79398 14.5875 7.61846 14.8912C7.44294 15.1948 7.35036 15.5393 7.35 15.89V16.11C7.35036 16.4607 7.44294 16.8052 7.61846 17.1088C7.79398 17.4125 8.04626 17.6646 8.35 17.84L8.78 18.09C9.08374 18.2654 9.33602 18.5175 9.51154 18.8212C9.68706 19.1248 9.77964 19.4693 9.78 19.82V20C9.78 20.5304 9.99072 21.0391 10.3658 21.4142C10.7409 21.7893 11.2496 22 11.78 22H12.22C12.7504 22 13.2591 21.7893 13.6342 21.4142C14.0093 21.0391 14.22 20.5304 14.22 20V19.82C14.2204 19.4693 14.3129 19.1248 14.4885 18.8212C14.664 18.5175 14.9163 18.2654 15.22 18.09L15.65 17.84C15.9537 17.6646 16.206 17.4125 16.3815 17.1088C16.5571 16.8052 16.6496 16.4607 16.65 16.11V15.89C16.6496 15.5393 16.5571 15.1948 16.3815 14.8912C16.206 14.5875 15.9537 14.3354 15.65 14.16L15.22 13.91C14.9163 13.7346 14.664 13.4825 14.4885 13.1788C14.3129 12.8752 14.2204 12.5307 14.22 12.18V11.82C14.2204 11.4693 14.3129 11.1248 14.4885 10.8212C14.664 10.5175 14.9163 10.2654 15.22 10.09L15.65 9.84C15.9537 9.66464 16.206 9.41248 16.3815 9.10884C16.5571 8.80519 16.6496 8.46073 16.65 8.11V7.89C16.6496 7.53927 16.5571 7.19481 16.3815 6.89116C16.206 6.58752 15.9537 6.33536 15.65 6.16L15.22 5.91C14.9163 5.73464 14.664 5.48248 14.4885 5.17884C14.3129 4.87519 14.2204 4.53073 14.22 4.18V4C14.22 3.46957 14.0093 2.96086 13.6342 2.58579C13.2591 2.21071 12.7504 2 12.22 2Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
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
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="user-info">
              <p className="user-name">{user?.username}</p>
              <p className="user-role">System Admin</p>
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
                setMobileSidebarOpen(false);
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
        <h1 className="page-title">Director of Studies Dashboard</h1>
        <p className="page-subtitle">Welcome, {user?.username}! Here are your key stats.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-value">{stats.totalStudents}</div>
          <div className="stats-label">Total Students</div>
          <div className="stats-icon">🎓</div>
        </div>
        <div className="stats-card">
          <div className="stats-value">{stats.totalUsers}</div>
          <div className="stats-label">Total Supervisors</div>
          <div className="stats-icon">👨‍🏫</div>
        </div>
        <div className="stats-card">
          <div className="stats-value">{vivaTeams.length}</div>
          <div className="stats-label">Total Viva</div>
          <div className="stats-icon">🎯</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="content-grid">
        <div className="info-panel">
          <div className="panel-header">
            <h3 className="panel-title">Quick Actions</h3>
          </div>
          <div className="professional-list">
            <div className="list-item">
              <span className="list-icon">🎓</span>
              <span className="list-text">Manage Students</span>
              <button 
                className="btn secondary btn-sm"
                onClick={() => setActiveSection('students')}
              >
                Go →
              </button>
            </div>
            <div className="list-item">
              <span className="list-icon">👨‍🏫</span>
              <span className="list-text">Manage Supervisors</span>
              <button 
                className="btn secondary btn-sm"
                onClick={() => setActiveSection('supervisors')}
              >
                Go →
              </button>
            </div>
            <div className="list-item">
              <span className="list-icon">🎯</span>
              <span className="list-text">Manage Viva Teams</span>
              <button 
                className="btn secondary btn-sm"
                onClick={() => setActiveSection('viva-teams')}
              >
                Go →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  

  const renderStudentManagement = () => (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Student Management</h1>
        <p className="page-subtitle">Manage student records, programmes, and academic information</p>
        <div className="header-actions">
          <button 
            className="btn primary"
            onClick={() => setShowCreateStudentModal(true)}
          >
            ➕ Create Student
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="form-group">
          <label className="form-label">Search Students</label>
          <input
            type="text"
            placeholder="Search by name..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Programme Filter</label>
          <input
            type="text"
            placeholder="Filter by programme..."
            value={programmeFilter}
            onChange={(e) => setProgrammeFilter(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Student Number</label>
          <input
            type="text"
            placeholder="Search by Student Number"
            value={studentNumberSearch}
            onChange={(e) => setStudentNumberSearch(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group button-shift">
          <button 
            onClick={handleSearchStudentByNumber}
            disabled={searchingStudentById}
            className="btn secondary"
          >
            {searchingStudentById ? 'Searching...' : '🔍 Search'}
          </button>
        </div>
        <div className="form-group button-shift">
          <button 
            onClick={fetchStudents}
            disabled={studentsLoading}
            className="btn secondary"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {studentsError && (
        <div className="alert alert-error">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">{studentsError}</div>
        </div>
      )}

      {/* Students Table */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Student Records</h2>
          <span className="card-subtitle">{students.length} students found</span>
        </div>
        {studentsLoading ? (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading students...</div>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Student Details</th>
                <th>Programme</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.student_number}>
                  <td><strong>#{student.student_number}</strong></td>
                  <td>
                    <div className="student-details">
                      <div className="student-name">{student.forename} {student.surname}</div>
                      <div className="student-course">Course: {student.course_code}</div>
                    </div>
                  </td>
                  <td>
                    <div className="programme-info">
                      <div className="programme-name">{student.programme_of_study}</div>
                      <span className={`status-badge ${student.international_student ? 'international' : 'domestic'}`}>
                        {student.international_student ? '🌍 International' : '🏠 Domestic'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge active">✅ Active</span>
                  </td>
                  <td>
                    <div className="action-dropdown-wrapper">
                      <button
                        className="hamburger-btn"
                        onClick={() => setOpenDropdown(openDropdown === student.student_number ? null : student.student_number)}
                        title="Actions"
                      >
                        <span className="hamburger-icon">&#9776;</span>
                      </button>
                      {openDropdown === student.student_number && (
                        <div className="action-dropdown-row">
                          <button
                            onClick={() => {
                              handleViewStudent(student.student_number);
                              setOpenDropdown(null);
                            }}
                            disabled={studentDetailLoading}
                            className="dropdown-btn secondary btn-sm"
                            title="View Details"
                          >
                            {studentDetailLoading ? 'Loading...' : 'View'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowStudentModal(true);
                              setOpenDropdown(null);
                            }}
                            className="dropdown-btn primary btn-sm"
                            title="Edit Student"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteStudent(student.student_number);
                              setOpenDropdown(null);
                            }}
                            className="dropdown-btn danger btn-sm"
                            title="Delete Student"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!studentsLoading && students.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🎓</div>
            <div className="empty-state-title">No Students Found</div>
            <div className="empty-state-description">Try adjusting your search criteria or create a new student record</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSupervisorManagement = () => (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Supervisor Management</h1>
        <p className="page-subtitle">Manage supervisor accounts and academic department assignments</p>
        <div className="header-actions">
          <button 
            className="btn primary"
            onClick={() => setShowCreateSupervisorModal(true)}
          >
            ➕ Add New Supervisor
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="form-group">
          <label className="form-label">Search Supervisors</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={supervisorSearch}
            onChange={(e) => setSupervisorSearch(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Department Filter</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="form-select"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Business">Business</option>
            <option value="Psychology">Psychology</option>
            <option value="Education">Education</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Supervisor ID</label>
          <input
            type="text"
            placeholder="Search by Supervisor ID..."
            value={supervisorIdSearch}
            onChange={(e) => setSupervisorIdSearch(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group button-shift">
          <button 
            onClick={async () => {
              if (!supervisorIdSearch.trim()) return;
              try {
                setSearchingSupervisorById(true);
                setSupervisorsError('');
                const supervisor = await supervisorAPI.getSupervisorById(supervisorIdSearch);
                setSearchedSupervisor(supervisor);
                setShowSupervisorDetailModal(true);
              } catch (error) {
                setSupervisorsError(`Supervisor not found: ${extractErrorMessage(error, 'Supervisor not found')}`);
              } finally {
                setSearchingSupervisorById(false);
              }
            }}
            disabled={searchingSupervisorById}
            className="btn secondary"
          >
            {searchingSupervisorById ? 'Searching...' : '🔍 Search'}
          </button>
        </div>
        <div className="form-group button-shift">
          <button 
            onClick={fetchSupervisors} 
            disabled={supervisorsLoading}
            className="btn secondary"
          >
            🔄 Refresh All
          </button>
        </div>
      </div>

      {supervisorsError && (
        <div className="alert alert-error">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">{supervisorsError}</div>
        </div>
      )}

      {/* Supervisors Table */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Supervisor Records</h2>
          <span className="card-subtitle">{Array.isArray(supervisors) ? supervisors.length : 0} supervisors found</span>
        </div>
        {supervisorsLoading ? (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading supervisors...</div>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Supervisor ID</th>
                <th>Name & Email</th>
                <th>Department</th>
                <th>Notes</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(supervisors) && supervisors.map(supervisor => (
                <tr key={supervisor.supervisor_id}>
                  <td><strong>#{supervisor.supervisor_id}</strong></td>
                  <td>
                    <div className="supervisor-details">
                      <div className="supervisor-name">{supervisor.supervisor_name}</div>
                      <div className="supervisor-email">{supervisor.email}</div>
                    </div>
                  </td>
                  <td>
                    <div className="department-name">{supervisor.department}</div>
                  </td>
                  <td>
                    <div className="notes-info">{supervisor.supervisor_notes || 'No notes'}</div>
                  </td>
                  <td>
                    <div className="date-info">{new Date(supervisor.created_date).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div className="action-dropdown-wrapper">
                      <button
                        className="hamburger-btn"
                        onClick={() => setOpenDropdown(openDropdown === supervisor.supervisor_id ? null : supervisor.supervisor_id)}
                        title="Actions"
                      >
                        <span className="hamburger-icon">&#9776;</span>
                      </button>
                      {openDropdown === supervisor.supervisor_id && (
                        <div className="action-dropdown-row">
                          <button
                            onClick={() => {
                              setSelectedSupervisor(supervisor);
                              setShowSupervisorDetailModal(true);
                              setOpenDropdown(null);
                            }}
                            className="dropdown-btn secondary btn-sm"
                            title="View Details"
                          >
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSupervisor(supervisor);
                              setShowSupervisorModal(true);
                              setOpenDropdown(null);
                            }}
                            className="dropdown-btn primary btn-sm"
                            title="Edit Supervisor"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this supervisor?')) {
                                try {
                                  await supervisorAPI.deleteSupervisor(supervisor.supervisor_id);
                                  fetchSupervisors();
                                } catch (error) {
                                  setSupervisorsError(`Failed to delete supervisor: ${extractErrorMessage(error, 'Failed to delete supervisor')}`);
                                }
                              }
                              setOpenDropdown(null);
                            }}
                            className="dropdown-btn danger btn-sm"
                            title="Delete Supervisor"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {Array.isArray(supervisors) && supervisors.length === 0 && !supervisorsLoading && (
          <div className="empty-state">
            <div className="empty-state-icon">👨‍🏫</div>
            <div className="empty-state-title">No Supervisors Found</div>
            <div className="empty-state-description">
              No supervisors found. <button className="btn primary btn-sm" onClick={() => setShowCreateSupervisorModal(true)}>Add the first supervisor</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAssignmentManagement = () => (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Student-Supervisor Assignments</h1>
        <p className="page-subtitle">Manage academic assignments and supervision relationships</p>
        <div className="header-actions">
          <button 
            className="btn primary"
            onClick={() => setShowAssignmentModal(true)}
          >
            ➕ Create New Assignment
          </button>
        </div>
      </div>

      {assignmentsError && (
        <div className="alert alert-error">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">{assignmentsError}</div>
        </div>
      )}

      {/* Assignments Table */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Assignment Records</h2>
          <span className="card-subtitle">{Array.isArray(assignments) ? assignments.length : 0} assignments found</span>
        </div>
        {assignmentsLoading ? (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading assignments...</div>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Assignment ID</th>
                <th>Student Number</th>
                <th>Supervisor ID</th>
                <th>Role & Duration</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(assignments) && assignments.map(assignment => (
                <tr key={assignment.student_supervisor_id}>
                  <td><strong>#{assignment.student_supervisor_id}</strong></td>
                  <td>
                    <div className="student-info">
                      <div className="student-number">{assignment.student_number}</div>
                    </div>
                  </td>
                  <td>
                    <div className="supervisor-info">
                      <div className="supervisor-id">{assignment.supervisor_id}</div>
                    </div>
                  </td>
                  <td>
                    <div className="role-duration">
                      <span className="status-badge role">{assignment.role}</span>
                      <div className="duration-info">
                        {new Date(assignment.start_date).toLocaleDateString()} - 
                        {assignment.end_date ? new Date(assignment.end_date).toLocaleDateString() : 'Ongoing'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="notes-info">{assignment.supervision_notes || 'No notes'}</div>
                  </td>
                  <td>
                    <div className="action-dropdown-wrapper">
                      <button
                        className="hamburger-btn"
                        onClick={() => setOpenDropdown(openDropdown === assignment.student_supervisor_id ? null : assignment.student_supervisor_id)}
                        title="Actions"
                      >
                        <span className="hamburger-icon">&#9776;</span>
                      </button>
                      {openDropdown === assignment.student_supervisor_id && (
                        <div className="action-dropdown-row">
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowAssignmentModal(true);
                              setOpenDropdown(null);
                            }}
                            className="dropdown-btn primary btn-sm"
                            title="Edit Assignment"
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to remove this assignment?')) {
                                try {
                                  await assignmentAPI.removeAssignment(assignment.student_supervisor_id);
                                  fetchAssignments();
                                } catch (error) {
                                  setAssignmentsError(`Failed to remove assignment: ${extractErrorMessage(error, 'Failed to remove assignment')}`);
                                }
                              }
                              setOpenDropdown(null);
                            }}
                            className="dropdown-btn danger btn-sm"
                            title="Remove Assignment"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {Array.isArray(assignments) && assignments.length === 0 && !assignmentsLoading && (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No Assignments Found</div>
            <div className="empty-state-description">
              No assignments found. <button className="btn primary btn-sm" onClick={() => setShowAssignmentModal(true)}>Create the first assignment</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderRegistrationManagement = () => (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Registration Management</h1>
        <p className="page-subtitle">Manage student registrations, extensions, and deadlines</p>
      </div>

      {/* Search Section */}
      <div className="search-filter-section">
        <div className="form-group">
          <label className="form-label">Search by Student Number</label>
          <input
            type="text"
            placeholder="Enter student number..."
            value={registrationSearch}
            onChange={(e) => setRegistrationSearch(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group button-shift">
          <button 
            onClick={fetchRegistrations} 
            className="btn secondary"
          >
            🔍 Search
          </button>
        </div>
        <div className="form-group">
          <label className="form-label">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-input"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="extension_requested">Extension Requested</option>
            <option value="extension_approved">Extension Approved</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Search by Registration ID</label>
          <input
            type="text"
            placeholder="Enter Registration ID..."
            value={registrationIdSearch}
            onChange={(e) => setRegistrationIdSearch(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group button-shift">
          <button 
            onClick={async () => {
              if (!registrationIdSearch.trim()) return;
              try {
                setSearchingRegistrationById(true);
                setRegistrationsError('');
                const registration = await registrationAPI.getRegistrationById(registrationIdSearch);
                setSearchedRegistration(registration);
                setShowRegistrationDetailModal(true);
              } catch (error) {
                setRegistrationsError(`Registration not found: ${extractErrorMessage(error, 'Registration not found')}`);
              } finally {
                setSearchingRegistrationById(false);
              }
            }}
            disabled={searchingRegistrationById}
            className="btn primary"
          >
            {searchingRegistrationById ? 'Searching...' : '🔍 Find by ID'}
          </button>
        </div>
      </div>

      {registrationsError && (
        <div className="alert alert-error">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">{registrationsError}</div>
        </div>
      )}

      {/* Registrations Table */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Student Registrations</h2>
          <span className="card-subtitle">{Array.isArray(registrations) ? registrations.length : 0} registrations found</span>
          <button 
            className="btn primary"
            onClick={() => setShowCreateRegistrationModal(true)}
          >
            ➕ Create New Registration
          </button>
        </div>
        {registrationsLoading ? (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading registrations...</div>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Registration ID</th>
                <th>Student Number</th>
                <th>Status</th>
                <th>Original Deadline</th>
                <th>Revised Deadline</th>
                <th>Extension Days</th>
                <th>Process Completed</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(registrations) && registrations.map(registration => (
                <tr key={registration.registration_id}>
                  <td><strong>#{registration.registration_id}</strong></td>
                  <td>{registration.student_number}</td>
                  <td>
                    <span className={`status-badge ${registration.registration_status}`}>
                      {registration.registration_status === 'extension_requested' ? 
                        '⏳ Extension Requested' : 
                        registration.registration_status === 'extension_approved' ?
                        '✅ Extension Approved' :
                        registration.registration_status.charAt(0).toUpperCase() + registration.registration_status.slice(1)
                      }
                    </span>
                  </td>
                  <td>{new Date(registration.original_registration_deadline).toLocaleDateString()}</td>
                  <td>{registration.revised_registration_deadline ? new Date(registration.revised_registration_deadline).toLocaleDateString() : '-'}</td>
                  <td>{registration.registration_extension_length_days || 0}</td>
                  <td>
                    <span className={`status-badge ${registration.pgr_registration_process_completed ? 'completed' : 'pending'}`}>
                      {registration.pgr_registration_process_completed ? '✅ Yes' : '⏳ No'}
                    </span>
                  </td>
                  <td>{new Date(registration.created_date).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => {
                          setSelectedRegistration(registration);
                          setShowRegistrationDetailModal(true);
                        }}
                        className="btn secondary btn-sm"
                        title="View Details"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedRegistration(registration);
                          setShowRegistrationModal(true);
                        }}
                        className="btn primary btn-sm"
                        title="Edit Registration"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedRegistration(registration);
                          setShowExtensionModal(true);
                        }}
                        className="btn warning btn-sm"
                        title="Request Extension"
                      >
                        Extension
                      </button>
                      {registration.registration_status === 'extension_requested' && (
                        <button 
                          onClick={() => handleApproveExtension(registration.registration_id)}
                          className="btn primary btn-sm"
                          title="Approve the extension request"
                        >
                          ✓ Approve Extension
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!registrationsLoading && Array.isArray(registrations) && registrations.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No Registrations Found</div>
            <div className="empty-state-description">Try adjusting your search criteria or create a new registration</div>
            <button 
              className="btn primary"
              onClick={() => setShowCreateRegistrationModal(true)}
            >
              ➕ Create First Registration
            </button>
          </div>
        )}
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
          <button 
            className="btn primary"
            onClick={() => setShowCreateVivaTeamModal(true)}
          >
            ➕ Propose Viva Team
          </button>
        </div>
        {vivaTeamsLoading ? (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading viva teams...</div>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Team ID</th>
                <th>Student Number</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Examiners</th>
                <th>Proposed Date</th>
                <th>Scheduled Date</th>
                <th>Location</th>
                <th>Outcome</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(vivaTeams) && vivaTeams.map(vivaTeam => (
                <tr key={vivaTeam.id}>
                  <td><strong>#{vivaTeam.id}</strong></td>
                  <td>{vivaTeam.student_number}</td>
                  <td>
                    <span className={`status-badge stage-${vivaTeam.stage}`}>
                      {vivaTeam.stage.charAt(0).toUpperCase() + vivaTeam.stage.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${vivaTeam.status}`}>
                      {vivaTeam.status === 'proposed' ? '📋 Proposed' :
                       vivaTeam.status === 'approved' ? '✅ Approved' :
                       vivaTeam.status === 'rejected' ? '❌ Rejected' :
                       vivaTeam.status === 'scheduled' ? '📅 Scheduled' :
                       vivaTeam.status === 'completed' ? '🎓 Completed' :
                       vivaTeam.status}
                    </span>
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
                  <td>{vivaTeam.proposed_date ? new Date(vivaTeam.proposed_date).toLocaleDateString() : 'N/A'}</td>
                  <td>{vivaTeam.scheduled_date ? new Date(vivaTeam.scheduled_date).toLocaleDateString() : 'Not Scheduled'}</td>
                  <td>{vivaTeam.location || 'TBD'}</td>
                  <td>
                    {vivaTeam.outcome ? (
                      <span className={`status-badge outcome-${vivaTeam.outcome.toLowerCase()}`}>
                        {vivaTeam.outcome}
                      </span>
                    ) : 'Pending'}
                  </td>
                  <td>
                      <div className="action-dropdown-wrapper">
                        <button
                          className="hamburger-btn"
                          onClick={() => setOpenDropdown(openDropdown === vivaTeam.id ? null : vivaTeam.id)}
                          aria-label="Open actions"
                        >
                          <span className="hamburger-icon">&#9776;</span>
                        </button>
                        {openDropdown === vivaTeam.id && (
                          <div className="action-dropdown-row">
                            <button
                              className="dropdown-btn"
                              onClick={() => {
                                setSelectedVivaTeam(vivaTeam);
                                setShowVivaTeamDetailModal(true);
                                setOpenDropdown(null);
                              }}
                            >
                              View
                            </button>
                            {vivaTeam.status === 'proposed' && (
                              <>
                                <button
                                  className="dropdown-btn"
                                  onClick={() => {
                                    handleApproveVivaTeam(vivaTeam.id);
                                    setOpenDropdown(null);
                                  }}
                                >
                                  Approve
                                </button>
                                <button
                                  className="dropdown-btn"
                                  onClick={() => {
                                    setSelectedVivaTeam(vivaTeam);
                                    setShowRejectModal(true);
                                    setOpenDropdown(null);
                                  }}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {vivaTeam.status === 'approved' && (
                              <button
                                className="dropdown-btn"
                                onClick={() => {
                                  setSelectedVivaTeam(vivaTeam);
                                  setShowScheduleModal(true);
                                  setOpenDropdown(null);
                                }}
                              >
                                Schedule
                              </button>
                            )}
                            {vivaTeam.status === 'scheduled' && !vivaTeam.outcome && (
                              <button
                                className="dropdown-btn"
                                onClick={() => {
                                  setSelectedVivaTeam(vivaTeam);
                                  setShowOutcomeModal(true);
                                  setOpenDropdown(null);
                                }}
                              >
                                Submit Outcome
                              </button>
                            )}
                            {vivaTeam.status !== 'completed' && (
                              <button
                                className="dropdown-btn"
                                onClick={() => {
                                  setSelectedVivaTeam(vivaTeam);
                                  setShowVivaTeamModal(true);
                                  setOpenDropdown(null);
                                }}
                              >
                                Edit
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

        {!vivaTeamsLoading && Array.isArray(vivaTeams) && vivaTeams.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No Viva Teams Found</div>
            <div className="empty-state-description">Try adjusting your search criteria or propose a new viva team</div>
            <button 
              className="btn primary"
              onClick={() => setShowCreateVivaTeamModal(true)}
            >
              ➕ Propose First Viva Team
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSubmissionManagement = () => (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Submission Management</h1>
        <p className="page-subtitle">Review, approve, and manage student submissions and documents</p>
      </div>

      {/* Search Section */}
      <div className="search-filter-section">
        <div className="form-group">
          <label className="form-label">Search Submissions</label>
          <input
            type="text"
            placeholder="Search by student number, title..."
            value={submissionSearchTerm}
            onChange={(e) => setSubmissionSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group button-shift">
          <button 
            onClick={() => fetchSubmissions(submissionSearchTerm)} 
            className="btn secondary"
          >
            🔍 Search
          </button>
        </div>
        <div className="form-group">
          <label className="form-label">Filter by Status</label>
          <select
            value={submissionStatusFilter}
            onChange={(e) => setSubmissionStatusFilter(e.target.value)}
            className="form-input"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="revision_required">Revision Required</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Filter by Type</label>
          <select
            value={submissionTypeFilter}
            onChange={(e) => setSubmissionTypeFilter(e.target.value)}
            className="form-input"
          >
            <option value="">All Types</option>
            <option value="registration">Registration</option>
            <option value="viva_document">Viva Document</option>
            <option value="thesis">Thesis</option>
            <option value="correction">Correction</option>
            <option value="annual_report">Annual Report</option>
          </select>
        </div>
        <div className="form-group button-shift">
          <button 
            onClick={() => fetchSubmissions(submissionSearchTerm, submissionStatusFilter, submissionTypeFilter)}
            className="btn primary"
          >
            🔍 Apply Filters
          </button>
        </div>
        <div className="form-group">
          <button 
            onClick={testSubmissionAPI}
            className="btn secondary"
          >
            🔧 Test API
          </button>
        </div>
      </div>

      {submissionsError && (
        <div className="alert alert-error">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">{submissionsError}</div>
        </div>
      )}

      {/* Submissions Table */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Student Submissions</h2>
          <span className="card-subtitle">{Array.isArray(submissions) ? submissions.length : 0} submissions found</span>
        </div>
        {submissionsLoading ? (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading submissions...</div>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Submitted Date</th>
                <th>Deadline</th>
                <th>Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(submissions) && submissions.map((submission) => (
                <tr key={submission.id}>
                  <td>
                    <div className="student-info">
                      <strong>{submission.student_number || 'N/A'}</strong>
                      <small>Student Number: {submission.student_number}</small>
                    </div>
                  </td>
                  <td>
                    <div className="submission-title">
                      {submission.title || 'No Title'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${submission.submission_type?.toLowerCase()}`}>
                      {submission.submission_type?.replace('_', ' ') || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${submission.status?.toLowerCase()}`}>
                      {submission.status?.replace('_', ' ') || 'N/A'}
                    </span>
                  </td>
                  <td>
                    {submission.submission_date ? new Date(submission.submission_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    {submission.review_deadline ? new Date(submission.review_deadline).toLocaleDateString() : 'N/A'}
                    {submission.review_deadline && new Date(submission.review_deadline) < new Date() && (
                      <span className="deadline-warning"> (⚠️ Overdue)</span>
                    )}
                  </td>
                  <td>
                    <div className="document-count">
                      {submission.file_name ? '📄 1 document' : '📄 No documents'}
                      {submission.file_name && (
                        <div className="file-info">
                          <small>{submission.file_name}</small>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                      <div className="action-dropdown-wrapper">
                        <button
                          className="hamburger-btn"
                          onClick={() => setOpenDropdown(openDropdown === submission.id ? null : submission.id)}
                          aria-label="Open actions"
                        >
                          <span className="hamburger-icon">&#9776;</span>
                        </button>
                        {openDropdown === submission.id && (
                          <div className="action-dropdown-row">
                            <button
                              className="dropdown-btn"
                              onClick={async () => {
                                try {
                                  await fetchSubmissionById(submission.id);
                                  setShowSubmissionDetailModal(true);
                                } catch (error) {
                                  console.error('Error loading submission details:', error);
                                  setSelectedSubmission(submission);
                                  setShowSubmissionDetailModal(true);
                                }
                                setOpenDropdown(null);
                              }}
                            >
                              View
                            </button>
                            {submission.status === 'submitted' && (
                              <button
                                className="dropdown-btn"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setShowSubmissionReviewModal(true);
                                  setOpenDropdown(null);
                                }}
                              >
                                Review
                              </button>
                            )}
                            {submission.status === 'under_review' && (
                              <>
                                <button
                                  className="dropdown-btn"
                                  onClick={() => {
                                    handleApproveSubmission(submission.id);
                                    setOpenDropdown(null);
                                  }}
                                >
                                  ✓ Approve
                                </button>
                                <button
                                  className="dropdown-btn"
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setShowSubmissionRejectModal(true);
                                    setOpenDropdown(null);
                                  }}
                                >
                                  ✗ Reject
                                </button>
                              </>
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

        {!submissionsLoading && Array.isArray(submissions) && submissions.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <div className="empty-state-title">No Submissions Found</div>
            <div className="empty-state-description">Try adjusting your search criteria or check back later for new submissions</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="main-content">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Manage your account information and security settings</p>
      </div>

      {/* Profile Information Card */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Account Information</h2>
          <span className="card-subtitle">Your current profile details</span>
        </div>
        <div className="profile-info-section">
          <div className="profile-detail-row">
            <div className="profile-detail-label">
              <strong>👤 Username:</strong>
            </div>
            <div className="profile-detail-value">
              {user?.username || 'Not set'}
            </div>
          </div>
          <div className="profile-detail-row">
            <div className="profile-detail-label">
              <strong>📧 Email:</strong>
            </div>
            <div className="profile-detail-value">
              {user?.email || 'Not set'}
            </div>
          </div>
          <div className="profile-detail-row">
            <div className="profile-detail-label">
              <strong>🔐 Role:</strong>
            </div>
            <div className="profile-detail-value">
              <span className="status-badge admin">
                {user?.role || 'Not assigned'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Card */}
      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Account Actions</h2>
          <span className="card-subtitle">Update your profile or change security settings</span>
        </div>
        <div className="profile-actions-section">
          <button 
            onClick={() => setShowProfileModal(true)}
            className="btn primary profile-action-btn"
          >
            ✏️ Update Profile
          </button>
          <button 
            onClick={() => setShowChangePasswordModal(true)}
            className="btn secondary profile-action-btn"
          >
            🔒 Change Password
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'students':
        return renderStudentManagement();
      case 'supervisors':
        return renderSupervisorManagement();
      case 'assignments':
        return renderAssignmentManagement();
      case 'registrations':
        return renderRegistrationManagement();
      case 'viva-teams':
        return renderVivaTeamManagement();
      case 'submissions':
        return renderSubmissionManagement();
      case 'appraisals':
        return renderAppraisalManagement();
      case 'profile':
        return renderProfile();
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
            {activeSection === 'dashboard' && 'Director of Studies Dashboard'}
            {activeSection === 'users' && 'User Management'}
            {activeSection === 'students' && 'Student Management'}
            {activeSection === 'supervisors' && 'Supervisor Management'}
            {activeSection === 'assignments' && 'Assignments'}
            {activeSection === 'registrations' && 'Registrations'}
            {activeSection === 'submissions' && 'Submissions'}
            {activeSection === 'viva-teams' && 'Viva Teams'}
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


      {/* Student Management Modals */}
      {showCreateStudentModal && (
        <CreateStudentModal
          onClose={() => setShowCreateStudentModal(false)}
          onSave={handleCreateStudent}
        />
      )}

      {showStudentModal && selectedStudent && (
        <StudentEditModal
          student={selectedStudent}
          onClose={() => {
            setShowStudentModal(false);
            setSelectedStudent(null);
          }}
          onSave={handleUpdateStudent}
        />
      )}

      {showStudentDetailModal && (selectedStudent || searchedStudent) && (
        <StudentDetailModal
          student={selectedStudent || searchedStudent}
          onClose={() => {
            setShowStudentDetailModal(false);
            setSelectedStudent(null);
            setSearchedStudent(null);
          }}
          onEdit={() => {
            setShowStudentDetailModal(false);
            setShowStudentModal(true);
          }}
          onDelete={handleDeleteStudent}
        />
      )}

      {showCreateStudentModal && (
        <CreateStudentModal
          onClose={() => setShowCreateStudentModal(false)}
          onSave={handleCreateStudent}
        />
      )}

      {/* Supervisor Management Modals */}
      {showSupervisorModal && selectedSupervisor && (
        <SupervisorEditModal
          supervisor={selectedSupervisor}
          onClose={() => {
            setShowSupervisorModal(false);
            setSelectedSupervisor(null);
          }}
          onSave={handleUpdateSupervisor}
        />
      )}

      {showCreateSupervisorModal && (
        <SupervisorCreateModal
          onClose={() => setShowCreateSupervisorModal(false)}
          onSave={handleCreateSupervisor}
        />
      )}

      {showSupervisorDetailModal && (selectedSupervisor || searchedSupervisor) && (
        <SupervisorDetailModal
          supervisor={selectedSupervisor || searchedSupervisor}
          onClose={() => {
            setShowSupervisorDetailModal(false);
            setSelectedSupervisor(null);
            setSearchedSupervisor(null);
          }}
          onEdit={() => {
            setShowSupervisorDetailModal(false);
            setShowSupervisorModal(true);
          }}
          onDelete={handleDeleteSupervisor}
        />
      )}

      {/* Assignment Management Modals */}
      {showAssignmentModal && (
        <AssignmentModal
          assignment={selectedAssignment}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedAssignment(null);
          }}
          onSave={handleAssignmentSave}
        />
      )}

      {/* Registration Management Modals */}
      {showRegistrationModal && selectedRegistration && (
        <RegistrationEditModal
          registration={selectedRegistration}
          onClose={() => {
            setShowRegistrationModal(false);
            setSelectedRegistration(null);
          }}
          onSave={handleUpdateRegistration}
        />
      )}

      {showCreateRegistrationModal && (
        <RegistrationCreateModal
          onClose={() => setShowCreateRegistrationModal(false)}
          onSave={handleCreateRegistration}
        />
      )}

      {showRegistrationDetailModal && (selectedRegistration || searchedRegistration) && (
        <RegistrationDetailModal
          registration={selectedRegistration || searchedRegistration}
          onClose={() => {
            setShowRegistrationDetailModal(false);
            setSelectedRegistration(null);
            setSearchedRegistration(null);
          }}
          onEdit={() => {
            setShowRegistrationDetailModal(false);
            setShowRegistrationModal(true);
          }}
          onApproveExtension={handleApproveExtension}
        />
      )}

      {showExtensionModal && selectedRegistration && (
        <ExtensionModal
          registration={selectedRegistration}
          onClose={() => {
            setShowExtensionModal(false);
            setSelectedRegistration(null);
          }}
          onSave={handleExtensionRequest}
        />
      )}

      {/* Viva Team Management Modals */}
      {showCreateVivaTeamModal && (
        <VivaTeamCreateModal
          onClose={() => setShowCreateVivaTeamModal(false)}
          onSave={handleCreateVivaTeam}
        />
      )}

      {showVivaTeamModal && selectedVivaTeam && (
        <VivaTeamEditModal
          vivaTeam={selectedVivaTeam}
          onClose={() => {
            setShowVivaTeamModal(false);
            setSelectedVivaTeam(null);
          }}
          onSave={handleUpdateVivaTeam}
        />
      )}

      {showVivaTeamDetailModal && selectedVivaTeam && (
        <VivaTeamDetailModal
          vivaTeam={selectedVivaTeam}
          onClose={() => {
            setShowVivaTeamDetailModal(false);
            setSelectedVivaTeam(null);
          }}
          onEdit={() => {
            setShowVivaTeamDetailModal(false);
            setShowVivaTeamModal(true);
          }}
          onApprove={() => handleApproveVivaTeam(selectedVivaTeam.team_id)}
          onReject={() => {
            setShowVivaTeamDetailModal(false);
            setShowRejectModal(true);
          }}
          onSchedule={() => {
            setShowVivaTeamDetailModal(false);
            setShowScheduleModal(true);
          }}
          onSubmitOutcome={() => {
            setShowVivaTeamDetailModal(false);
            setShowOutcomeModal(true);
          }}
        />
      )}

      {showRejectModal && selectedVivaTeam && (
        <VivaTeamRejectModal
          vivaTeam={selectedVivaTeam}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedVivaTeam(null);
          }}
          onSave={handleRejectVivaTeam}
        />
      )}

      {showScheduleModal && selectedVivaTeam && (
        <VivaScheduleModal
          vivaTeam={selectedVivaTeam}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedVivaTeam(null);
          }}
          onSave={handleScheduleViva}
        />
      )}

      {showOutcomeModal && selectedVivaTeam && (
        <VivaOutcomeModal
          vivaTeam={selectedVivaTeam}
          onClose={() => {
            setShowOutcomeModal(false);
            setSelectedVivaTeam(null);
          }}
          onSave={handleSubmitVivaOutcome}
        />
      )}

      {/* Submission Management Modals */}
      {showSubmissionDetailModal && selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => {
            setShowSubmissionDetailModal(false);
            setSelectedSubmission(null);
          }}
        />
      )}

      {showSubmissionReviewModal && selectedSubmission && (
        <SubmissionReviewModal
          submission={selectedSubmission}
          onClose={() => {
            setShowSubmissionReviewModal(false);
            setSelectedSubmission(null);
          }}
          onSave={handleReviewSubmission}
        />
      )}

      {showSubmissionRejectModal && selectedSubmission && (
        <SubmissionRejectModal
          submission={selectedSubmission}
          onClose={() => {
            setShowSubmissionRejectModal(false);
            setSelectedSubmission(null);
          }}
          onSave={handleRejectSubmission}
        />
      )}

      {/* Profile Management Modals */}
      {showProfileModal && (
        <ProfileEditModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onSave={handleProfileUpdate}
        />
      )}

      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
          onSave={handleChangePassword}
        />
      )}
    </div>
  );
};

// Modal Components
const UserEditModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || '',
    is_active: user?.is_active || false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await onSave(user.id, formData);
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to update user'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit User</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username:</label>
              <input
                type="text"
                className="form-input"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email:</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Role:</label>
              <select
                className="form-input"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required
              >
                <option value="student">Student</option>
                <option value="academic_admin">Academic Admin</option>
                <option value="Dos_admin">Dos Admin</option>
                <option value="system_admin">System Admin</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                />
                Active
              </label>
            </div>
          </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button 
            type="submit" 
            className="btn primary" 
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PasswordResetModal = ({ user, onClose, onSave }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave(user.id, password);
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to reset password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Reset Password for {user?.username}</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password:</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Confirm Password:</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button 
            type="submit" 
            className="btn warning" 
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
};

const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">User Details</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="detail-content">
            <div className="detail-row">
              <strong>ID:</strong> {user.id}
            </div>
            <div className="detail-row">
              <strong>Username:</strong> {user.username}
            </div>
            <div className="detail-row">
              <strong>Email:</strong> {user.email}
            </div>
            <div className="detail-row">
              <strong>Role:</strong> {user.role}
            </div>
            <div className="detail-row">
              <strong>Active:</strong> {user.is_active ? 'Yes' : 'No'}
            </div>
            <div className="detail-row">
              <strong>Created:</strong> {new Date(user.created_date).toLocaleString()}
            </div>
            <div className="detail-row">
              <strong>Updated:</strong> {new Date(user.updated_date).toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const CreateStudentModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    student_number: '',
    forename: '',
    surname: '',
    cohort: '',
    course_code: '',
    quercus_course_name: '',
    subject_area: '',
    programme_of_study: '',
    mode: '',
    international_student: false,
    previous_ehu_student: false,
    previous_ehu_undergraduate: false,
    previous_ehu_pgt_student: false,
    previous_ehu_mres_student: false,
    previous_institution: '',
    student_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Get the current form data at the time of submission
    const currentFormData = { ...formData };
    console.log('Form submitted with data:', currentFormData);
    
    // Validate using the current form data
    const requiredFields = [
      { field: 'student_number', label: 'Student Number' },
      { field: 'forename', label: 'Forename' },
      { field: 'surname', label: 'Surname' },
      { field: 'cohort', label: 'Cohort' },
      { field: 'course_code', label: 'Course Code' },
      { field: 'quercus_course_name', label: 'Quercus Course Name' },
      { field: 'subject_area', label: 'Subject Area' },
      { field: 'programme_of_study', label: 'Programme of Study' },
      { field: 'mode', label: 'Mode' }
    ];
    
    const missingFields = [];
    
    for (const { field, label } of requiredFields) {
      if (!currentFormData[field] || currentFormData[field].trim() === '') {
        missingFields.push(label);
      }
    }
    
    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      console.log('Missing fields:', missingFields);
      console.log('Current form data:', currentFormData);
      return;
    }
    
    if (!['full-time', 'part-time'].includes(currentFormData.mode)) {
      setError('Please select a valid mode (full-time or part-time)');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Clean up the data before submission
      const cleanedData = {
        ...currentFormData,
        student_number: currentFormData.student_number.trim(),
        forename: currentFormData.forename.trim(),
        surname: currentFormData.surname.trim(),
        cohort: currentFormData.cohort.trim(),
        course_code: currentFormData.course_code.trim(),
        quercus_course_name: currentFormData.quercus_course_name.trim(),
        subject_area: currentFormData.subject_area.trim(),
        programme_of_study: currentFormData.programme_of_study.trim(),
        mode: currentFormData.mode.trim(),
        previous_institution: currentFormData.previous_institution.trim(),
        student_notes: currentFormData.student_notes.trim()
      };
      
      console.log('Sending cleaned data to API:', cleanedData);
      await onSave(cleanedData);
    } catch (error) {
      console.error('Error creating student:', error);
      setError(extractErrorMessage(error, 'Failed to create student'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Create New Student</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
        
        <form id="create-student-form" onSubmit={handleSubmit} className="student-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Student Number: *</label>
              <input
                type="text"
                className="form-input"
                value={formData.student_number}
                onChange={(e) => setFormData({...formData, student_number: e.target.value})}
                placeholder="Enter student number"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Course Code: *</label>
              <input
                type="text"
                className="form-input"
                value={formData.course_code}
                onChange={(e) => setFormData({...formData, course_code: e.target.value})}
                placeholder="Enter course code"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Forename: *</label>
              <input
                type="text"
                value={formData.forename}
                onChange={(e) => setFormData({...formData, forename: e.target.value})}
                placeholder="Enter first name"
              />
            </div>
            <div className="form-group">
              <label>Surname: *</label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => setFormData({...formData, surname: e.target.value})}
                placeholder="Enter last name"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Cohort: *</label>
              <input
                type="text"
                value={formData.cohort}
                onChange={(e) => setFormData({...formData, cohort: e.target.value})}
                placeholder="Enter cohort (e.g., 2024/25)"
              />
            </div>
            <div className="form-group">
              <label>Programme of Study: *</label>
              <input
                type="text"
                value={formData.programme_of_study}
                onChange={(e) => setFormData({...formData, programme_of_study: e.target.value})}
                placeholder="Enter programme of study"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Quercus Course Name: *</label>
            <input
              type="text"
              value={formData.quercus_course_name}
              onChange={(e) => setFormData({...formData, quercus_course_name: e.target.value})}
              placeholder="Enter Quercus course name"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Subject Area: *</label>
              <input
                type="text"
                value={formData.subject_area}
                onChange={(e) => setFormData({...formData, subject_area: e.target.value})}
                placeholder="Enter subject area"
              />
            </div>
            <div className="form-group">
              <label>Mode: *</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({...formData, mode: e.target.value})}
              >
                <option value="">Select Mode</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Previous Institution:</label>
            <input
              type="text"
              value={formData.previous_institution}
              onChange={(e) => setFormData({...formData, previous_institution: e.target.value})}
            />
          </div>
          
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.international_student}
                onChange={(e) => setFormData({...formData, international_student: e.target.checked})}
              />
              International Student
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.previous_ehu_student}
                onChange={(e) => setFormData({...formData, previous_ehu_student: e.target.checked})}
              />
              Previous EHU Student
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.previous_ehu_undergraduate}
                onChange={(e) => setFormData({...formData, previous_ehu_undergraduate: e.target.checked})}
              />
              Previous EHU Undergraduate
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.previous_ehu_pgt_student}
                onChange={(e) => setFormData({...formData, previous_ehu_pgt_student: e.target.checked})}
              />
              Previous EHU PGT Student
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.previous_ehu_mres_student}
                onChange={(e) => setFormData({...formData, previous_ehu_mres_student: e.target.checked})}
              />
              Previous EHU MRes Student
            </label>
          </div>
          
          <div className="form-group">
            <label>Student Notes:</label>
            <textarea
              value={formData.student_notes}
              onChange={(e) => setFormData({...formData, student_notes: e.target.value})}
              rows={4}
            />
          </div>
        </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button 
            type="button" 
            className="btn primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Student'}
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentEditModal = ({ student, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    forename: student?.forename || '',
    surname: student?.surname || '',
    cohort: student?.cohort || '',
    course_code: student?.course_code || '',
    quercus_course_name: student?.quercus_course_name || '',
    subject_area: student?.subject_area || '',
    programme_of_study: student?.programme_of_study || '',
    mode: student?.mode || '',
    international_student: student?.international_student || false,
    previous_ehu_student: student?.previous_ehu_student || false,
    previous_ehu_undergraduate: student?.previous_ehu_undergraduate || false,
    previous_ehu_pgt_student: student?.previous_ehu_pgt_student || false,
    previous_ehu_mres_student: student?.previous_ehu_mres_student || false,
    previous_institution: student?.previous_institution || '',
    student_notes: student?.student_notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await onSave(student.student_number, formData);
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to update student'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit Student: {student?.student_number}</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          
          <form id="student-edit-form" onSubmit={handleSubmit} className="student-form">
          <div className="form-row">
            <div className="form-group">
              <label>Forename:</label>
              <input
                type="text"
                value={formData.forename}
                onChange={(e) => setFormData({...formData, forename: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Surname:</label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => setFormData({...formData, surname: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Cohort:</label>
              <input
                type="text"
                value={formData.cohort}
                onChange={(e) => setFormData({...formData, cohort: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Course Code:</label>
              <input
                type="text"
                value={formData.course_code}
                onChange={(e) => setFormData({...formData, course_code: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Programme of Study:</label>
            <input
              type="text"
              value={formData.programme_of_study}
              onChange={(e) => setFormData({...formData, programme_of_study: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Quercus Course Name:</label>
            <input
              type="text"
              value={formData.quercus_course_name}
              onChange={(e) => setFormData({...formData, quercus_course_name: e.target.value})}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Subject Area:</label>
              <input
                type="text"
                value={formData.subject_area}
                onChange={(e) => setFormData({...formData, subject_area: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Mode:</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({...formData, mode: e.target.value})}
              >
                <option value="">Select Mode</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Previous Institution:</label>
            <input
              type="text"
              value={formData.previous_institution}
              onChange={(e) => setFormData({...formData, previous_institution: e.target.value})}
            />
          </div>
          
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.international_student}
                onChange={(e) => setFormData({...formData, international_student: e.target.checked})}
              />
              International Student
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.previous_ehu_student}
                onChange={(e) => setFormData({...formData, previous_ehu_student: e.target.checked})}
              />
              Previous EHU Student
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.previous_ehu_undergraduate}
                onChange={(e) => setFormData({...formData, previous_ehu_undergraduate: e.target.checked})}
              />
              Previous EHU Undergraduate
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.previous_ehu_pgt_student}
                onChange={(e) => setFormData({...formData, previous_ehu_pgt_student: e.target.checked})}
              />
              Previous EHU PGT Student
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.previous_ehu_mres_student}
                onChange={(e) => setFormData({...formData, previous_ehu_mres_student: e.target.checked})}
              />
              Previous EHU MRes Student
            </label>
          </div>
          
          <div className="form-group">
            <label>Student Notes:</label>
            <textarea
              value={formData.student_notes}
              onChange={(e) => setFormData({...formData, student_notes: e.target.value})}
              rows={4}
            />
          </div>
          </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" form="student-edit-form" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentDetailModal = ({ student, onClose, onEdit, onDelete }) => {
  console.log('StudentDetailModal received student:', student);
  
  if (!student) {
    console.log('No student data provided to modal');
    return null;
  }

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Student Details: {student.student_number}</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="detail-content">
            <div className="detail-section">
              <h3>Personal Information</h3>
              <div className="detail-row">
                <strong>Student Number:</strong> {student.student_number}
              </div>
              <div className="detail-row">
                <strong>Name:</strong> {student.forename} {student.surname}
              </div>
              <div className="detail-row">
                <strong>International Student:</strong> {student.international_student ? 'Yes' : 'No'}
              </div>
          </div>
          
          <div className="detail-section">
            <h3>Academic Information</h3>
            <div className="detail-row">
              <strong>Course Code:</strong> {student.course_code}
            </div>
            <div className="detail-row">
              <strong>Programme of Study:</strong> {student.programme_of_study}
            </div>
            <div className="detail-row">
              <strong>Cohort:</strong> {student.cohort}
            </div>
            <div className="detail-row">
              <strong>Subject Area:</strong> {student.subject_area}
            </div>
            <div className="detail-row">
              <strong>Mode:</strong> {student.mode}
            </div>
            <div className="detail-row">
              <strong>Quercus Course Name:</strong> {student.quercus_course_name}
            </div>
          </div>
          
          <div className="detail-section">
            <h3>Previous Education</h3>
            <div className="detail-row">
              <strong>Previous EHU Student:</strong> {student.previous_ehu_student ? 'Yes' : 'No'}
            </div>
            <div className="detail-row">
              <strong>Previous EHU Undergraduate:</strong> {student.previous_ehu_undergraduate ? 'Yes' : 'No'}
            </div>
            <div className="detail-row">
              <strong>Previous EHU PGT Student:</strong> {student.previous_ehu_pgt_student ? 'Yes' : 'No'}
            </div>
            <div className="detail-row">
              <strong>Previous EHU MRes Student:</strong> {student.previous_ehu_mres_student ? 'Yes' : 'No'}
            </div>
            <div className="detail-row">
              <strong>Previous Institution:</strong> {student.previous_institution}
            </div>
          </div>
          
          {student.student_notes && (
            <div className="detail-section">
              <h3>Notes</h3>
              <div className="detail-row">
                {student.student_notes}
              </div>
            </div>
          )}
          
          <div className="detail-section">
            <h3>System Information</h3>
            <div className="detail-row">
              <strong>Created:</strong> {new Date(student.created_date).toLocaleString()}
            </div>
            <div className="detail-row">
              <strong>Updated:</strong> {new Date(student.updated_date).toLocaleString()}
            </div>
          </div>
        </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn secondary" onClick={onClose}>Close</button>
          <button className="btn primary" onClick={onEdit}>Edit</button>
          <button 
            className="btn danger" 
            onClick={() => onDelete(student.student_number)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileEditModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await onSave(formData);
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <span className="modal-icon">✏️</span>
            Update Profile
          </h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && (
            <div className="alert alert-error">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">{error}</div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">👤</span>
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="form-input"
                placeholder="Enter your username"
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
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="form-input"
                placeholder="Enter your email address"
                required
              />
            </div>
          </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn secondary">
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading}
            className="btn primary"
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Saving...
              </>
            ) : (
              <>
                <span className="btn-icon">💾</span>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ChangePasswordModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    
    if (formData.new_password.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave({
        current_password: formData.current_password,
        new_password: formData.new_password
      });
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to change password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <span className="modal-icon">🔒</span>
            Change Password
          </h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && (
            <div className="alert alert-error">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">{error}</div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔐</span>
                Current Password
              </label>
              <input
                type="password"
                value={formData.current_password}
                onChange={(e) => setFormData({...formData, current_password: e.target.value})}
                className="form-input"
                placeholder="Enter your current password"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🆕</span>
                New Password
              </label>
              <input
                type="password"
                value={formData.new_password}
                onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                className="form-input"
                placeholder="Enter new password (min. 6 characters)"
                required
                minLength={6}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">✅</span>
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                className="form-input"
                placeholder="Confirm your new password"
                required
                minLength={6}
              />
            </div>
          </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn secondary">
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading}
            className="btn primary"
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Changing...
              </>
            ) : (
              <>
                <span className="btn-icon">🔑</span>
                Change Password
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Supervisor Modal Components
const SupervisorCreateModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    supervisor_name: '',
    email: '',
    department: '',
    supervisor_notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await onSave(formData);
      onClose();
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to create supervisor'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Add New Supervisor</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
        {error && <div className="error-message">{error}</div>}
        
        <form id="supervisor-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Supervisor Name:</label>
            <input
              type="text"
              className="form-input"
              value={formData.supervisor_name}
              onChange={(e) => setFormData({...formData, supervisor_name: e.target.value})}
              required
              placeholder="e.g., Dr. John Smith"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email:</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              placeholder="supervisor@edge.com"
            />
          </div>
          
          <div className="form-group">
            <label>Department:</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              required
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Psychology">Psychology</option>
              <option value="Education">Education</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Notes:</label>
            <textarea
              className="form-input form-textarea"
              value={formData.supervisor_notes}
              onChange={(e) => setFormData({...formData, supervisor_notes: e.target.value})}
              placeholder="Additional notes about the supervisor..."
              rows="3"
            />
          </div>
        </form>
        </div>
          
          <div className="modal-footer">
            <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary" form="supervisor-form" disabled={loading}>
              {loading ? 'Creating...' : 'Create Supervisor'}
            </button>
          </div>
      </div>
    </div>
  );
};

const SupervisorEditModal = ({ supervisor, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    supervisor_name: supervisor?.supervisor_name || '',
    email: supervisor?.email || '',
    department: supervisor?.department || '',
    supervisor_notes: supervisor?.supervisor_notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await onSave(supervisor.supervisor_id, formData);
      onClose();
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to update supervisor'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit Supervisor</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
        {error && <div className="error-message">{error}</div>}
        
        <form id="supervisor-edit-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Supervisor Name:</label>
            <input
              type="text"
              className="form-input"
              value={formData.supervisor_name}
              onChange={(e) => setFormData({...formData, supervisor_name: e.target.value})}
              required
              placeholder="e.g., Dr. John Smith"
            />
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              placeholder="supervisor@edge.com"
            />
          </div>
          
          <div className="form-group">
            <label>Department:</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              required
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
              <option value="Psychology">Psychology</option>
              <option value="Education">Education</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Notes:</label>
            <textarea
              value={formData.supervisor_notes}
              onChange={(e) => setFormData({...formData, supervisor_notes: e.target.value})}
              placeholder="Additional notes about the supervisor..."
              rows="3"
            />
          </div>
        </form>
        </div>
          
          <div className="modal-footer">
            <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary" form="supervisor-edit-form" disabled={loading}>
              {loading ? 'Updating...' : 'Update Supervisor'}
            </button>
          </div>
      </div>
    </div>
  );
};

const SupervisorDetailModal = ({ supervisor, onClose, onEdit, onDelete }) => {
  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Supervisor Details</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
        <div className="detail-content">
          <div className="detail-section">
            <h3>Supervisor Information</h3>
            <div className="detail-row">
              <strong>ID:</strong> {supervisor.supervisor_id}
            </div>
            <div className="detail-row">
              <strong>Name:</strong> {supervisor.supervisor_name}
            </div>
            <div className="detail-row">
              <strong>Email:</strong> {supervisor.email}
            </div>
            <div className="detail-row">
              <strong>Department:</strong> {supervisor.department}
            </div>
            <div className="detail-row">
              <strong>Notes:</strong> {supervisor.supervisor_notes || 'No notes available'}
            </div>
            <div className="detail-row">
              <strong>Created:</strong> {new Date(supervisor.created_date).toLocaleDateString()}
            </div>
          </div>
        </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn secondary" onClick={onClose}>Close</button>
          <button className="btn primary" onClick={onEdit}>Edit</button>
          <button className="btn danger" onClick={() => onDelete(supervisor.supervisor_id)}>Delete</button>
        </div>
      </div>
    </div>
  );
};

const AssignmentModal = ({ assignment, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    student_number: assignment?.student_number || '',
    supervisor_id: assignment?.supervisor_id || '',
    role: assignment?.role || '',
    start_date: assignment?.start_date ? assignment.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
    end_date: assignment?.end_date ? assignment.end_date.split('T')[0] : '',
    supervision_notes: assignment?.supervision_notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [studentsData, supervisorsData] = await Promise.all([
          studentAPI.getAllStudents(0, 100),
          supervisorAPI.getAllSupervisors(0, 100)
        ]);
        setStudents(studentsData);
        setSupervisors(supervisorsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load students and supervisors');
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const submitData = {
        student_number: formData.student_number,
        supervisor_id: parseInt(formData.supervisor_id),
        role: formData.role,
        start_date: formData.start_date,
        supervision_notes: formData.supervision_notes
      };
      
      if (assignment && formData.end_date) {
        submitData.end_date = formData.end_date;
      }
      
      await onSave(submitData);
      onClose();
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to save assignment'));
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="modal-overlay show" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">Loading...</h3>
            <button className="modal-close" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="loading">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{assignment ? 'Edit Assignment' : 'Create New Assignment'}</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Student:</label>
            <select
              className="form-input"
              value={formData.student_number}
              onChange={(e) => setFormData({...formData, student_number: e.target.value})}
              required
              disabled={!!assignment} // Disable editing student in edit mode
            >
              <option value="">Select Student</option>
              {Array.isArray(students) && students.map(student => (
                <option key={student.student_number} value={student.student_number}>
                  {student.first_name} {student.last_name} ({student.student_number})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Supervisor:</label>
            <select
              className="form-input"
              value={formData.supervisor_id}
              onChange={(e) => setFormData({...formData, supervisor_id: e.target.value})}
              required
              disabled={!!assignment} // Disable editing supervisor in edit mode
            >
              <option value="">Select Supervisor</option>
              {Array.isArray(supervisors) && supervisors.map(supervisor => (
                <option key={supervisor.supervisor_id} value={supervisor.supervisor_id}>
                  {supervisor.supervisor_name} ({supervisor.department})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Role:</label>
            <select
              className="form-input"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              required
            >
              <option value="">Select Role</option>
              <option value="Primary Supervisor">Primary Supervisor</option>
              <option value="Secondary Supervisor">Secondary Supervisor</option>
              <option value="Co-Supervisor">Co-Supervisor</option>
              <option value="External Supervisor">External Supervisor</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Start Date:</label>
            <input
              type="date"
              className="form-input"
              value={formData.start_date}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              required
            />
          </div>
          
          {assignment && (
            <div className="form-group">
              <label className="form-label">End Date (optional):</label>
              <input
                type="date"
                className="form-input"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
              />
            </div>
          )}
          
          <div className="form-group">
            <label className="form-label">Supervision Notes:</label>
            <textarea
              className="form-input"
              value={formData.supervision_notes}
              onChange={(e) => setFormData({...formData, supervision_notes: e.target.value})}
              placeholder="Additional notes about this supervision arrangement..."
              rows="3"
            />
          </div>
        </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Saving...' : (assignment ? 'Update Assignment' : 'Create Assignment')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Registration Modal Components
const RegistrationCreateModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    student_number: '',
    registration_status: 'pending',
    original_registration_deadline: new Date().toISOString().split('T')[0],
    registration_extension_request_date: '',
    date_of_registration_extension_approval: '',
    registration_extension_length_days: 0,
    revised_registration_deadline: '',
    date_pgr_moved_to_new_blackboard_group: '',
    pgr_registration_process_completed: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Clean up empty date fields
      const cleanedData = { ...formData };
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === '') {
          if (key.includes('date') || key.includes('deadline')) {
            cleanedData[key] = null;
          }
        }
      });
      
      await onSave(cleanedData);
      onClose();
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to create registration'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Create New Registration</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Student Number:</label>
            <input
              type="text"
              className="form-input"
              value={formData.student_number}
              onChange={(e) => setFormData({...formData, student_number: e.target.value})}
              required
              placeholder="Enter student number"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Registration Status:</label>
            <select
              className="form-input"
              value={formData.registration_status}
              onChange={(e) => setFormData({...formData, registration_status: e.target.value})}
              required
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="extension_requested">Extension Requested</option>
              <option value="extension_approved">Extension Approved</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Original Registration Deadline:</label>
            <input
              type="date"
              className="form-input"
              value={formData.original_registration_deadline}
              onChange={(e) => setFormData({...formData, original_registration_deadline: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Extension Length (Days):</label>
            <input
              type="number"
              className="form-input"
              value={formData.registration_extension_length_days}
              onChange={(e) => setFormData({...formData, registration_extension_length_days: parseInt(e.target.value) || 0})}
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={formData.pgr_registration_process_completed}
                onChange={(e) => setFormData({...formData, pgr_registration_process_completed: e.target.checked})}
              />
              Registration Process Completed
            </label>
          </div>
        </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Creating...' : 'Create Registration'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RegistrationEditModal = ({ registration, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    registration_status: registration?.registration_status || '',
    original_registration_deadline: registration?.original_registration_deadline || '',
    registration_extension_request_date: registration?.registration_extension_request_date || '',
    date_of_registration_extension_approval: registration?.date_of_registration_extension_approval || '',
    registration_extension_length_days: registration?.registration_extension_length_days || 0,
    revised_registration_deadline: registration?.revised_registration_deadline || '',
    date_pgr_moved_to_new_blackboard_group: registration?.date_pgr_moved_to_new_blackboard_group || '',
    pgr_registration_process_completed: registration?.pgr_registration_process_completed || false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await onSave(registration.registration_id, formData);
      onClose();
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to update registration'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit Registration</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Registration Status:</label>
            <select
              className="form-input"
              value={formData.registration_status}
              onChange={(e) => setFormData({...formData, registration_status: e.target.value})}
              required
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="extension_requested">Extension Requested</option>
              <option value="extension_approved">Extension Approved</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Original Registration Deadline:</label>
            <input
              type="date"
              className="form-input"
              value={formData.original_registration_deadline}
              onChange={(e) => setFormData({...formData, original_registration_deadline: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Extension Request Date:</label>
            <input
              type="date"
              className="form-input"
              value={formData.registration_extension_request_date}
              onChange={(e) => setFormData({...formData, registration_extension_request_date: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Extension Approval Date:</label>
            <input
              type="date"
              className="form-input"
              value={formData.date_of_registration_extension_approval}
              onChange={(e) => setFormData({...formData, date_of_registration_extension_approval: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Extension Length (Days):</label>
            <input
              type="number"
              className="form-input"
              value={formData.registration_extension_length_days}
              onChange={(e) => setFormData({...formData, registration_extension_length_days: parseInt(e.target.value) || 0})}
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Revised Registration Deadline:</label>
            <input
              type="date"
              className="form-input"
              value={formData.revised_registration_deadline}
              onChange={(e) => setFormData({...formData, revised_registration_deadline: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={formData.pgr_registration_process_completed}
                onChange={(e) => setFormData({...formData, pgr_registration_process_completed: e.target.checked})}
              />
              Registration Process Completed
            </label>
          </div>
        </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Updating...' : 'Update Registration'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RegistrationDetailModal = ({ registration, onClose, onEdit, onApproveExtension }) => {
  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Registration Details</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
        <div className="detail-content">
          <div className="detail-section">
            <h3>Registration Information</h3>
            <div className="detail-row">
              <strong>Registration ID:</strong> {registration.registration_id}
            </div>
            <div className="detail-row">
              <strong>Student Number:</strong> {registration.student_number}
            </div>
            <div className="detail-row">
              <strong>Status:</strong> {registration.registration_status}
            </div>
            <div className="detail-row">
              <strong>Original Deadline:</strong> {new Date(registration.original_registration_deadline).toLocaleDateString()}
            </div>
            {registration.revised_registration_deadline && (
              <div className="detail-row">
                <strong>Revised Deadline:</strong> {new Date(registration.revised_registration_deadline).toLocaleDateString()}
              </div>
            )}
            <div className="detail-row">
              <strong>Extension Days:</strong> {registration.registration_extension_length_days || 0}
            </div>
            {registration.registration_extension_request_date && (
              <div className="detail-row">
                <strong>Extension Request Date:</strong> {new Date(registration.registration_extension_request_date).toLocaleDateString()}
              </div>
            )}
            {registration.date_of_registration_extension_approval && (
              <div className="detail-row">
                <strong>Extension Approval Date:</strong> {new Date(registration.date_of_registration_extension_approval).toLocaleDateString()}
              </div>
            )}
            {registration.date_pgr_moved_to_new_blackboard_group && (
              <div className="detail-row">
                <strong>Moved to Blackboard:</strong> {new Date(registration.date_pgr_moved_to_new_blackboard_group).toLocaleDateString()}
              </div>
            )}
            <div className="detail-row">
              <strong>Process Completed:</strong> {registration.pgr_registration_process_completed ? 'Yes' : 'No'}
            </div>
            <div className="detail-row">
              <strong>Created:</strong> {new Date(registration.created_date).toLocaleDateString()}
            </div>
            <div className="detail-row">
              <strong>Updated:</strong> {new Date(registration.updated_date).toLocaleDateString()}
            </div>
          </div>
        </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn secondary" onClick={onClose}>Close</button>
          <button className="btn primary" onClick={onEdit}>Edit</button>
          {registration.registration_status === 'extension_requested' && (
            <button 
              className="btn warning"
              onClick={() => onApproveExtension(registration.registration_id)} 
              title="Approve the extension request"
            >
              ✓ Approve Extension
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ExtensionModal = ({ registration, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    extensionDays: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await onSave(registration.registration_id, parseInt(formData.extensionDays), formData.reason);
      onClose();
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to request extension'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Request Extension</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Student Number:</label>
            <input
              type="text"
              className="form-input disabled-input"
              value={registration.student_number}
              disabled
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Extension Days:</label>
            <input
              type="number"
              className="form-input"
              value={formData.extensionDays}
              onChange={(e) => setFormData({...formData, extensionDays: e.target.value})}
              required
              min="1"
              max="365"
              placeholder="Number of days to extend"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Reason for Extension:</label>
            <textarea
              className="form-input"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              required
              rows="4"
              placeholder="Please provide a reason for the extension request..."
            />
          </div>
        </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Requesting...' : 'Request Extension'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Viva Team Modal Components
const VivaTeamCreateModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    student_number: '',
    stage: 'registration',
    internal_examiner_1_id: '',
    internal_examiner_2_id: '',
    external_examiner_name: '',
    external_examiner_email: '',
    external_examiner_institution: '',
    proposed_date: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch students and supervisors when modal opens
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [studentsResponse, supervisorsResponse] = await Promise.all([
          studentAPI.getAllStudents(),
          supervisorAPI.getAllSupervisors()
        ]);
        setStudents(studentsResponse || []);
        setSupervisors(supervisorsResponse || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load students and supervisors');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Convert string IDs to numbers where needed
      const submitData = {
        ...formData,
        internal_examiner_1_id: formData.internal_examiner_1_id ? parseInt(formData.internal_examiner_1_id) : null,
        internal_examiner_2_id: formData.internal_examiner_2_id ? parseInt(formData.internal_examiner_2_id) : null
      };
      
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error creating viva team:', error);
      setError(extractErrorMessage(error, 'Failed to create viva team'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Propose Viva Team</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
        {error && <div className="error-message">{error}</div>}
        
        {loadingData ? (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading students and supervisors...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="compact-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Student:</label>
                <select
                  className="form-input"
                  value={formData.student_number}
                  onChange={(e) => setFormData({...formData, student_number: e.target.value})}
                  required
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.student_number} value={student.student_number}>
                      {student.student_number} - {student.first_name} {student.last_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Stage:</label>
                <select
                  className="form-input"
                  value={formData.stage}
                  onChange={(e) => setFormData({...formData, stage: e.target.value})}
                  required
                >
                  <option value="registration">Registration</option>
                  <option value="progression">Progression</option>
                  <option value="final">Final</option>
                </select>
              </div>
            </div>
            
            <div className="form-section">
             
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label-sm">Supervisor 1:</label>
                  <select
                    className="form-input"
                    value={formData.internal_examiner_1_id}
                    onChange={(e) => setFormData({...formData, internal_examiner_1_id: e.target.value})}
                  >
                    <option value="">Select Supervisor 1</option>
                    {supervisors.map(supervisor => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {supervisor.supervisor_id || supervisor.id} - {supervisor.first_name} {supervisor.last_name} ({supervisor.email})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label-sm">Supervisor 2:</label>
                  <select
                    className="form-input"
                    value={formData.internal_examiner_2_id}
                    onChange={(e) => setFormData({...formData, internal_examiner_2_id: e.target.value})}
                  >
                    <option value="">Select Supervisor 2</option>
                    {supervisors.map(supervisor => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {supervisor.supervisor_id || supervisor.id} - {supervisor.first_name} {supervisor.last_name} ({supervisor.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="form-section">
     
              <div className="form-group">
                <label className="form-label-sm">Examiner Name:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.external_examiner_name}
                  onChange={(e) => setFormData({...formData, external_examiner_name: e.target.value})}
                  required
                  placeholder="External examiner name"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label-sm">Email:</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.external_examiner_email}
                    onChange={(e) => setFormData({...formData, external_examiner_email: e.target.value})}
                    required
                    placeholder="examiner@university.edu"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label-sm">Institution:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.external_examiner_institution}
                    onChange={(e) => setFormData({...formData, external_examiner_institution: e.target.value})}
                    required
                    placeholder="University/Institution"
                  />
                </div>
              </div>
            </div>
            
            <div className="form-section">
         
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label-sm">Proposed Date:</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.proposed_date}
                    onChange={(e) => setFormData({...formData, proposed_date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label-sm">Location:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Room/Location"
                  />
                </div>
              </div>
            </div>
          </form>
        )}
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Creating...' : 'Propose Viva Team'}
          </button>
        </div>
      </div>
    </div>
  );
};

const VivaTeamEditModal = ({ vivaTeam, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    student_number: vivaTeam?.student_number || '',
    stage: vivaTeam?.stage || 'registration',
    internal_examiner_1_id: vivaTeam?.internal_examiner_1_id || '',
    internal_examiner_2_id: vivaTeam?.internal_examiner_2_id || '',
    external_examiner_name: vivaTeam?.external_examiner_name || '',
    external_examiner_email: vivaTeam?.external_examiner_email || '',
    external_examiner_institution: vivaTeam?.external_examiner_institution || '',
    proposed_date: vivaTeam?.proposed_date ? vivaTeam.proposed_date.split('T')[0] : '',
    location: vivaTeam?.location || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Convert string IDs to numbers where needed
      const submitData = {
        ...formData,
        internal_examiner_1_id: formData.internal_examiner_1_id ? parseInt(formData.internal_examiner_1_id) : null,
        internal_examiner_2_id: formData.internal_examiner_2_id ? parseInt(formData.internal_examiner_2_id) : null
      };
      
      await onSave(vivaTeam.id, submitData);
      onClose();
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to update viva team'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit Viva Team</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Student Number:</label>
              <input
                type="text"
                className="form-input"
                value={formData.student_number}
                onChange={(e) => setFormData({...formData, student_number: e.target.value})}
                required
                placeholder="Enter student number"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Stage:</label>
              <select
                className="form-input"
                value={formData.stage}
                onChange={(e) => setFormData({...formData, stage: e.target.value})}
                required
              >
                <option value="registration">Registration</option>
                <option value="progression">Progression</option>
                <option value="final">Final</option>
              </select>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Internal Examiners</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Internal Examiner 1 ID:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.internal_examiner_1_id}
                  onChange={(e) => setFormData({...formData, internal_examiner_1_id: e.target.value})}
                  placeholder="Enter examiner ID"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Internal Examiner 2 ID:</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.internal_examiner_2_id}
                  onChange={(e) => setFormData({...formData, internal_examiner_2_id: e.target.value})}
                  placeholder="Enter examiner ID"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>External Examiner</h3>
            <div className="form-group">
              <label className="form-label">External Examiner Name:</label>
              <input
                type="text"
                className="form-input"
                value={formData.external_examiner_name}
                onChange={(e) => setFormData({...formData, external_examiner_name: e.target.value})}
                required
                placeholder="Enter external examiner name"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">External Examiner Email:</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.external_examiner_email}
                  onChange={(e) => setFormData({...formData, external_examiner_email: e.target.value})}
                  required
                  placeholder="examiner@university.edu"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">External Examiner Institution:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.external_examiner_institution}
                  onChange={(e) => setFormData({...formData, external_examiner_institution: e.target.value})}
                  required
                  placeholder="University/Institution name"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Viva Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Proposed Date:</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.proposed_date}
                  onChange={(e) => setFormData({...formData, proposed_date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Location:</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Room/Location for viva"
                />
              </div>
            </div>
          </div>
        </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Updating...' : 'Update Team'}
          </button>
        </div>
      </div>
    </div>
  );
};

const VivaTeamDetailModal = ({ vivaTeam, onClose, onEdit, onApprove, onReject, onSchedule, onSubmitOutcome }) => {
  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Viva Team Details</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
        <div className="detail-content">
          <div className="detail-section">
            <h3>Team Information</h3>
            <div className="detail-grid">
              <div className="detail-row">
                <strong>Team ID:</strong> {vivaTeam.id}
              </div>
              <div className="detail-row">
                <strong>Status:</strong> 
                <span className={`status ${vivaTeam.status}`}>
                  {vivaTeam.status?.toUpperCase()}
                </span>
              </div>
              <div className="detail-row">
                <strong>Student Number:</strong> {vivaTeam.student_number}
              </div>
              <div className="detail-row">
                <strong>Stage:</strong> {vivaTeam.stage?.charAt(0).toUpperCase() + vivaTeam.stage?.slice(1)}
              </div>
            </div>
          </div>
          
          <div className="detail-section">
            <h3>Examination Team</h3>
            <div className="detail-grid">
              <div className="detail-row">
                <strong>Internal Examiner 1:</strong> {vivaTeam.internal_examiner_1_id || 'Not assigned'}
              </div>
              <div className="detail-row">
                <strong>Internal Examiner 2:</strong> {vivaTeam.internal_examiner_2_id || 'Not assigned'}
              </div>
              <div className="detail-row">
                <strong>External Examiner:</strong> {vivaTeam.external_examiner_name}
              </div>
              <div className="detail-row">
                <strong>External Examiner Email:</strong> {vivaTeam.external_examiner_email}
              </div>
              <div className="detail-row">
                <strong>External Examiner Institution:</strong> {vivaTeam.external_examiner_institution}
              </div>
            </div>
          </div>
          
          {vivaTeam.proposed_date && (
            <div className="detail-section">
              <h3>Schedule Information</h3>
              <div className="detail-grid">
                <div className="detail-row">
                  <strong>Proposed Date:</strong> {new Date(vivaTeam.proposed_date).toLocaleDateString()}
                </div>
                <div className="detail-row">
                  <strong>Location:</strong> {vivaTeam.location || 'TBD'}
                </div>
              </div>
            </div>
          )}
          
          {vivaTeam.outcome && (
            <div className="detail-section">
              <h3>Outcome</h3>
              <div className="detail-grid">
                <div className="detail-row">
                  <strong>Result:</strong> 
                  <span className={`status outcome-${vivaTeam.outcome.toLowerCase()}`}>
                    {vivaTeam.outcome}
                  </span>
                </div>
                {vivaTeam.outcome_comments && (
                  <div className="detail-row">
                    <strong>Comments:</strong> {vivaTeam.outcome_comments}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {vivaTeam.comments && (
            <div className="detail-section">
              <h3>Additional Comments</h3>
              <p>{vivaTeam.comments}</p>
            </div>
          )}
        </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn secondary" onClick={onClose}>Close</button>
          {vivaTeam.status === 'proposed' && (
            <>
              <button onClick={onApprove} className="btn primary">Approve</button>
              <button onClick={onReject} className="btn danger">Reject</button>
            </>
          )}
          {vivaTeam.status === 'approved' && (
            <button onClick={onSchedule} className="btn primary">Schedule</button>
          )}
          {vivaTeam.status === 'scheduled' && !vivaTeam.outcome && (
            <button onClick={onSubmitOutcome} className="btn warning">Submit Outcome</button>
          )}
          {vivaTeam.status !== 'completed' && (
            <button onClick={onEdit} className="btn secondary">Edit</button>
          )}
        </div>
      </div>
    </div>
  );
};

const VivaTeamRejectModal = ({ vivaTeam, onClose, onSave }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await onSave(vivaTeam.id, reason);
      onClose();
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to reject viva team'));
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
        {error && <div className="error-message">{error}</div>}
        
        <div className="detail-content">
          <div className="detail-row">
            <strong>Team ID:</strong> {vivaTeam.id}
          </div>
          <div className="detail-row">
            <strong>Student Number:</strong> {vivaTeam.student_number}
          </div>
          <div className="detail-row">
            <strong>Stage:</strong> {vivaTeam.stage}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Rejection Reason:</label>
            <textarea
              className="form-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this viva team..."
              rows="4"
              required
            />
          </div>
        </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn danger" disabled={loading || !reason.trim()} onClick={handleSubmit}>
            {loading ? 'Rejecting...' : 'Reject Team'}
          </button>
        </div>
      </div>
    </div>
  );
};

const VivaScheduleModal = ({ vivaTeam, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    scheduledDate: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await onSave(vivaTeam.team_id, formData.scheduledDate, formData.location);
      onClose();
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to schedule viva'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Schedule Viva</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="detail-content">
          <p><strong>Team ID:</strong> {vivaTeam.team_id}</p>
          <p><strong>Student:</strong> {vivaTeam.student_name}</p>
          <p><strong>Research Title:</strong> {vivaTeam.research_title}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Scheduled Date:</label>
            <input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Location:</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="e.g., Room 101, Building A"
              required
            />
          </div>
          
          <div className="sys-admin-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Viva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const VivaOutcomeModal = ({ vivaTeam, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    outcome: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await onSave(vivaTeam.team_id, formData.outcome, formData.notes);
      onClose();
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to submit outcome'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Submit Viva Outcome</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="detail-content">
          <p><strong>Team ID:</strong> {vivaTeam.team_id}</p>
          <p><strong>Student:</strong> {vivaTeam.student_name}</p>
          <p><strong>Research Title:</strong> {vivaTeam.research_title}</p>
          <p><strong>Scheduled:</strong> {new Date(vivaTeam.scheduled_date).toLocaleDateString()}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Outcome:</label>
            <select
              value={formData.outcome}
              onChange={(e) => setFormData({...formData, outcome: e.target.value})}
              required
            >
              <option value="">Select outcome...</option>
              <option value="PASS">Pass</option>
              <option value="PASS_WITH_MINOR_CORRECTIONS">Pass with Minor Corrections</option>
              <option value="PASS_WITH_MAJOR_CORRECTIONS">Pass with Major Corrections</option>
              <option value="RESUBMIT">Resubmit</option>
              <option value="FAIL">Fail</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Outcome Notes:</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Please provide detailed notes about the viva outcome..."
              rows="5"
              required
            />
          </div>
          
          <div className="sys-admin-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Outcome'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Submission Modal Components
const SubmissionDetailModal = ({ submission, onClose }) => {
  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Submission Details</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="submission-details">
            <div className="detail-section">
              <h4>Basic Information</h4>
              <div className="detail-grid">
                <div className="detail-row">
                  <strong>Student Number:</strong> {submission.student_number || 'N/A'}
                </div>
                <div className="detail-row">
                  <strong>Title:</strong> {submission.title || 'No Title'}
                </div>
                <div className="detail-row">
                  <strong>Type:</strong> 
                  <span className={`status ${submission.submission_type?.toLowerCase()}`}>
                    {submission.submission_type?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Status:</strong> 
                  <span className={`status ${submission.status?.toLowerCase()}`}>
                    {submission.status?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Submitted:</strong> {submission.submission_date ? new Date(submission.submission_date).toLocaleString() : 'N/A'}
                </div>
                <div className="detail-row">
                  <strong>Created:</strong> {submission.created_date ? new Date(submission.created_date).toLocaleString() : 'N/A'}
                </div>
                <div className="detail-row">
                  <strong>Review Deadline:</strong> {submission.review_deadline ? new Date(submission.review_deadline).toLocaleDateString() : 'N/A'}
                </div>
                <div className="detail-row">
                  <strong>Reviewed By:</strong> {submission.reviewed_by || 'Not reviewed'}
                </div>
              </div>
            </div>

            {submission.description && (
              <div className="detail-section">
                <h4>Description</h4>
                <p>{submission.description}</p>
              </div>
            )}

            {submission.review_comments && (
              <div className="detail-section">
                <h4>Review Comments</h4>
                <p>{submission.review_comments}</p>
              </div>
            )}

            {submission.file_name && (
              <div className="detail-section">
                <h4>Attached File</h4>
                <div className="document-list">
                  <div className="document-item">
                    <span className="document-name">{submission.file_name}</span>
                    <span className="document-size">{submission.file_size ? `${(submission.file_size / 1024).toFixed(2)} KB` : 'Unknown size'}</span>
                    {submission.file_path && (
                      <a href={submission.file_path} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                        Download
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const SubmissionReviewModal = ({ submission, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    status: 'under_review',
    review_comments: '',
    review_deadline: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSave(submission.id, formData);
      onClose();
    } catch (error) {
      console.error('Error reviewing submission:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Review Submission</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Submission:</label>
            <div className="submission-info">
              <strong>{submission.title}</strong>
              <span>by {submission.student_number}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Review Status:</label>
            <select
              className="form-input"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              required
            >
              <option value="under_review">Under Review</option>
              <option value="revision_required">Revision Required</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Review Comments:</label>
            <textarea
              className="form-input"
              value={formData.review_comments}
              onChange={(e) => setFormData({...formData, review_comments: e.target.value})}
              placeholder="Provide feedback on the submission..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Review Deadline:</label>
            <input
              type="date"
              className="form-input"
              value={formData.review_deadline || ''}
              onChange={(e) => setFormData({...formData, review_deadline: e.target.value})}
            />
          </div>
        </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SubmissionRejectModal = ({ submission, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    reason: '',
    feedback: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSave(submission.id, formData);
      onClose();
    } catch (error) {
      console.error('Error rejecting submission:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Reject Submission</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Submission:</label>
            <div className="submission-info">
              <strong>{submission.title}</strong>
              <span>by {submission.student_name}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Rejection Reason:</label>
            <select
              className="form-input"
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              required
            >
              <option value="">Select reason...</option>
              <option value="INCOMPLETE_DOCUMENTS">Incomplete Documents</option>
              <option value="QUALITY_ISSUES">Quality Issues</option>
              <option value="FORMATTING_PROBLEMS">Formatting Problems</option>
              <option value="CONTENT_INADEQUATE">Content Inadequate</option>
              <option value="DEADLINE_MISSED">Deadline Missed</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Feedback:</label>
            <textarea
              className="form-input"
              value={formData.feedback}
              onChange={(e) => setFormData({...formData, feedback: e.target.value})}
              placeholder="Provide detailed feedback explaining the rejection..."
              rows="5"
              required
            />
          </div>
        </form>
        </div>
        
        <div className="modal-footer">
          <button type="button" className="btn secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn danger" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Rejecting...' : 'Reject Submission'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DosDashboard;
