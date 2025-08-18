import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, authAPI, studentAPI, supervisorAPI, assignmentAPI, registrationAPI, vivaTeamAPI, submissionAPI } from '../utils/api';
import '../styles/dashboard.css';
import '../styles/system-admin-dashboard.css';

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

const SystemAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // User management state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
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
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'students', label: 'Student Management', icon: '🎓' },
    { id: 'supervisors', label: 'Supervisor Management', icon: '👨‍🏫' },
    { id: 'assignments', label: 'Assignments', icon: '📋' },
    { id: 'registrations', label: 'Registrations', icon: '📝' },
    { id: 'submissions', label: 'Submissions', icon: '📄' },
    { id: 'viva-teams', label: 'Viva Teams', icon: '🎯' },
    { id: 'profile', label: 'Profile', icon: '⚙️' }
  ];

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

  // User management functions
  const fetchUserById = async (userId) => {
    try {
      setUsersError('');
      setSearchingById(true);
      
      const userData = await adminAPI.getUserById(userId);
      setSearchedUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      const errorMessage = extractErrorMessage(error, 'User not found');
      setUsersError(`Failed to fetch user: ${errorMessage}`);
      setSearchedUser(null);
    } finally {
      setSearchingById(false);
    }
  };

  const handleSearchUserById = async () => {
    if (!userIdSearch.trim()) {
      setUsersError('Please enter a user ID');
      return;
    }

    try {
      const userData = await fetchUserById(parseInt(userIdSearch));
      if (userData) {
        setShowUserByIdModal(true);
      }
    } catch (error) {
      console.error('Error searching user by ID:', error);
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      await adminAPI.updateUser(userId, userData);
      fetchUsers(); // Refresh list
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const handleResetPassword = async (userId, password) => {
    try {
      await adminAPI.resetUserPassword(userId, password);
      setShowPasswordModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
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
      {/* Mobile Hamburger Button */}
      <button 
        className="system-admin-mobile-hamburger"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        aria-label="Toggle menu"
      >
        <span className={`hamburger-line ${mobileSidebarOpen ? 'active' : ''}`}></span>
        <span className={`hamburger-line ${mobileSidebarOpen ? 'active' : ''}`}></span>
        <span className={`hamburger-line ${mobileSidebarOpen ? 'active' : ''}`}></span>
      </button>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="system-admin-mobile-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}

      <aside className={`system-admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="system-admin-sidebar-header">
          <h2>{sidebarCollapsed ? 'SA' : 'System Admin Portal'}</h2>
          <span className="admin-user-info">Welcome, {user?.username}</span>
          <button 
            className="system-admin-sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
          {/* Mobile Close Button */}
          <button 
            className="system-admin-mobile-close"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        
        <nav className="system-admin-sidebar-nav">
          {navigationItems.map(item => (
            <button
              key={item.id}
              className={`system-admin-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveSection(item.id);
                setMobileSidebarOpen(false); // Close mobile sidebar when item is clicked
              }}
            >
              <span className="system-admin-nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="system-admin-nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>
        
        <div className="system-admin-sidebar-footer">
          <button className="system-admin-logout-btn" onClick={logout}>
            <span className="system-admin-nav-icon">🚪</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );

  const renderDashboard = () => (
    <div className="system-admin-dashboard-content">
      <h1>System Administrator Dashboard</h1>
      <p>Welcome back, {user?.username}! Manage your system with complete control.</p>
      
      <div className="system-admin-stats-grid">
        <div className="system-admin-stat-card">
          <h3>Total Users</h3>
          <div className="system-admin-stat-number">{stats.totalUsers}</div>
        </div>
        <div className="system-admin-stat-card">
          <h3>Active Users</h3>
          <div className="system-admin-stat-number">{stats.activeUsers}</div>
        </div>
        <div className="system-admin-stat-card">
          <h3>Admin Users</h3>
          <div className="system-admin-stat-number">{stats.adminUsers}</div>
        </div>
        <div className="system-admin-stat-card">
          <h3>Student Users</h3>
          <div className="system-admin-stat-number">{stats.studentUsers}</div>
        </div>
        <div className="system-admin-stat-card">
          <h3>Total Students</h3>
          <div className="system-admin-stat-number">{stats.totalStudents}</div>
        </div>
        <div className="system-admin-stat-card">
          <h3>International Students</h3>
          <div className="system-admin-stat-number">{stats.internationalStudents}</div>
        </div>
        <div className="system-admin-stat-card">
          <h3>Previous EHU Students</h3>
          <div className="system-admin-stat-number">{stats.previousEhuStudents}</div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="system-admin-management-content">
      <div className="system-admin-management-header">
        <h1>User Management</h1>
        <div className="system-admin-management-controls">
          <div className="search-by-id">
            <input
              type="number"
              placeholder="Search by User ID"
              value={userIdSearch}
              onChange={(e) => setUserIdSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchUserById()}
              className="system-admin-form-input"
            />
            <button 
              onClick={handleSearchUserById}
              disabled={searchingById}
              className="system-admin-btn system-admin-btn-primary"
            >
              {searchingById ? 'Searching...' : 'Search User'}
            </button>
          </div>
        </div>
      </div>

      {usersError && <div className="error-message">{usersError}</div>}

      {usersLoading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="system-admin-table-container">
          <table className="system-admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.is_active ? 'Yes' : 'No'}</td>
                  <td>
                    <button 
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserDetailModal(true);
                      }}
                      className="system-admin-btn system-admin-btn-secondary"
                      style={{marginRight: '8px'}}
                    >View</button>
                    <button 
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                      className="system-admin-btn system-admin-btn-primary"
                      style={{marginRight: '8px'}}
                    >Edit</button>
                    <button 
                      onClick={() => {
                        setSelectedUser(user);
                        setShowPasswordModal(true);
                      }}
                      className="system-admin-btn system-admin-btn-secondary"
                    >Reset Password</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderStudentManagement = () => (
    <div className="management-content">
      <div className="management-header">
        <h1>Student Management</h1>
        <div className="management-controls">
          <div className="search-controls">
            <input
              type="text"
              placeholder="Search students..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by programme..."
              value={programmeFilter}
              onChange={(e) => setProgrammeFilter(e.target.value)}
            />
            <button onClick={fetchStudents}>Filter</button>
          </div>
          <div className="search-by-id">
            <input
              type="text"
              placeholder="Search by Student Number"
              value={studentNumberSearch}
              onChange={(e) => setStudentNumberSearch(e.target.value)}
            />
            <button 
              onClick={handleSearchStudentByNumber}
              disabled={searchingStudentById}
            >
              {searchingStudentById ? 'Searching...' : 'Search'}
            </button>
          </div>
          <button 
            className="create-btn"
            onClick={() => setShowCreateStudentModal(true)}
          >
            Create Student
          </button>
        </div>
      </div>

      {studentsError && <div className="error-message">{studentsError}</div>}

      {studentsLoading ? (
        <div className="loading">Loading students...</div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Name</th>
                <th>Course Code</th>
                <th>Programme</th>
                <th>International</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.student_number}>
                  <td>{student.student_number}</td>
                  <td>{student.forename} {student.surname}</td>
                  <td>{student.course_code}</td>
                  <td>{student.programme_of_study}</td>
                  <td>{student.international_student ? 'Yes' : 'No'}</td>
                  <td>
                    <button 
                      onClick={() => handleViewStudent(student.student_number)}
                      disabled={studentDetailLoading}
                    >
                      {studentDetailLoading ? 'Loading...' : 'View'}
                    </button>
                    <button onClick={() => {
                      setSelectedStudent(student);
                      setShowStudentModal(true);
                    }}>Edit</button>
                    <button onClick={() => handleDeleteStudent(student.student_number)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderSupervisorManagement = () => (
    <div className="management-content">
      <div className="management-header">
        <h1>Supervisor Management</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateSupervisorModal(true)}
          >
            Add New Supervisor
          </button>
        </div>
      </div>

      <div className="search-filters">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={supervisorSearch}
            onChange={(e) => setSupervisorSearch(e.target.value)}
            className="search-input"
          />
          <button onClick={fetchSupervisors} className="btn btn-secondary">
            Search
          </button>
        </div>
        
        <div className="search-group">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Engineering">Engineering</option>
            <option value="Business">Business</option>
            <option value="Psychology">Psychology</option>
            <option value="Education">Education</option>
          </select>
        </div>

        <div className="search-group">
          <input
            type="text"
            placeholder="Search by Supervisor ID..."
            value={supervisorIdSearch}
            onChange={(e) => setSupervisorIdSearch(e.target.value)}
            className="search-input"
          />
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
            className="btn btn-secondary"
          >
            {searchingSupervisorById ? 'Searching...' : 'Find by ID'}
          </button>
        </div>
      </div>

      {supervisorsError && (
        <div className="error-message">
          {supervisorsError}
        </div>
      )}

      {supervisorsLoading ? (
        <div className="loading">Loading supervisors...</div>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Supervisor ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Notes</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(supervisors) && supervisors.map(supervisor => (
                <tr key={supervisor.supervisor_id}>
                  <td>{supervisor.supervisor_id}</td>
                  <td>{supervisor.supervisor_name}</td>
                  <td>{supervisor.email}</td>
                  <td>{supervisor.department}</td>
                  <td>{supervisor.supervisor_notes}</td>
                  <td>{new Date(supervisor.created_date).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => {
                          setSelectedSupervisor(supervisor);
                          setShowSupervisorDetailModal(true);
                        }}
                        className="btn btn-sm btn-info"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedSupervisor(supervisor);
                          setShowSupervisorModal(true);
                        }}
                        className="btn btn-sm btn-warning"
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
                        }}
                        className="btn btn-sm btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {Array.isArray(supervisors) && supervisors.length === 0 && (
            <div className="no-data">
              No supervisors found. <button onClick={() => setShowCreateSupervisorModal(true)}>Add the first supervisor</button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderAssignmentManagement = () => (
    <div className="management-content">
      <div className="management-header">
        <h1>Student-Supervisor Assignments</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAssignmentModal(true)}
          >
            Create New Assignment
          </button>
        </div>
      </div>

      {assignmentsError && (
        <div className="error-message">
          {assignmentsError}
        </div>
      )}

      {assignmentsLoading ? (
        <div className="loading">Loading assignments...</div>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Assignment ID</th>
                <th>Student Number</th>
                <th>Supervisor ID</th>
                <th>Role</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(assignments) && assignments.map(assignment => (
                <tr key={assignment.student_supervisor_id}>
                  <td>{assignment.student_supervisor_id}</td>
                  <td>{assignment.student_number}</td>
                  <td>{assignment.supervisor_id}</td>
                  <td>{assignment.role}</td>
                  <td>{new Date(assignment.start_date).toLocaleDateString()}</td>
                  <td>{assignment.end_date ? new Date(assignment.end_date).toLocaleDateString() : 'Ongoing'}</td>
                  <td>{assignment.supervision_notes}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowAssignmentModal(true);
                        }}
                        className="btn btn-sm btn-warning"
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
                        }}
                        className="btn btn-sm btn-danger"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {Array.isArray(assignments) && assignments.length === 0 && (
            <div className="no-data">
              No assignments found. <button onClick={() => setShowAssignmentModal(true)}>Create the first assignment</button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderRegistrationManagement = () => (
    <div className="management-content">
      <div className="management-header">
        <h1>Registration Management</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateRegistrationModal(true)}
          >
            Create New Registration
          </button>
        </div>
      </div>

      <div className="search-filters">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search by student number..."
            value={registrationSearch}
            onChange={(e) => setRegistrationSearch(e.target.value)}
            className="search-input"
          />
          <button onClick={fetchRegistrations} className="btn btn-secondary">
            Search
          </button>
        </div>
        
        <div className="search-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
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

        <div className="search-group">
          <input
            type="text"
            placeholder="Search by Registration ID..."
            value={registrationIdSearch}
            onChange={(e) => setRegistrationIdSearch(e.target.value)}
            className="search-input"
          />
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
            className="btn btn-secondary"
          >
            {searchingRegistrationById ? 'Searching...' : 'Find by ID'}
          </button>
        </div>
      </div>

      {registrationsError && (
        <div className="error-message">
          {registrationsError}
        </div>
      )}

      {registrationsLoading ? (
        <div className="loading">Loading registrations...</div>
      ) : (
        <div className="data-table">
          <table>
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
                  <td>{registration.registration_id}</td>
                  <td>{registration.student_number}</td>
                  <td>
                    <span className={`status ${registration.registration_status}`}>
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
                    <span className={`status ${registration.pgr_registration_process_completed ? 'completed' : 'pending'}`}>
                      {registration.pgr_registration_process_completed ? 'Yes' : 'No'}
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
                        className="btn btn-sm btn-info"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedRegistration(registration);
                          setShowRegistrationModal(true);
                        }}
                        className="btn btn-sm btn-warning"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedRegistration(registration);
                          setShowExtensionModal(true);
                        }}
                        className="btn btn-sm btn-secondary"
                      >
                        Extension
                      </button>
                      {registration.registration_status === 'extension_requested' && (
                        <button 
                          onClick={() => handleApproveExtension(registration.registration_id)}
                          className="btn btn-sm btn-success"
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
          
          {Array.isArray(registrations) && registrations.length === 0 && (
            <div className="no-data">
              No registrations found. <button onClick={() => setShowCreateRegistrationModal(true)}>Create the first registration</button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderVivaTeamManagement = () => (
    <div className="management-content">
      <div className="management-header">
        <h1>Viva Team Management</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateVivaTeamModal(true)}
          >
            Propose Viva Team
          </button>
        </div>
      </div>

      <div className="search-filters">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search by student number..."
            value={vivaTeamSearch}
            onChange={(e) => setVivaTeamSearch(e.target.value)}
            className="search-input"
          />
          <button onClick={fetchVivaTeams} className="btn btn-secondary">
            Search
          </button>
        </div>
        
        <div className="search-group">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Stages</option>
            <option value="registration">Registration</option>
            <option value="progression">Progression</option>
            <option value="final">Final</option>
          </select>
        </div>
        
        <div className="search-group">
          <select
            value={vivaTeamStatusFilter}
            onChange={(e) => setVivaTeamStatusFilter(e.target.value)}
            className="filter-select"
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
        <div className="error-message">
          {vivaTeamsError}
        </div>
      )}

      {vivaTeamsLoading ? (
        <div className="loading">Loading viva teams...</div>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Team ID</th>
                <th>Student Number</th>
                <th>Stage</th>
                <th>Status</th>
                <th>Internal Examiner 1</th>
                <th>Internal Examiner 2</th>
                <th>External Examiner</th>
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
                  <td>{vivaTeam.id}</td>
                  <td>{vivaTeam.student_number}</td>
                  <td>
                    <span className={`status stage-${vivaTeam.stage}`}>
                      {vivaTeam.stage.charAt(0).toUpperCase() + vivaTeam.stage.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${vivaTeam.status}`}>
                      {vivaTeam.status === 'proposed' ? '📋 Proposed' :
                       vivaTeam.status === 'approved' ? '✅ Approved' :
                       vivaTeam.status === 'rejected' ? '❌ Rejected' :
                       vivaTeam.status === 'scheduled' ? '📅 Scheduled' :
                       vivaTeam.status === 'completed' ? '🎓 Completed' :
                       vivaTeam.status}
                    </span>
                  </td>
                  <td>{vivaTeam.internal_examiner_1_id || 'N/A'}</td>
                  <td>{vivaTeam.internal_examiner_2_id || 'N/A'}</td>
                  <td>{vivaTeam.external_examiner_name || 'N/A'}</td>
                  <td>{vivaTeam.proposed_date ? new Date(vivaTeam.proposed_date).toLocaleDateString() : 'N/A'}</td>
                  <td>{vivaTeam.scheduled_date ? new Date(vivaTeam.scheduled_date).toLocaleDateString() : 'Not Scheduled'}</td>
                  <td>{vivaTeam.location || 'TBD'}</td>
                  <td>
                    {vivaTeam.outcome ? (
                      <span className={`status outcome-${vivaTeam.outcome.toLowerCase()}`}>
                        {vivaTeam.outcome}
                      </span>
                    ) : 'Pending'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => {
                          setSelectedVivaTeam(vivaTeam);
                          setShowVivaTeamDetailModal(true);
                        }}
                        className="btn btn-sm btn-info"
                      >
                        View
                      </button>
                      {vivaTeam.status === 'proposed' && (
                        <>
                          <button 
                            onClick={() => handleApproveVivaTeam(vivaTeam.id)}
                            className="btn btn-sm btn-success"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedVivaTeam(vivaTeam);
                              setShowRejectModal(true);
                            }}
                            className="btn btn-sm btn-danger"
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
                          }}
                          className="btn btn-sm btn-primary"
                        >
                          Schedule
                        </button>
                      )}
                      {vivaTeam.status === 'scheduled' && !vivaTeam.outcome && (
                        <button 
                          onClick={() => {
                            setSelectedVivaTeam(vivaTeam);
                            setShowOutcomeModal(true);
                          }}
                          className="btn btn-sm btn-warning"
                        >
                          Submit Outcome
                        </button>
                      )}
                      {vivaTeam.status !== 'completed' && (
                        <button 
                          onClick={() => {
                            setSelectedVivaTeam(vivaTeam);
                            setShowVivaTeamModal(true);
                          }}
                          className="btn btn-sm btn-warning"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {Array.isArray(vivaTeams) && vivaTeams.length === 0 && (
            <div className="no-data">
              No viva teams found. <button onClick={() => setShowCreateVivaTeamModal(true)}>Propose the first viva team</button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSubmissionManagement = () => (
    <div className="content-section">
      <div className="section-header">
        <h2>Submission Management</h2>
        <div className="section-actions">
          <button 
            onClick={testSubmissionAPI}
            className="btn btn-secondary"
            style={{ marginRight: '1rem' }}
          >
            Test API
          </button>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search submissions..."
              value={submissionSearchTerm}
              onChange={(e) => setSubmissionSearchTerm(e.target.value)}
            />
            <button onClick={() => fetchSubmissions(submissionSearchTerm)}>
              Search
            </button>
          </div>
          <div className="filter-controls">
            <select
              value={submissionStatusFilter}
              onChange={(e) => setSubmissionStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="revision_required">Revision Required</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={submissionTypeFilter}
              onChange={(e) => setSubmissionTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="registration">Registration</option>
              <option value="viva_document">Viva Document</option>
              <option value="thesis">Thesis</option>
              <option value="correction">Correction</option>
              <option value="annual_report">Annual Report</option>
            </select>
            <button onClick={() => fetchSubmissions(submissionSearchTerm, submissionStatusFilter, submissionTypeFilter)}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {submissionsLoading ? (
        <div className="loading">Loading submissions...</div>
      ) : submissionsError ? (
        <div className="error">Error: {submissionsError}</div>
      ) : (
        <div className="submissions-table-container">
          <table className="submissions-table">
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
                    <span className={`submission-type submission-type-${submission.submission_type?.toLowerCase()}`}>
                      {submission.submission_type?.replace('_', ' ') || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`submission-status submission-status-${submission.status?.toLowerCase()}`}>
                      {submission.status?.replace('_', ' ') || 'N/A'}
                    </span>
                  </td>
                  <td>
                    {submission.submission_date ? new Date(submission.submission_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    {submission.review_deadline ? new Date(submission.review_deadline).toLocaleDateString() : 'N/A'}
                    {submission.review_deadline && new Date(submission.review_deadline) < new Date() && (
                      <span className="deadline-warning"> (Overdue)</span>
                    )}
                  </td>
                  <td>
                    <div className="document-count">
                      {submission.file_name ? '1 document' : 'No documents'}
                      {submission.file_name && (
                        <div className="file-info">
                          <small>{submission.file_name}</small>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={async () => {
                          try {
                            await fetchSubmissionById(submission.id);
                            setShowSubmissionDetailModal(true);
                          } catch (error) {
                            console.error('Error loading submission details:', error);
                            // Fallback to current submission data
                            setSelectedSubmission(submission);
                            setShowSubmissionDetailModal(true);
                          }
                        }}
                        className="btn btn-sm btn-primary"
                      >
                        View
                      </button>
                      {submission.status === 'submitted' && (
                        <button 
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setShowSubmissionReviewModal(true);
                          }}
                          className="btn btn-sm btn-info"
                        >
                          Review
                        </button>
                      )}
                      {submission.status === 'under_review' && (
                        <>
                          <button 
                            onClick={() => handleApproveSubmission(submission.id)}
                            className="btn btn-sm btn-success"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setShowSubmissionRejectModal(true);
                            }}
                            className="btn btn-sm btn-danger"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {Array.isArray(submissions) && submissions.length === 0 && (
            <div className="no-data">
              No submissions found.
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="profile-content">
      <h1>Profile Settings</h1>
      <div className="profile-info">
        <p><strong>Username:</strong> {user?.username}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
      </div>
      <div className="profile-actions">
        <button onClick={() => setShowProfileModal(true)}>
          Update Profile
        </button>
        <button onClick={() => setShowChangePasswordModal(true)}>
          Change Password
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUserManagement();
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
      case 'profile':
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="system-admin-layout">
      {/* Mobile Hamburger Button */}
      <button 
        className="system-admin-mobile-hamburger"
        onClick={() => setMobileSidebarOpen(true)}
        aria-label="Open menu"
      >
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`system-admin-mobile-overlay ${mobileSidebarOpen ? 'active' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {renderSidebar()}
      <main className={`system-admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {renderContent()}
      </main>

      {/* User Management Modals */}
      {showUserModal && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          onSave={handleUpdateUser}
        />
      )}

      {showPasswordModal && selectedUser && (
        <PasswordResetModal
          user={selectedUser}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUser(null);
          }}
          onSave={handleResetPassword}
        />
      )}

      {showUserDetailModal && (selectedUser || searchedUser) && (
        <UserDetailModal
          user={selectedUser || searchedUser}
          onClose={() => {
            setShowUserDetailModal(false);
            setSelectedUser(null);
            setSearchedUser(null);
          }}
        />
      )}

      {showUserByIdModal && searchedUser && (
        <UserDetailModal
          user={searchedUser}
          onClose={() => {
            setShowUserByIdModal(false);
            setSearchedUser(null);
            setUserIdSearch('');
          }}
        />
      )}

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit User</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Role:</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              required
            >
              <option value="student">Student</option>
              <option value="academic_admin">Academic Admin</option>
              <option value="gbos_admin">GBOS Admin</option>
              <option value="system_admin">System Admin</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              />
              Active
            </label>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reset Password for {user?.username}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <div className="form-group">
            <label>Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User Details</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
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
        
        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
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
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content large-modal" onClick={e => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Create New Student</h2>
          <button className="sys-admin-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="sys-admin-modal-body">
          {error && <div className="error-message">{error}</div>}
        
        <form id="create-student-form" onSubmit={handleSubmit} className="student-form" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label>Student Number: *</label>
              <input
                type="text"
                value={formData.student_number}
                onChange={(e) => setFormData({...formData, student_number: e.target.value})}
                placeholder="Enter student number"
              />
            </div>
            <div className="form-group">
              <label>Course Code: *</label>
              <input
                type="text"
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
        
        <div className="sys-admin-modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button 
            type="button" 
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
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content large-modal" onClick={e => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Edit Student: {student?.student_number}</h2>
          <button className="sys-admin-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="sys-admin-modal-body">
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
        
        <div className="sys-admin-modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" form="student-edit-form" disabled={loading}>
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
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content large-modal" onClick={e => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Student Details: {student.student_number}</h2>
          <button className="sys-admin-close-btn" onClick={onClose}>×</button>
        </div>
        
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
        
        <div className="sys-admin-modal-actions">
          <button onClick={onClose}>Close</button>
          <button onClick={onEdit}>Edit</button>
          <button 
            className="delete-btn" 
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
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content" onClick={e => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Update Profile</h2>
          <button className="sys-admin-close-btn" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          
          <div className="sys-admin-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
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
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content" onClick={e => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Change Password</h2>
          <button className="sys-admin-close-btn" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password:</label>
            <input
              type="password"
              value={formData.current_password}
              onChange={(e) => setFormData({...formData, current_password: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              value={formData.new_password}
              onChange={(e) => setFormData({...formData, new_password: e.target.value})}
              required
              minLength={6}
            />
          </div>
          
          <div className="form-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
              required
              minLength={6}
            />
          </div>
          
          <div className="sys-admin-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
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
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Add New Supervisor</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Supervisor Name:</label>
            <input
              type="text"
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
          
          <div className="sys-admin-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Supervisor'}
            </button>
          </div>
        </form>
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
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Edit Supervisor</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Supervisor Name:</label>
            <input
              type="text"
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
          
          <div className="sys-admin-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Supervisor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SupervisorDetailModal = ({ supervisor, onClose, onEdit, onDelete }) => {
  return (
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Supervisor Details</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="detail-content">
          <div className="detail-section">
            <h3>Supervisor Information</h3>
            <p><strong>ID:</strong> {supervisor.supervisor_id}</p>
            <p><strong>Name:</strong> {supervisor.supervisor_name}</p>
            <p><strong>Email:</strong> {supervisor.email}</p>
            <p><strong>Department:</strong> {supervisor.department}</p>
            <p><strong>Notes:</strong> {supervisor.supervisor_notes || 'No notes available'}</p>
            <p><strong>Created:</strong> {new Date(supervisor.created_date).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="sys-admin-modal-actions">
          <button onClick={onClose}>Close</button>
          <button onClick={onEdit} className="btn-warning">Edit</button>
          <button onClick={() => onDelete(supervisor.supervisor_id)} className="btn-danger">Delete</button>
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
      <div className="sys-admin-modal-overlay" onClick={onClose}>
        <div className="sys-admin-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>{assignment ? 'Edit Assignment' : 'Create New Assignment'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Student:</label>
            <select
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
            <label>Supervisor:</label>
            <select
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
            <label>Role:</label>
            <select
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
            <label>Start Date:</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              required
            />
          </div>
          
          {assignment && (
            <div className="form-group">
              <label>End Date (optional):</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Supervision Notes:</label>
            <textarea
              value={formData.supervision_notes}
              onChange={(e) => setFormData({...formData, supervision_notes: e.target.value})}
              placeholder="Additional notes about this supervision arrangement..."
              rows="3"
            />
          </div>
          
          <div className="sys-admin-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (assignment ? 'Update Assignment' : 'Create Assignment')}
            </button>
          </div>
        </form>
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
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Create New Registration</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Student Number:</label>
            <input
              type="text"
              value={formData.student_number}
              onChange={(e) => setFormData({...formData, student_number: e.target.value})}
              required
              placeholder="Enter student number"
            />
          </div>
          
          <div className="form-group">
            <label>Registration Status:</label>
            <select
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
            <label>Original Registration Deadline:</label>
            <input
              type="date"
              value={formData.original_registration_deadline}
              onChange={(e) => setFormData({...formData, original_registration_deadline: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Extension Length (Days):</label>
            <input
              type="number"
              value={formData.registration_extension_length_days}
              onChange={(e) => setFormData({...formData, registration_extension_length_days: parseInt(e.target.value) || 0})}
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.pgr_registration_process_completed}
                onChange={(e) => setFormData({...formData, pgr_registration_process_completed: e.target.checked})}
              />
              Registration Process Completed
            </label>
          </div>
          
          <div className="sys-admin-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Registration'}
            </button>
          </div>
        </form>
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
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Edit Registration</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Registration Status:</label>
            <select
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
            <label>Original Registration Deadline:</label>
            <input
              type="date"
              value={formData.original_registration_deadline}
              onChange={(e) => setFormData({...formData, original_registration_deadline: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Extension Request Date:</label>
            <input
              type="date"
              value={formData.registration_extension_request_date}
              onChange={(e) => setFormData({...formData, registration_extension_request_date: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Extension Approval Date:</label>
            <input
              type="date"
              value={formData.date_of_registration_extension_approval}
              onChange={(e) => setFormData({...formData, date_of_registration_extension_approval: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Extension Length (Days):</label>
            <input
              type="number"
              value={formData.registration_extension_length_days}
              onChange={(e) => setFormData({...formData, registration_extension_length_days: parseInt(e.target.value) || 0})}
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label>Revised Registration Deadline:</label>
            <input
              type="date"
              value={formData.revised_registration_deadline}
              onChange={(e) => setFormData({...formData, revised_registration_deadline: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.pgr_registration_process_completed}
                onChange={(e) => setFormData({...formData, pgr_registration_process_completed: e.target.checked})}
              />
              Registration Process Completed
            </label>
          </div>
          
          <div className="sys-admin-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RegistrationDetailModal = ({ registration, onClose, onEdit, onApproveExtension }) => {
  return (
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Registration Details</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="detail-content">
          <div className="detail-section">
            <h3>Registration Information</h3>
            <p><strong>Registration ID:</strong> {registration.registration_id}</p>
            <p><strong>Student Number:</strong> {registration.student_number}</p>
            <p><strong>Status:</strong> {registration.registration_status}</p>
            <p><strong>Original Deadline:</strong> {new Date(registration.original_registration_deadline).toLocaleDateString()}</p>
            {registration.revised_registration_deadline && (
              <p><strong>Revised Deadline:</strong> {new Date(registration.revised_registration_deadline).toLocaleDateString()}</p>
            )}
            <p><strong>Extension Days:</strong> {registration.registration_extension_length_days || 0}</p>
            {registration.registration_extension_request_date && (
              <p><strong>Extension Request Date:</strong> {new Date(registration.registration_extension_request_date).toLocaleDateString()}</p>
            )}
            {registration.date_of_registration_extension_approval && (
              <p><strong>Extension Approval Date:</strong> {new Date(registration.date_of_registration_extension_approval).toLocaleDateString()}</p>
            )}
            {registration.date_pgr_moved_to_new_blackboard_group && (
              <p><strong>Moved to Blackboard:</strong> {new Date(registration.date_pgr_moved_to_new_blackboard_group).toLocaleDateString()}</p>
            )}
            <p><strong>Process Completed:</strong> {registration.pgr_registration_process_completed ? 'Yes' : 'No'}</p>
            <p><strong>Created:</strong> {new Date(registration.created_date).toLocaleDateString()}</p>
            <p><strong>Updated:</strong> {new Date(registration.updated_date).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="sys-admin-modal-actions">
          <button onClick={onClose}>Close</button>
          <button onClick={onEdit} className="btn-warning">Edit</button>
          {registration.registration_status === 'extension_requested' && (
            <button 
              onClick={() => onApproveExtension(registration.registration_id)} 
              className="btn-success"
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
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Request Extension</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Student Number:</label>
            <input
              type="text"
              value={registration.student_number}
              disabled
              className="disabled-input"
            />
          </div>
          
          <div className="form-group">
            <label>Extension Days:</label>
            <input
              type="number"
              value={formData.extensionDays}
              onChange={(e) => setFormData({...formData, extensionDays: e.target.value})}
              required
              min="1"
              max="365"
              placeholder="Number of days to extend"
            />
          </div>
          
          <div className="form-group">
            <label>Reason for Extension:</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              required
              rows="4"
              placeholder="Please provide a reason for the extension request..."
            />
          </div>
          
          <div className="sys-admin-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Requesting...' : 'Request Extension'}
            </button>
          </div>
        </form>
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
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Propose Viva Team</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Student Number:</label>
              <input
                type="text"
                value={formData.student_number}
                onChange={(e) => setFormData({...formData, student_number: e.target.value})}
                required
                placeholder="Enter student number"
              />
            </div>
            
            <div className="form-group">
              <label>Stage:</label>
              <select
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
                <label>Internal Examiner 1 ID:</label>
                <input
                  type="number"
                  value={formData.internal_examiner_1_id}
                  onChange={(e) => setFormData({...formData, internal_examiner_1_id: e.target.value})}
                  placeholder="Enter examiner ID"
                />
              </div>
              
              <div className="form-group">
                <label>Internal Examiner 2 ID:</label>
                <input
                  type="number"
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
              <label>External Examiner Name:</label>
              <input
                type="text"
                value={formData.external_examiner_name}
                onChange={(e) => setFormData({...formData, external_examiner_name: e.target.value})}
                required
                placeholder="Enter external examiner name"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>External Examiner Email:</label>
                <input
                  type="email"
                  value={formData.external_examiner_email}
                  onChange={(e) => setFormData({...formData, external_examiner_email: e.target.value})}
                  required
                  placeholder="examiner@university.edu"
                />
              </div>
              
              <div className="form-group">
                <label>External Examiner Institution:</label>
                <input
                  type="text"
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
                <label>Proposed Date:</label>
                <input
                  type="date"
                  value={formData.proposed_date}
                  onChange={(e) => setFormData({...formData, proposed_date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Room/Location for viva"
                />
              </div>
            </div>
          </div>
          
          <div className="sys-admin-modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Propose Viva Team'}
            </button>
          </div>
        </form>
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
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Edit Viva Team</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Student Number:</label>
              <input
                type="text"
                value={formData.student_number}
                onChange={(e) => setFormData({...formData, student_number: e.target.value})}
                required
                placeholder="Enter student number"
              />
            </div>
            
            <div className="form-group">
              <label>Stage:</label>
              <select
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
                <label>Internal Examiner 1 ID:</label>
                <input
                  type="number"
                  value={formData.internal_examiner_1_id}
                  onChange={(e) => setFormData({...formData, internal_examiner_1_id: e.target.value})}
                  placeholder="Enter examiner ID"
                />
              </div>
              
              <div className="form-group">
                <label>Internal Examiner 2 ID:</label>
                <input
                  type="number"
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
              <label>External Examiner Name:</label>
              <input
                type="text"
                value={formData.external_examiner_name}
                onChange={(e) => setFormData({...formData, external_examiner_name: e.target.value})}
                required
                placeholder="Enter external examiner name"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>External Examiner Email:</label>
                <input
                  type="email"
                  value={formData.external_examiner_email}
                  onChange={(e) => setFormData({...formData, external_examiner_email: e.target.value})}
                  required
                  placeholder="examiner@university.edu"
                />
              </div>
              
              <div className="form-group">
                <label>External Examiner Institution:</label>
                <input
                  type="text"
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
                <label>Proposed Date:</label>
                <input
                  type="date"
                  value={formData.proposed_date}
                  onChange={(e) => setFormData({...formData, proposed_date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Room/Location for viva"
                />
              </div>
            </div>
          </div>
          
          <div className="sys-admin-modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const VivaTeamDetailModal = ({ vivaTeam, onClose, onEdit, onApprove, onReject, onSchedule, onSubmitOutcome }) => {
  return (
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Viva Team Details</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="detail-content">
          <div className="detail-section">
            <h3>Team Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Team ID:</label>
                <span>{vivaTeam.id}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className={`status ${vivaTeam.status}`}>
                  {vivaTeam.status?.toUpperCase()}
                </span>
              </div>
              <div className="detail-item">
                <label>Student Number:</label>
                <span>{vivaTeam.student_number}</span>
              </div>
              <div className="detail-item">
                <label>Stage:</label>
                <span>{vivaTeam.stage?.charAt(0).toUpperCase() + vivaTeam.stage?.slice(1)}</span>
              </div>
            </div>
          </div>
          
          <div className="detail-section">
            <h3>Examination Team</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Internal Examiner 1:</label>
                <span>{vivaTeam.internal_examiner_1_id || 'Not assigned'}</span>
              </div>
              <div className="detail-item">
                <label>Internal Examiner 2:</label>
                <span>{vivaTeam.internal_examiner_2_id || 'Not assigned'}</span>
              </div>
              <div className="detail-item">
                <label>External Examiner:</label>
                <span>{vivaTeam.external_examiner_name}</span>
              </div>
              <div className="detail-item">
                <label>External Examiner Email:</label>
                <span>{vivaTeam.external_examiner_email}</span>
              </div>
              <div className="detail-item">
                <label>External Examiner Institution:</label>
                <span>{vivaTeam.external_examiner_institution}</span>
              </div>
            </div>
          </div>
          
          {vivaTeam.proposed_date && (
            <div className="detail-section">
              <h3>Schedule Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Proposed Date:</label>
                  <span>{new Date(vivaTeam.proposed_date).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <label>Location:</label>
                  <span>{vivaTeam.location || 'TBD'}</span>
                </div>
              </div>
            </div>
          )}
          
          {vivaTeam.outcome && (
            <div className="detail-section">
              <h3>Outcome</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Result:</label>
                  <span className={`status outcome-${vivaTeam.outcome.toLowerCase()}`}>
                    {vivaTeam.outcome}
                  </span>
                </div>
                {vivaTeam.outcome_comments && (
                  <div className="detail-item">
                    <label>Comments:</label>
                    <span>{vivaTeam.outcome_comments}</span>
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
        
        <div className="sys-admin-modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          {vivaTeam.status === 'proposed' && (
            <>
              <button onClick={onApprove} className="btn btn-success">Approve</button>
              <button onClick={onReject} className="btn btn-danger">Reject</button>
            </>
          )}
          {vivaTeam.status === 'approved' && (
            <button onClick={onSchedule} className="btn btn-primary">Schedule</button>
          )}
          {vivaTeam.status === 'scheduled' && !vivaTeam.outcome && (
            <button onClick={onSubmitOutcome} className="btn btn-warning">Submit Outcome</button>
          )}
          {vivaTeam.status !== 'completed' && (
            <button onClick={onEdit} className="btn btn-secondary">Edit</button>
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
    <div className="sys-admin-modal-overlay" onClick={onClose}>
      <div className="sys-admin-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="sys-admin-modal-header">
          <h2>Reject Viva Team</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="detail-content">
          <p><strong>Team ID:</strong> {vivaTeam.id}</p>
          <p><strong>Student Number:</strong> {vivaTeam.student_number}</p>
          <p><strong>Stage:</strong> {vivaTeam.stage}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rejection Reason:</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this viva team..."
              rows="4"
              required
            />
          </div>
          
          <div className="sys-admin-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading || !reason.trim()}>
              {loading ? 'Rejecting...' : 'Reject Team'}
            </button>
          </div>
        </form>
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
    <div className="sys-admin-modal-overlay">
      <div className="modal-content large">
        <div className="sys-admin-modal-header">
          <h3>Submission Details</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="submission-details">
            <div className="detail-section">
              <h4>Basic Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Student Number:</label>
                  <span>{submission.student_number || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Title:</label>
                  <span>{submission.title || 'No Title'}</span>
                </div>
                <div className="detail-item">
                  <label>Type:</label>
                  <span className={`submission-type submission-type-${submission.submission_type?.toLowerCase()}`}>
                    {submission.submission_type?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`submission-status submission-status-${submission.status?.toLowerCase()}`}>
                    {submission.status?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Submitted:</label>
                  <span>{submission.submission_date ? new Date(submission.submission_date).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Created:</label>
                  <span>{submission.created_date ? new Date(submission.created_date).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Review Deadline:</label>
                  <span>{submission.review_deadline ? new Date(submission.review_deadline).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Reviewed By:</label>
                  <span>{submission.reviewed_by || 'Not reviewed'}</span>
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
        <div className="sys-admin-modal-actions">
          <button onClick={onClose}>Close</button>
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
    <div className="sys-admin-modal-overlay">
      <div className="sys-admin-modal-content">
        <div className="sys-admin-modal-header">
          <h3>Review Submission</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Submission:</label>
            <div className="submission-info">
              <strong>{submission.title}</strong>
              <span>by {submission.student_number}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Review Status:</label>
            <select
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
            <label>Review Comments:</label>
            <textarea
              value={formData.review_comments}
              onChange={(e) => setFormData({...formData, review_comments: e.target.value})}
              placeholder="Provide feedback on the submission..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Review Deadline:</label>
            <input
              type="date"
              value={formData.review_deadline || ''}
              onChange={(e) => setFormData({...formData, review_deadline: e.target.value})}
            />
          </div>

          <div className="sys-admin-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
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
    <div className="sys-admin-modal-overlay">
      <div className="sys-admin-modal-content">
        <div className="sys-admin-modal-header">
          <h3>Reject Submission</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Submission:</label>
            <div className="submission-info">
              <strong>{submission.title}</strong>
              <span>by {submission.student_name}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Rejection Reason:</label>
            <select
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
            <label>Detailed Feedback:</label>
            <textarea
              value={formData.feedback}
              onChange={(e) => setFormData({...formData, feedback: e.target.value})}
              placeholder="Provide detailed feedback explaining the rejection..."
              rows="5"
              required
            />
          </div>

          <div className="sys-admin-modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading} className="btn-danger">
              {loading ? 'Rejecting...' : 'Reject Submission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemAdminDashboard;
