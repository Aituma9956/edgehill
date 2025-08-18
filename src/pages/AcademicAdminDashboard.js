import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, studentAPI, supervisorAPI, registrationAPI, assignmentAPI, vivaTeamAPI } from '../utils/api';
import '../styles/dashboard.css';
import '../styles/academic-admin-dashboard.css';

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

const AcademicAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Student management state
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
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
  const [showSupervisorDetailModal, setShowSupervisorDetailModal] = useState(false);
  const [supervisorSearch, setSupervisorSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [supervisorIdSearch, setSupervisorIdSearch] = useState('');
  const [searchedSupervisor, setSearchedSupervisor] = useState(null);
  const [searchingSupervisorById, setSearchingSupervisorById] = useState(false);
  
  // Registration management state
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsError, setRegistrationsError] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
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
  const [showVivaTeamDetailModal, setShowVivaTeamDetailModal] = useState(false);
  const [vivaTeamSearch, setVivaTeamSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [vivaTeamStatusFilter, setVivaTeamStatusFilter] = useState('');
  const [vivaTeamIdSearch, setVivaTeamIdSearch] = useState('');
  const [searchedVivaTeam, setSearchedVivaTeam] = useState(null);
  const [searchingVivaTeamById, setSearchingVivaTeamById] = useState(false);
  
  // Assignment management state
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showAssignmentDetailModal, setShowAssignmentDetailModal] = useState(false);
  const [assignmentIdSearch, setAssignmentIdSearch] = useState('');
  const [searchedAssignment, setSearchedAssignment] = useState(null);
  const [searchingAssignmentById, setSearchingAssignmentById] = useState(false);
  
  // Profile management state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  
  // Dashboard stats state
  const [stats, setStats] = useState({
    totalStudents: 0,
    internationalStudents: 0,
    domesticStudents: 0,
    totalSupervisors: 0,
    activeSupervisors: 0,
    totalRegistrations: 0,
    pendingRegistrations: 0,
    approvedRegistrations: 0,
    completedRegistrations: 0,
  });

  // Fetch functions
  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      setStudentsError('');
      
      const data = await studentAPI.getAllStudents(0, 100, studentSearch, programmeFilter);
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

  const fetchAssignments = async () => {
    try {
      setAssignmentsLoading(true);
      setAssignmentsError('');
      
      const data = await assignmentAPI.getAllAssignments(0, 1000);
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      const errorMessage = extractErrorMessage(error, 'Failed to fetch assignments');
      setAssignmentsError(`Failed to fetch assignments: ${errorMessage}`);
    } finally {
      setAssignmentsLoading(false);
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
      const errorMessage = extractErrorMessage(error, 'Failed to fetch viva teams');
      setVivaTeamsError(`Failed to fetch viva teams: ${errorMessage}`);
    } finally {
      setVivaTeamsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch data for dashboard stats
      const [studentsData, supervisorsData, registrationsData] = await Promise.all([
        studentAPI.getAllStudents(0, 1000),
        supervisorAPI.getAllSupervisors(0, 1000),
        registrationAPI.getAllRegistrations(0, 1000)
      ]);
      
      const studentStats = {
        totalStudents: studentsData.length,
        internationalStudents: studentsData.filter(s => s.student_type === 'international').length,
        domesticStudents: studentsData.filter(s => s.student_type === 'domestic').length,
      };
      
      const supervisorStats = {
        totalSupervisors: supervisorsData.length,
        activeSupervisors: supervisorsData.filter(s => s.status === 'active').length,
      };
      
      const registrationStats = {
        totalRegistrations: registrationsData.length,
        pendingRegistrations: registrationsData.filter(r => r.status === 'pending').length,
        approvedRegistrations: registrationsData.filter(r => r.status === 'approved').length,
        completedRegistrations: registrationsData.filter(r => r.status === 'completed').length,
      };
      
      setStats({
        ...studentStats,
        ...supervisorStats,
        ...registrationStats
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Search functions
  const searchStudentById = async () => {
    if (!studentNumberSearch.trim()) return;
    
    try {
      setSearchingStudentById(true);
      setStudentsError('');
      const student = await studentAPI.getStudentById(studentNumberSearch);
      setSearchedStudent(student);
      setSelectedStudent(student);
      setShowStudentDetailModal(true);
    } catch (error) {
      console.error('Error searching student:', error);
      const errorMessage = extractErrorMessage(error, 'Student not found');
      setStudentsError(`Student not found: ${errorMessage}`);
      setSearchedStudent(null);
    } finally {
      setSearchingStudentById(false);
    }
  };

  const searchSupervisorById = async () => {
    if (!supervisorIdSearch.trim()) return;
    
    try {
      setSearchingSupervisorById(true);
      setSupervisorsError('');
      const supervisor = await supervisorAPI.getSupervisorById(supervisorIdSearch);
      setSearchedSupervisor(supervisor);
      setSelectedSupervisor(supervisor);
      setShowSupervisorDetailModal(true);
    } catch (error) {
      console.error('Error searching supervisor:', error);
      const errorMessage = extractErrorMessage(error, 'Supervisor not found');
      setSupervisorsError(`Supervisor not found: ${errorMessage}`);
      setSearchedSupervisor(null);
    } finally {
      setSearchingSupervisorById(false);
    }
  };

  const searchRegistrationById = async () => {
    if (!registrationIdSearch.trim()) return;
    
    try {
      setSearchingRegistrationById(true);
      const registration = await registrationAPI.getRegistrationById(registrationIdSearch);
      setSearchedRegistration(registration);
    } catch (error) {
      console.error('Error searching registration:', error);
      const errorMessage = extractErrorMessage(error, 'Registration not found');
      setRegistrationsError(`Registration not found: ${errorMessage}`);
      setSearchedRegistration(null);
    } finally {
      setSearchingRegistrationById(false);
    }
  };

  // CRUD functions
  const handleCreateStudent = async (studentData) => {
    try {
      await studentAPI.createStudent(studentData);
      fetchStudents();
      fetchDashboardData();
      setShowCreateStudentModal(false);
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  };

  const handleUpdateStudent = async (studentId, studentData) => {
    try {
      await studentAPI.updateStudent(studentId, studentData);
      fetchStudents();
      fetchDashboardData();
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
        fetchStudents();
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const handleCreateRegistration = async (registrationData) => {
    try {
      await registrationAPI.createRegistration(registrationData);
      fetchRegistrations();
      fetchDashboardData();
      setShowRegistrationModal(false);
    } catch (error) {
      console.error('Error creating registration:', error);
      throw error;
    }
  };

  const handleUpdateRegistration = async (registrationId, registrationData) => {
    try {
      await registrationAPI.updateRegistration(registrationId, registrationData);
      fetchRegistrations();
      fetchDashboardData();
      setShowRegistrationModal(false);
      setSelectedRegistration(null);
    } catch (error) {
      console.error('Error updating registration:', error);
      throw error;
    }
  };

  const handleExtensionRequest = async (registrationId, extensionData) => {
    try {
      await registrationAPI.requestExtension(registrationId, extensionData.extension_days, extensionData.reason);
      fetchRegistrations();
      setShowExtensionModal(false);
      setSelectedRegistration(null);
    } catch (error) {
      console.error('Error requesting extension:', error);
      throw error;
    }
  };

  const handleApproveExtension = async (registrationId) => {
    if (window.confirm('Are you sure you want to approve this extension request?')) {
      try {
        await registrationAPI.approveExtension(registrationId);
        fetchRegistrations();
      } catch (error) {
        console.error('Error approving extension:', error);
        setRegistrationsError(`Failed to approve extension: ${extractErrorMessage(error, 'Failed to approve extension')}`);
      }
    }
  };

  // Assignment management functions
  const handleCreateAssignment = async (assignmentData) => {
    try {
      await assignmentAPI.assignSupervisor(assignmentData);
      fetchAssignments();
      fetchDashboardData();
      setShowAssignmentModal(false);
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  };

  const handleUpdateAssignment = async (assignmentId, assignmentData) => {
    try {
      await assignmentAPI.updateAssignment(assignmentId, assignmentData);
      fetchAssignments();
      fetchDashboardData();
      setShowAssignmentModal(false);
      setSelectedAssignment(null);
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to remove this assignment?')) {
      try {
        await assignmentAPI.removeAssignment(assignmentId);
        fetchAssignments();
        fetchDashboardData();
      } catch (error) {
        console.error('Error removing assignment:', error);
        alert('Failed to remove assignment: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const fetchAssignmentById = async (assignmentId) => {
    try {
      setAssignmentsError('');
      setSearchingAssignmentById(true);
      
      const assignmentData = await assignmentAPI.getAssignmentById(assignmentId);
      setSearchedAssignment(assignmentData);
      return assignmentData;
    } catch (error) {
      console.error('Error fetching assignment by ID:', error);
      const errorMessage = extractErrorMessage(error, 'Assignment not found');
      setAssignmentsError(`Failed to fetch assignment: ${errorMessage}`);
      setSearchedAssignment(null);
    } finally {
      setSearchingAssignmentById(false);
    }
  };

  const searchAssignmentById = async () => {
    if (!assignmentIdSearch.trim()) {
      setAssignmentsError('Please enter an assignment ID');
      return;
    }

    try {
      const assignmentData = await fetchAssignmentById(parseInt(assignmentIdSearch));
      if (assignmentData) {
        setSelectedAssignment(assignmentData);
        setShowAssignmentDetailModal(true);
      }
    } catch (error) {
      console.error('Error searching assignment by ID:', error);
    }
  };

  // Viva Team management functions
  const fetchVivaTeamById = async (vivaTeamId) => {
    try {
      setVivaTeamsError('');
      setSearchingVivaTeamById(true);
      
      const vivaTeamData = await vivaTeamAPI.getVivaTeamById(vivaTeamId);
      setSearchedVivaTeam(vivaTeamData);
      return vivaTeamData;
    } catch (error) {
      console.error('Error fetching viva team by ID:', error);
      const errorMessage = extractErrorMessage(error, 'Viva team not found');
      setVivaTeamsError(`Failed to fetch viva team: ${errorMessage}`);
      setSearchedVivaTeam(null);
    } finally {
      setSearchingVivaTeamById(false);
    }
  };

  const searchVivaTeamById = async () => {
    if (!vivaTeamIdSearch.trim()) {
      setVivaTeamsError('Please enter a viva team ID');
      return;
    }

    try {
      const vivaTeamData = await fetchVivaTeamById(parseInt(vivaTeamIdSearch));
      if (vivaTeamData) {
        setSelectedVivaTeam(vivaTeamData);
        setShowVivaTeamDetailModal(true);
      }
    } catch (error) {
      console.error('Error searching viva team by ID:', error);
    }
  };

  // Profile management functions
  const handleUpdateProfile = async (profileData) => {
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

  // Effect hooks
  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeSection === 'students') {
      fetchStudents();
    } else if (activeSection === 'supervisors') {
      fetchSupervisors();
    } else if (activeSection === 'registrations') {
      fetchRegistrations();
    } else if (activeSection === 'assignments') {
      fetchAssignments();
    } else if (activeSection === 'viva-teams') {
      fetchVivaTeams();
    }
  }, [activeSection, studentSearch, programmeFilter, supervisorSearch, departmentFilter, registrationSearch, statusFilter, vivaTeamSearch, stageFilter, vivaTeamStatusFilter]);

  // Navigation functions
  const handleLogout = () => {
    logout();
  };

  const renderDashboard = () => (
    <div className="academic-admin-dashboard-content">
      <h1>Academic Administration Dashboard</h1>
      <p>Welcome back, {user?.first_name} {user?.last_name}! Manage academic operations efficiently.</p>
      
      <div className="academic-admin-stats-grid">
        <div className="academic-admin-stat-card">
          <h3>Total Students</h3>
          <div className="academic-admin-stat-number">{stats.totalStudents}</div>
          <div className="academic-admin-stat-trend">International: {stats.internationalStudents} | Domestic: {stats.domesticStudents}</div>
        </div>
        <div className="academic-admin-stat-card">
          <h3>Total Supervisors</h3>
          <div className="academic-admin-stat-number">{stats.totalSupervisors}</div>
          <div className="academic-admin-stat-trend">Active: {stats.activeSupervisors}</div>
        </div>
        <div className="academic-admin-stat-card">
          <h3>Total Registrations</h3>
          <div className="academic-admin-stat-number">{stats.totalRegistrations}</div>
          <div className="academic-admin-stat-trend">Pending: {stats.pendingRegistrations} | Approved: {stats.approvedRegistrations}</div>
        </div>
      </div>
      
      <div className="dashboard-actions" style={{marginTop: '24px'}}>
        <button className="academic-admin-btn academic-admin-btn-primary" onClick={() => fetchDashboardData()}>
          Refresh Data
        </button>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="academic-admin-management-content">
      <div className="academic-admin-management-header">
        <h1>Student Management</h1>
        <div className="academic-admin-management-controls">
          <button 
            className="academic-admin-btn academic-admin-btn-primary"
            onClick={() => setShowCreateStudentModal(true)}
          >
            Add New Student
          </button>
        </div>
      </div>

      <div className="search-controls" style={{padding: '16px 24px', borderBottom: '1px solid #e1f5fe'}}>
        <div className="academic-admin-search-bar">
          <input
            type="text"
            placeholder="Search students..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="academic-admin-search-input"
          />
        </div>
        <select
          value={programmeFilter}
          onChange={(e) => setProgrammeFilter(e.target.value)}
          className="academic-admin-filter-select"
        >
          <option value="">All Programmes</option>
          {[...new Set(students.map(s => s.programme_of_study).filter(Boolean))].map(programme => (
            <option key={programme} value={programme}>{programme}</option>
          ))}
        </select>
        <div className="academic-admin-search-bar">
          <input
            type="text"
            placeholder="Search by Student Number"
            value={studentNumberSearch}
            onChange={(e) => setStudentNumberSearch(e.target.value)}
            className="academic-admin-search-input"
          />
          <button 
            className="academic-admin-btn academic-admin-btn-secondary"
            onClick={searchStudentById}
            disabled={searchingStudentById}
          >
            {searchingStudentById ? 'Searching...' : 'Find by Number'}
          </button>
        </div>
      </div>

      {studentsError && (
        <div className="error-message">
          {studentsError}
        </div>
      )}

      {studentsLoading ? (
        <div className="loading">Loading students...</div>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Student Number</th>
                <th>Name</th>
                <th>Course Code</th>
                <th>Programme</th>
                <th>Type</th>
                <th>Cohort</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students
                .filter((student) => {
                  const matchesSearch = !studentSearch || 
                    `${student.forename} ${student.surname}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    student.student_number.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    student.course_code?.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    student.programme_of_study?.toLowerCase().includes(studentSearch.toLowerCase());
                  
                  const matchesProgramme = !programmeFilter || 
                    student.programme_of_study === programmeFilter;
                  
                  return matchesSearch && matchesProgramme;
                })
                .map((student) => (
                <tr key={student.student_number}>
                  <td>{student.student_number}</td>
                  <td>{student.forename} {student.surname}</td>
                  <td>{student.course_code}</td>
                  <td>{student.programme_of_study}</td>
                  <td>{student.mode}</td>
                  <td>{student.cohort}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowStudentDetailModal(true);
                      }}
                    >
                      View
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowStudentModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-secondary delete"
                      onClick={() => handleDeleteStudent(student.student_number)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {students.length === 0 && !studentsLoading && (
            <div className="no-data">
              No students found. <button className="btn-link" onClick={() => setShowCreateStudentModal(true)}>Add the first student</button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSupervisors = () => (
    <div className="management-content">
      <div className="management-header">
        <h1>Supervisor Management</h1>
        <div className="permission-notice">
          <small>Note: You can view supervisors but cannot create, edit, or delete them. Contact system admin for supervisor management.</small>
        </div>
      </div>

      <div className="search-controls">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search supervisors..."
            value={supervisorSearch}
            onChange={(e) => setSupervisorSearch(e.target.value)}
          />
        </div>
        <div className="search-group">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {[...new Set(supervisors.map(s => s.department).filter(Boolean))].map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div className="search-group">
          <input
            type="text"
            placeholder="Search by Supervisor ID..."
            value={supervisorIdSearch}
            onChange={(e) => setSupervisorIdSearch(e.target.value)}
          />
          <button 
            className="btn-secondary"
            onClick={searchSupervisorById}
            disabled={searchingSupervisorById}
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
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {supervisors
                .filter(supervisor => {
                  const matchesSearch = !supervisorSearch || 
                    supervisor.supervisor_name.toLowerCase().includes(supervisorSearch.toLowerCase()) ||
                    supervisor.email.toLowerCase().includes(supervisorSearch.toLowerCase());
                  const matchesDepartment = !departmentFilter || supervisor.department === departmentFilter;
                  return matchesSearch && matchesDepartment;
                })
                .map((supervisor) => (
                <tr key={supervisor.supervisor_id}>
                  <td>{supervisor.supervisor_id}</td>
                  <td>{supervisor.supervisor_name}</td>
                  <td>{supervisor.email}</td>
                  <td>{supervisor.department}</td>
                  <td>{new Date(supervisor.created_date).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setSelectedSupervisor(supervisor);
                        setShowSupervisorDetailModal(true);
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {supervisors.length === 0 && !supervisorsLoading && (
            <div className="no-data">
              No supervisors found.
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderAssignments = () => (
    <div className="management-content">
      <div className="management-header">
        <h1>Student-Supervisor Assignments</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setSelectedAssignment(null);
              setShowAssignmentModal(true);
            }}
          >
            Create New Assignment
          </button>
        </div>
      </div>

      <div className="search-filters">
        <div className="search-group">
          <input
            type="text"
            placeholder="Search by Assignment ID"
            value={assignmentIdSearch}
            onChange={(e) => setAssignmentIdSearch(e.target.value)}
            className="search-input"
          />
          <button 
            onClick={searchAssignmentById}
            className="btn btn-secondary"
            disabled={searchingAssignmentById}
          >
            {searchingAssignmentById ? 'Searching...' : 'Search'}
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
                          setShowAssignmentDetailModal(true);
                        }}
                        className="btn btn-sm btn-info"
                      >
                        View
                      </button>
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
              No assignments found. <button onClick={() => {
                setSelectedAssignment(null);
                setShowAssignmentModal(true);
              }}>Create the first assignment</button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderRegistrations = () => (
    <div className="management-content">
      <div className="management-header">
        <h1>Registration Management</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setSelectedRegistration(null);
              setShowRegistrationModal(true);
            }}
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
              if (!registrationIdSearch.trim()) {
                setRegistrationsError('Please enter a registration ID');
                return;
              }
              try {
                setSearchingRegistrationById(true);
                setRegistrationsError('');
                const registration = await registrationAPI.getRegistrationById(registrationIdSearch);
                setSearchedRegistration(registration);
                setSelectedRegistration(registration);
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
              No registrations found. <button onClick={() => {
                setSelectedRegistration(null);
                setShowRegistrationModal(true);
              }}>Create the first registration</button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderVivaTeams = () => (
    <div className="management-content">
      <div className="management-header">
        <h1>Viva Team Management</h1>
        <div className="header-actions">
          <span className="info-text">Read-only access - View and track viva teams</span>
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

        <div className="search-group">
          <input
            type="text"
            placeholder="Search by Viva Team ID..."
            value={vivaTeamIdSearch}
            onChange={(e) => setVivaTeamIdSearch(e.target.value)}
            className="search-input"
          />
          <button 
            onClick={searchVivaTeamById}
            className="btn btn-secondary"
            disabled={searchingVivaTeamById}
          >
            {searchingVivaTeamById ? 'Searching...' : 'Find by ID'}
          </button>
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
                  <td>{vivaTeam.scheduled_date ? new Date(vivaTeam.scheduled_date).toLocaleDateString() : 'N/A'}</td>
                  <td>{vivaTeam.location || 'N/A'}</td>
                  <td>{vivaTeam.outcome || 'Pending'}</td>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {Array.isArray(vivaTeams) && vivaTeams.length === 0 && (
            <div className="no-data">
              No viva teams found.
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderReports = () => (
    <div className="management-content">
      <div className="management-header">
        <h1>Reports & Analytics</h1>
      </div>
      
      <div className="reports-grid">
        <div className="report-card">
          <h3>Student Analytics</h3>
          <p>Track student enrollment, progression, and completion rates</p>
          <div className="report-stats">
            <p>Total Students: {stats.totalStudents}</p>
            <p>International: {stats.internationalStudents}</p>
            <p>Domestic: {stats.domesticStudents}</p>
          </div>
          <button className="btn-secondary">Generate Report</button>
        </div>
        
        <div className="report-card">
          <h3>Supervisor Analytics</h3>
          <p>Monitor supervisor workload and capacity</p>
          <div className="report-stats">
            <p>Total Supervisors: {stats.totalSupervisors}</p>
            <p>Active: {stats.activeSupervisors}</p>
          </div>
          <button className="btn-secondary">Generate Report</button>
        </div>
        
        <div className="report-card">
          <h3>Registration Analytics</h3>
          <p>View registration trends and processing times</p>
          <div className="report-stats">
            <p>Total Registrations: {stats.totalRegistrations}</p>
            <p>Pending: {stats.pendingRegistrations}</p>
            <p>Approved: {stats.approvedRegistrations}</p>
          </div>
          <button className="btn-secondary">Generate Report</button>
        </div>
        
        <div className="report-card">
          <h3>Programme Analytics</h3>
          <p>Analyze programme popularity and outcomes</p>
          <button className="btn-secondary">Generate Report</button>
        </div>
      </div>
    </div>
  );

  const renderAwards = () => (
    <div className="management-content">
      <div className="management-header">
        <h1>Awards & Graduation</h1>
      </div>
      
      <div className="awards-grid">
        <div className="award-section">
          <h3>Graduation Processing</h3>
          <p>Manage student graduation procedures and ceremonies</p>
          <div className="graduation-stats">
            <p>Students Eligible for Graduation: {stats.completedRegistrations}</p>
          </div>
          <button className="btn-primary">Process Graduations</button>
        </div>
        
        <div className="award-section">
          <h3>Academic Awards</h3>
          <p>Track and manage academic achievement awards</p>
          <button className="btn-primary">Manage Awards</button>
        </div>
        
        <div className="award-section">
          <h3>Degree Classifications</h3>
          <p>Review and approve degree classifications</p>
          <button className="btn-primary">Review Classifications</button>
        </div>
        
        <div className="award-section">
          <h3>Graduation Ceremonies</h3>
          <p>Organize and schedule graduation ceremonies</p>
          <button className="btn-primary">Schedule Ceremonies</button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'students':
        return renderStudents();
      case 'supervisors':
        return renderSupervisors();
      case 'assignments':
        return renderAssignments();
      case 'registrations':
        return renderRegistrations();
      case 'viva-teams':
        return renderVivaTeams();
      case 'reports':
        return renderReports();
      case 'awards':
        return renderAwards();
      default:
        return renderDashboard();
    }
  };

  // Navigation items for sidebar
  const navigationItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'students', icon: '👨‍🎓', label: 'Students' },
    { id: 'supervisors', icon: '👨‍🏫', label: 'Supervisors' },
    { id: 'assignments', icon: '🔗', label: 'Assignments' },
    { id: 'registrations', icon: '📋', label: 'Registrations' },
    { id: 'viva-teams', icon: '🎯', label: 'Viva Teams' },
    { id: 'reports', icon: '📈', label: 'Reports & Analytics' },
    { id: 'awards', icon: '🏆', label: 'Awards & Graduation' }
  ];

  // Render functions
  const renderSidebar = () => (
    <aside className={`academic-admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="academic-admin-sidebar-header">
        <h2>{sidebarCollapsed ? 'AA' : 'Academic Admin Portal'}</h2>
        <button 
          className="academic-admin-sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="academic-admin-sidebar-nav">
        {navigationItems.map(item => (
          <button
            key={item.id}
            className={`academic-admin-nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
          >
            <span className="academic-admin-nav-icon">{item.icon}</span>
            {!sidebarCollapsed && <span className="academic-admin-nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>
      
      <div className="academic-admin-sidebar-footer">
        <button className="academic-admin-logout-btn" onClick={handleLogout}>
          <span className="academic-admin-nav-icon">🚪</span>
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="academic-admin-layout">
      {renderSidebar()}
      <main className={`academic-admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {renderContent()}
      </main>

      {/* Modal Components */}
      {showCreateStudentModal && (
        <CreateStudentModal
          onClose={() => setShowCreateStudentModal(false)}
          onSave={handleCreateStudent}
        />
      )}
      
      {showStudentModal && selectedStudent && (
        <EditStudentModal
          student={selectedStudent}
          onClose={() => {
            setShowStudentModal(false);
            setSelectedStudent(null);
          }}
          onSave={handleUpdateStudent}
        />
      )}
      
      {showStudentDetailModal && selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => {
            setShowStudentDetailModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
      
      {showSupervisorDetailModal && selectedSupervisor && (
        <SupervisorDetailModal
          supervisor={selectedSupervisor}
          onClose={() => {
            setShowSupervisorDetailModal(false);
            setSelectedSupervisor(null);
          }}
        />
      )}
      
      {showRegistrationModal && (
        <RegistrationModal
          registration={selectedRegistration}
          onClose={() => {
            setShowRegistrationModal(false);
            setSelectedRegistration(null);
          }}
          onSave={selectedRegistration ? handleUpdateRegistration : handleCreateRegistration}
        />
      )}
      
      {showRegistrationDetailModal && selectedRegistration && (
        <RegistrationDetailModal
          registration={selectedRegistration}
          onClose={() => {
            setShowRegistrationDetailModal(false);
            setSelectedRegistration(null);
            setSearchedRegistration(null);
          }}
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
      
      {showAssignmentModal && (
        <AssignmentModal
          assignment={selectedAssignment}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedAssignment(null);
          }}
          onSave={selectedAssignment ? handleUpdateAssignment : handleCreateAssignment}
        />
      )}
      
      {showAssignmentDetailModal && selectedAssignment && (
        <AssignmentDetailModal
          assignment={selectedAssignment}
          onClose={() => {
            setShowAssignmentDetailModal(false);
            setSelectedAssignment(null);
          }}
        />
      )}
      
      {showProfileModal && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onSave={handleUpdateProfile}
        />
      )}
      
      {showChangePasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowChangePasswordModal(false)}
          onSave={handleChangePassword}
        />
      )}

      {/* Viva Team Detail Modal */}
      {showVivaTeamDetailModal && selectedVivaTeam && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Viva Team Details</h3>
              <span 
                className="close" 
                onClick={() => {
                  setShowVivaTeamDetailModal(false);
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
                    <label>External Examiner Affiliation:</label>
                    <span>{selectedVivaTeam.external_examiner_affiliation || 'Not provided'}</span>
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
                    <label>Location:</label>
                    <span>{selectedVivaTeam.location || 'Not specified'}</span>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Results & Comments</h4>
                  <div className="detail-item">
                    <label>Outcome:</label>
                    <span>{selectedVivaTeam.outcome || 'Pending'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Comments:</label>
                    <span>{selectedVivaTeam.comments || 'No comments'}</span>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h4>Audit Information</h4>
                  <div className="detail-item">
                    <label>Created Date:</label>
                    <span>{selectedVivaTeam.created_at ? new Date(selectedVivaTeam.created_at).toLocaleString() : 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated:</label>
                    <span>{selectedVivaTeam.updated_at ? new Date(selectedVivaTeam.updated_at).toLocaleString() : 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => {
                  setShowVivaTeamDetailModal(false);
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
    </div>
  );
};

// Modal Components
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
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await onSave(formData);
      onClose();
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to create student'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Student</h2>
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
              />
            </div>
            
            <div className="form-group">
              <label>Cohort:</label>
              <input
                type="text"
                value={formData.cohort}
                onChange={(e) => setFormData({...formData, cohort: e.target.value})}
                required
              />
            </div>
          </div>

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
              <label>Course Code:</label>
              <input
                type="text"
                value={formData.course_code}
                onChange={(e) => setFormData({...formData, course_code: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Mode:</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({...formData, mode: e.target.value})}
                required
              >
                <option value="">Select Mode</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
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
                required
              />
            </div>
            
            <div className="form-group">
              <label>Programme of Study:</label>
              <input
                type="text"
                value={formData.programme_of_study}
                onChange={(e) => setFormData({...formData, programme_of_study: e.target.value})}
                required
              />
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

          <div className="form-group">
            <label>Student Notes:</label>
            <textarea
              value={formData.student_notes}
              onChange={(e) => setFormData({...formData, student_notes: e.target.value})}
              rows="3"
            />
          </div>

          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="international_student"
                checked={formData.international_student}
                onChange={(e) => setFormData({...formData, international_student: e.target.checked})}
              />
              <label htmlFor="international_student">International Student</label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="previous_ehu_student"
                checked={formData.previous_ehu_student}
                onChange={(e) => setFormData({...formData, previous_ehu_student: e.target.checked})}
              />
              <label htmlFor="previous_ehu_student">Previous EHU Student</label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="previous_ehu_undergraduate"
                checked={formData.previous_ehu_undergraduate}
                onChange={(e) => setFormData({...formData, previous_ehu_undergraduate: e.target.checked})}
              />
              <label htmlFor="previous_ehu_undergraduate">Previous EHU Undergraduate</label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="previous_ehu_pgt_student"
                checked={formData.previous_ehu_pgt_student}
                onChange={(e) => setFormData({...formData, previous_ehu_pgt_student: e.target.checked})}
              />
              <label htmlFor="previous_ehu_pgt_student">Previous EHU PGT Student</label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="previous_ehu_mres_student"
                checked={formData.previous_ehu_mres_student}
                onChange={(e) => setFormData({...formData, previous_ehu_mres_student: e.target.checked})}
              />
              <label htmlFor="previous_ehu_mres_student">Previous EHU MRes Student</label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditStudentModal = ({ student, onClose, onSave }) => {
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
      onClose();
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to update student'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Student</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Student Number:</label>
              <input
                type="text"
                value={student?.student_number || ''}
                disabled
                className="disabled-input"
              />
            </div>
            
            <div className="form-group">
              <label>Cohort:</label>
              <input
                type="text"
                value={formData.cohort}
                onChange={(e) => setFormData({...formData, cohort: e.target.value})}
                required
              />
            </div>
          </div>

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
              <label>Course Code:</label>
              <input
                type="text"
                value={formData.course_code}
                onChange={(e) => setFormData({...formData, course_code: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Mode:</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({...formData, mode: e.target.value})}
                required
              >
                <option value="">Select Mode</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
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
                required
              />
            </div>
            
            <div className="form-group">
              <label>Programme of Study:</label>
              <input
                type="text"
                value={formData.programme_of_study}
                onChange={(e) => setFormData({...formData, programme_of_study: e.target.value})}
                required
              />
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

          <div className="form-group">
            <label>Student Notes:</label>
            <textarea
              value={formData.student_notes}
              onChange={(e) => setFormData({...formData, student_notes: e.target.value})}
              rows="3"
            />
          </div>

          <div className="checkbox-group">
            <div className="checkbox-item">
              <input
                type="checkbox"
                id="edit_international_student"
                checked={formData.international_student}
                onChange={(e) => setFormData({...formData, international_student: e.target.checked})}
              />
              <label htmlFor="edit_international_student">International Student</label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="edit_previous_ehu_student"
                checked={formData.previous_ehu_student}
                onChange={(e) => setFormData({...formData, previous_ehu_student: e.target.checked})}
              />
              <label htmlFor="edit_previous_ehu_student">Previous EHU Student</label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="edit_previous_ehu_undergraduate"
                checked={formData.previous_ehu_undergraduate}
                onChange={(e) => setFormData({...formData, previous_ehu_undergraduate: e.target.checked})}
              />
              <label htmlFor="edit_previous_ehu_undergraduate">Previous EHU Undergraduate</label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="edit_previous_ehu_pgt_student"
                checked={formData.previous_ehu_pgt_student}
                onChange={(e) => setFormData({...formData, previous_ehu_pgt_student: e.target.checked})}
              />
              <label htmlFor="edit_previous_ehu_pgt_student">Previous EHU PGT Student</label>
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="edit_previous_ehu_mres_student"
                checked={formData.previous_ehu_mres_student}
                onChange={(e) => setFormData({...formData, previous_ehu_mres_student: e.target.checked})}
              />
              <label htmlFor="edit_previous_ehu_mres_student">Previous EHU MRes Student</label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StudentDetailModal = ({ student, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Student Details</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="detail-content">
          <div className="detail-section">
            <h3>Basic Information</h3>
            <div className="detail-row">
              <label>Name:</label>
              <span>{student.forename} {student.surname}</span>
            </div>
            <div className="detail-row">
              <label>Student Number:</label>
              <span>{student.student_number}</span>
            </div>
            <div className="detail-row">
              <label>Cohort:</label>
              <span>{student.cohort}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Academic Information</h3>
            <div className="detail-row">
              <label>Course Code:</label>
              <span>{student.course_code}</span>
            </div>
            <div className="detail-row">
              <label>Programme of Study:</label>
              <span>{student.programme_of_study}</span>
            </div>
            <div className="detail-row">
              <label>Subject Area:</label>
              <span>{student.subject_area}</span>
            </div>
            <div className="detail-row">
              <label>Mode:</label>
              <span>{student.mode}</span>
            </div>
            <div className="detail-row">
              <label>Quercus Course Name:</label>
              <span>{student.quercus_course_name || 'N/A'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Background Information</h3>
            <div className="detail-row">
              <label>International Student:</label>
              <span>{student.international_student ? 'Yes' : 'No'}</span>
            </div>
            <div className="detail-row">
              <label>Previous EHU Student:</label>
              <span>{student.previous_ehu_student ? 'Yes' : 'No'}</span>
            </div>
            <div className="detail-row">
              <label>Previous EHU Undergraduate:</label>
              <span>{student.previous_ehu_undergraduate ? 'Yes' : 'No'}</span>
            </div>
            <div className="detail-row">
              <label>Previous EHU PGT Student:</label>
              <span>{student.previous_ehu_pgt_student ? 'Yes' : 'No'}</span>
            </div>
            <div className="detail-row">
              <label>Previous EHU MRes Student:</label>
              <span>{student.previous_ehu_mres_student ? 'Yes' : 'No'}</span>
            </div>
            <div className="detail-row">
              <label>Previous Institution:</label>
              <span>{student.previous_institution || 'N/A'}</span>
            </div>
          </div>

          {student.student_notes && (
            <div className="detail-section">
              <h3>Notes</h3>
              <div className="detail-row">
                <span className="notes-content">{student.student_notes}</span>
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3>System Information</h3>
            <div className="detail-row">
              <label>Created Date:</label>
              <span>{new Date(student.created_date).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <label>Last Updated:</label>
              <span>{new Date(student.updated_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const CreateSupervisorModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    phone: '',
    office_location: '',
    specialization: ''
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Supervisor</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title:</label>
            <select
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            >
              <option value="">Select Title</option>
              <option value="Dr">Dr</option>
              <option value="Prof">Prof</option>
              <option value="Mr">Mr</option>
              <option value="Ms">Ms</option>
              <option value="Mrs">Mrs</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
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
            <label>Department:</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              required
            >
              <option value="">Select Department</option>
              <option value="computer_science">Computer Science</option>
              <option value="engineering">Engineering</option>
              <option value="mathematics">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Phone:</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Office Location:</label>
            <input
              type="text"
              value={formData.office_location}
              onChange={(e) => setFormData({...formData, office_location: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Specialization:</label>
            <textarea
              value={formData.specialization}
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              rows="3"
            />
          </div>
          
          <div className="modal-actions">
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

const EditSupervisorModal = ({ supervisor, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: supervisor?.title || '',
    first_name: supervisor?.first_name || '',
    last_name: supervisor?.last_name || '',
    email: supervisor?.email || '',
    department: supervisor?.department || '',
    phone: supervisor?.phone || '',
    office_location: supervisor?.office_location || '',
    specialization: supervisor?.specialization || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await onSave(supervisor.id, formData);
      onClose();
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to update supervisor'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Supervisor</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title:</label>
            <select
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            >
              <option value="">Select Title</option>
              <option value="Dr">Dr</option>
              <option value="Prof">Prof</option>
              <option value="Mr">Mr</option>
              <option value="Ms">Ms</option>
              <option value="Mrs">Mrs</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
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
            <label>Department:</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              required
            >
              <option value="">Select Department</option>
              <option value="computer_science">Computer Science</option>
              <option value="engineering">Engineering</option>
              <option value="mathematics">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Phone:</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Office Location:</label>
            <input
              type="text"
              value={formData.office_location}
              onChange={(e) => setFormData({...formData, office_location: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Specialization:</label>
            <textarea
              value={formData.specialization}
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              rows="3"
            />
          </div>
          
          <div className="modal-actions">
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

const SupervisorDetailModal = ({ supervisor, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Supervisor Details</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="detail-content">
          <div className="detail-row">
            <label>Supervisor ID:</label>
            <span>{supervisor.supervisor_id}</span>
          </div>
          <div className="detail-row">
            <label>Name:</label>
            <span>{supervisor.supervisor_name}</span>
          </div>
          <div className="detail-row">
            <label>Email:</label>
            <span>{supervisor.email}</span>
          </div>
          <div className="detail-row">
            <label>Department:</label>
            <span>{supervisor.department}</span>
          </div>
          <div className="detail-row">
            <label>Supervisor Notes:</label>
            <span>{supervisor.supervisor_notes || 'No notes available'}</span>
          </div>
          <div className="detail-row">
            <label>Created Date:</label>
            <span>{new Date(supervisor.created_date).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// Registration Modal Components
const RegistrationModal = ({ registration, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    student_number: registration?.student_number || '',
    registration_status: registration?.registration_status || 'pending',
    original_registration_deadline: registration?.original_registration_deadline ? 
      registration.original_registration_deadline.split('T')[0] : 
      new Date().toISOString().split('T')[0],
    registration_extension_request_date: registration?.registration_extension_request_date ? 
      registration.registration_extension_request_date.split('T')[0] : '',
    date_of_registration_extension_approval: registration?.date_of_registration_extension_approval ? 
      registration.date_of_registration_extension_approval.split('T')[0] : '',
    registration_extension_length_days: registration?.registration_extension_length_days || 0,
    revised_registration_deadline: registration?.revised_registration_deadline ? 
      registration.revised_registration_deadline.split('T')[0] : '',
    date_pgr_moved_to_new_blackboard_group: registration?.date_pgr_moved_to_new_blackboard_group ? 
      registration.date_pgr_moved_to_new_blackboard_group.split('T')[0] : '',
    pgr_registration_process_completed: registration?.pgr_registration_process_completed || false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Clean up empty date fields
      const submitData = { ...formData };
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          if (key.includes('date') || key.includes('deadline')) {
            submitData[key] = null;
          }
        }
      });
      
      if (registration) {
        await onSave(registration.registration_id, submitData);
      } else {
        await onSave(submitData);
      }
      onClose();
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to save registration'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{registration ? 'Edit Registration' : 'Create New Registration'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
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
              disabled={!!registration} // Disable editing in edit mode
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
            <label>Date Moved to New Blackboard Group:</label>
            <input
              type="date"
              value={formData.date_pgr_moved_to_new_blackboard_group}
              onChange={(e) => setFormData({...formData, date_pgr_moved_to_new_blackboard_group: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.pgr_registration_process_completed}
                onChange={(e) => setFormData({...formData, pgr_registration_process_completed: e.target.checked})}
              />
              PGR Registration Process Completed
            </label>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (registration ? 'Update Registration' : 'Create Registration')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RegistrationDetailModal = ({ registration, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Registration Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="detail-content">
          <div className="detail-section">
            <h3>Basic Information</h3>
            <div className="detail-row">
              <label>Registration ID:</label>
              <span>{registration.registration_id}</span>
            </div>
            <div className="detail-row">
              <label>Student Number:</label>
              <span>{registration.student_number}</span>
            </div>
            <div className="detail-row">
              <label>Status:</label>
              <span className={`status ${registration.registration_status}`}>
                {registration.registration_status === 'extension_requested' ? 
                  '⏳ Extension Requested' : 
                  registration.registration_status === 'extension_approved' ?
                  '✅ Extension Approved' :
                  registration.registration_status.charAt(0).toUpperCase() + registration.registration_status.slice(1)
                }
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Timeline Information</h3>
            <div className="detail-row">
              <label>Original Deadline:</label>
              <span>{new Date(registration.original_registration_deadline).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <label>Extension Request Date:</label>
              <span>{registration.registration_extension_request_date ? 
                new Date(registration.registration_extension_request_date).toLocaleDateString() : 
                'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Extension Approval Date:</label>
              <span>{registration.date_of_registration_extension_approval ? 
                new Date(registration.date_of_registration_extension_approval).toLocaleDateString() : 
                'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Extension Length:</label>
              <span>{registration.registration_extension_length_days || 0} days</span>
            </div>
            <div className="detail-row">
              <label>Revised Deadline:</label>
              <span>{registration.revised_registration_deadline ? 
                new Date(registration.revised_registration_deadline).toLocaleDateString() : 
                'N/A'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Process Information</h3>
            <div className="detail-row">
              <label>Moved to New Blackboard Group:</label>
              <span>{registration.date_pgr_moved_to_new_blackboard_group ? 
                new Date(registration.date_pgr_moved_to_new_blackboard_group).toLocaleDateString() : 
                'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Process Completed:</label>
              <span className={`status ${registration.pgr_registration_process_completed ? 'completed' : 'pending'}`}>
                {registration.pgr_registration_process_completed ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="detail-row">
              <label>Created Date:</label>
              <span>{new Date(registration.created_date).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <label>Last Updated:</label>
              <span>{new Date(registration.updated_date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const ExtensionModal = ({ registration, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    extension_days: 30,
    reason: ''
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
      setError(extractErrorMessage(error, 'Failed to request extension'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request Registration Extension</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="detail-content">
          <div className="detail-row">
            <label>Student Number:</label>
            <span>{registration.student_number}</span>
          </div>
          <div className="detail-row">
            <label>Current Deadline:</label>
            <span>{new Date(registration.original_registration_deadline).toLocaleDateString()}</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Extension Length (Days):</label>
            <input
              type="number"
              value={formData.extension_days}
              onChange={(e) => setFormData({...formData, extension_days: parseInt(e.target.value) || 0})}
              min="1"
              max="365"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Reason for Extension:</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              placeholder="Please provide a detailed reason for the extension request..."
              rows="4"
              required
            />
          </div>
          
          <div className="modal-actions">
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

const ProfileModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || ''
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
      setError(extractErrorMessage(error, 'Failed to update profile'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Update Profile</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
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
            <label>Phone:</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
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
    
    try {
      setLoading(true);
      setError('');
      await onSave({
        current_password: formData.current_password,
        new_password: formData.new_password
      });
      onClose();
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to change password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Change Password</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
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
            />
          </div>
          
          <div className="form-group">
            <label>Confirm New Password:</label>
            <input
              type="password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
              required
            />
          </div>
          
          <div className="modal-actions">
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

// Assignment Modal Components
const AssignmentDetailModal = ({ assignment, onClose }) => {
  const [student, setStudent] = useState(null);
  const [supervisor, setSupervisor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [studentsData, supervisorsData] = await Promise.all([
          studentAPI.getAllStudents(0, 100),
          supervisorAPI.getAllSupervisors(0, 100)
        ]);
        
        const foundStudent = studentsData.find(s => s.student_number === assignment.student_number);
        const foundSupervisor = supervisorsData.find(s => s.supervisor_id === assignment.supervisor_id);
        
        setStudent(foundStudent);
        setSupervisor(foundSupervisor);
      } catch (error) {
        console.error('Error fetching assignment details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (assignment) {
      fetchDetails();
    }
  }, [assignment]);

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assignment Details</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="detail-content">
          <div className="detail-section">
            <h3>Assignment Information</h3>
            <div className="detail-row">
              <label>Assignment ID:</label>
              <span>{assignment.student_supervisor_id}</span>
            </div>
            <div className="detail-row">
              <label>Role:</label>
              <span>{assignment.role}</span>
            </div>
            <div className="detail-row">
              <label>Start Date:</label>
              <span>{new Date(assignment.start_date).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <label>End Date:</label>
              <span>{assignment.end_date ? new Date(assignment.end_date).toLocaleDateString() : 'Active'}</span>
            </div>
            <div className="detail-row">
              <label>Supervision Notes:</label>
              <span>{assignment.supervision_notes || 'No notes available'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Student Information</h3>
            <div className="detail-row">
              <label>Student Number:</label>
              <span>{assignment.student_number}</span>
            </div>
            {student && (
              <>
                <div className="detail-row">
                  <label>Name:</label>
                  <span>{student.forename} {student.surname}</span>
                </div>
                <div className="detail-row">
                  <label>Programme:</label>
                  <span>{student.programme_of_study}</span>
                </div>
                <div className="detail-row">
                  <label>Course Code:</label>
                  <span>{student.course_code}</span>
                </div>
              </>
            )}
          </div>

          <div className="detail-section">
            <h3>Supervisor Information</h3>
            <div className="detail-row">
              <label>Supervisor ID:</label>
              <span>{assignment.supervisor_id}</span>
            </div>
            {supervisor && (
              <>
                <div className="detail-row">
                  <label>Name:</label>
                  <span>{supervisor.supervisor_name}</span>
                </div>
                <div className="detail-row">
                  <label>Email:</label>
                  <span>{supervisor.email}</span>
                </div>
                <div className="detail-row">
                  <label>Department:</label>
                  <span>{supervisor.department}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
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
      
      if (assignment) {
        await onSave(assignment.student_supervisor_id, submitData);
      } else {
        await onSave(submitData);
      }
      onClose();
    } catch (error) {
      setError(extractErrorMessage(error, 'Failed to save assignment'));
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{assignment ? 'Edit Assignment' : 'Create New Assignment'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
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
                  {student.forename} {student.surname} ({student.student_number})
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
          
          <div className="modal-actions">
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

export default AcademicAdminDashboard;
