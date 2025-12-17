import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentAPI, submissionAPI, vivaTeamAPI, assignmentAPI } from '../utils/api';
import '../styles/shared-dashboard.css';
import logo from '../image/logo.png';

// Utility function to extract error messages safely
const extractErrorMessage = (error, defaultMessage) => {
  if (error.response?.data?.detail) {
    if (Array.isArray(error.response.data.detail)) {
      return error.response.data.detail.map(err => err.msg).join(', ');
    } else if (typeof error.response.data.detail === 'string') {
      return error.response.data.detail;
    } else if (typeof error.response.data.detail === 'object') {
      return JSON.stringify(error.response.data.detail);
    }
  } else if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  }
  return defaultMessage;
};

const SupervisorDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Student management state
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [programmeFilter, setProgrammeFilter] = useState('');

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

  // Viva Team management state
  const [vivaTeams, setVivaTeams] = useState([]);
  const [vivaTeamsLoading, setVivaTeamsLoading] = useState(false);
  const [vivaTeamsError, setVivaTeamsError] = useState('');
  const [selectedVivaTeam, setSelectedVivaTeam] = useState(null);
  const [showVivaTeamDetailModal, setShowVivaTeamDetailModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [vivaTeamSearch, setVivaTeamSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [vivaTeamStatusFilter, setVivaTeamStatusFilter] = useState('');
  
  // Dropdown for actions
  const [openDropdown, setOpenDropdown] = useState(null);

  // Dashboard stats state
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeSubmissions: 0,
    pendingVivaTeams: 0,
    approvedVivaTeams: 0
  });

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', iconClass: 'fas fa-chart-pie' },
    { id: 'students', label: 'My Students', icon: '🎓', iconClass: 'fas fa-user-graduate' },
    { id: 'submissions', label: 'Submissions', icon: '📄', iconClass: 'fas fa-file-upload' },
    { id: 'viva-teams', label: 'Viva Teams', icon: '🎯', iconClass: 'fas fa-bullseye' },
  ];

  useEffect(() => {
    if (!user) return; // Wait for user to be loaded
    
    if (activeSection === 'dashboard') {
      fetchDashboardData();
    } else if (activeSection === 'students') {
      fetchStudents();
    } else if (activeSection === 'submissions') {
      fetchSubmissions();
    } else if (activeSection === 'viva-teams') {
      fetchVivaTeams();
    }
  }, [activeSection, user]);

  // Fetch functions
  const fetchStudents = async () => {
    setStudentsLoading(true);
    setStudentsError('');
    try {
      if (!user || !user.id) {
        throw new Error('User ID not available');
      }
      
      // First, get the supervisor record to find supervisor_id
      const supervisorData = await studentAPI.getSupervisorByUserId(user.id);
      const supervisorId = supervisorData.supervisor_id;
      
      // Get assigned students for this supervisor
      const assignments = await assignmentAPI.getSupervisorStudents(supervisorId);
      
      if (!assignments || assignments.length === 0) {
        setStudents([]);
        return;
      }
      
      // Fetch full student details for each assignment
      const studentsWithDetails = await Promise.all(
        assignments.map(async (assignment) => {
          try {
            const studentDetails = await studentAPI.getStudentByNumber(assignment.student_number);
            return {
              ...studentDetails,
              // Add assignment details
              supervisor_role: assignment.role,
              supervision_start_date: assignment.start_date,
              supervision_end_date: assignment.end_date,
              supervision_notes: assignment.supervision_notes,
              student_supervisor_id: assignment.student_supervisor_id
            };
          } catch (error) {
            console.error(`Error fetching details for student ${assignment.student_number}:`, error);
            // Return basic info if full details can't be fetched
            return {
              student_number: assignment.student_number,
              forename: 'Unknown',
              surname: 'Student',
              programme_of_study: 'N/A',
              mode: 'N/A',
              cohort: 'N/A',
              supervisor_role: assignment.role,
              supervision_start_date: assignment.start_date,
              supervision_end_date: assignment.end_date,
              supervision_notes: assignment.supervision_notes,
              student_supervisor_id: assignment.student_supervisor_id
            };
          }
        })
      );
      
      setStudents(studentsWithDetails);
    } catch (error) {
      console.error('Error fetching assigned students:', error);
      setStudentsError(extractErrorMessage(error, 'Failed to fetch assigned students'));
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    setSubmissionsError('');
    try {
      const response = await submissionAPI.getSubmissions(
        submissionSearchTerm || null,
        submissionTypeFilter || null, 
        submissionStatusFilter || null
      );
      setSubmissions(response || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissionsError(extractErrorMessage(error, 'Failed to fetch submissions'));
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const fetchVivaTeams = async () => {
    setVivaTeamsLoading(true);
    setVivaTeamsError('');
    try {
      const response = await vivaTeamAPI.getAllVivaTeams(0, 100, vivaTeamSearch, stageFilter, vivaTeamStatusFilter);
      setVivaTeams(response || []);
    } catch (error) {
      console.error('Error fetching viva teams:', error);
      setVivaTeamsError(extractErrorMessage(error, 'Failed to fetch viva teams'));
    } finally {
      setVivaTeamsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      if (!user || !user.id) {
        console.error('User ID not available for dashboard data');
        return;
      }
      
      // First, get the supervisor record to find supervisor_id
      const supervisorData = await studentAPI.getCurrentSupervisor(user);
      const supervisorId = supervisorData.supervisor_id;
      
      const [assignedStudentsResponse, submissionsResponse, vivaTeamsResponse] = await Promise.all([
        assignmentAPI.getSupervisorStudents(supervisorId),
        submissionAPI.getSubmissions(),
        vivaTeamAPI.getAllVivaTeams(0, 100)
      ]);

      // Filter submissions and viva teams for supervisor's students
      const supervisorStudentNumbers = assignedStudentsResponse?.map(assignment => assignment.student_number) || [];
      const supervisorSubmissions = submissionsResponse?.filter(s => 
        supervisorStudentNumbers.includes(s.student_number)
      ) || [];
      const supervisorVivaTeams = vivaTeamsResponse?.filter(vt => 
        supervisorStudentNumbers.includes(vt.student_number)
      ) || [];

      setStats({
        totalStudents: assignedStudentsResponse?.length || 0,
        activeSubmissions: supervisorSubmissions?.filter(s => s.status === 'submitted')?.length || 0,
        pendingVivaTeams: supervisorVivaTeams?.filter(vt => vt.status === 'proposed')?.length || 0,
        approvedVivaTeams: supervisorVivaTeams?.filter(vt => vt.status === 'approved')?.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Student functions
  const handleViewStudent = async (studentNumber) => {
    try {
      const response = await studentAPI.getStudentByNumber(studentNumber);
      setSelectedStudent(response);
      setShowStudentDetailModal(true);
    } catch (error) {
      console.error('Error fetching student details:', error);
      alert('Failed to fetch student details');
    }
  };

  // Submission functions
  const handleViewSubmission = async (submissionId) => {
    try {
      const response = await submissionAPI.getSubmissionById(submissionId);
      setSelectedSubmission(response);
      setShowSubmissionDetailModal(true);
    } catch (error) {
      console.error('Error fetching submission details:', error);
      alert('Failed to fetch submission details');
    }
  };

  const handleReviewSubmission = async (submissionId, reviewData) => {
    try {
      await submissionAPI.reviewSubmission(submissionId, reviewData);
      setShowSubmissionReviewModal(false);
      await fetchSubmissions();
      alert('Submission reviewed successfully');
    } catch (error) {
      console.error('Error reviewing submission:', error);
      alert(extractErrorMessage(error, 'Failed to review submission'));
    }
  };

  const handleApproveSubmission = async (submissionId) => {
    try {
      await submissionAPI.approveSubmission(submissionId);
      await fetchSubmissions();
      alert('Submission approved successfully');
    } catch (error) {
      console.error('Error approving submission:', error);
      alert(extractErrorMessage(error, 'Failed to approve submission'));
    }
  };

  const handleRejectSubmission = async (submissionId, rejectionData) => {
    try {
      await submissionAPI.rejectSubmission(submissionId, rejectionData.reason);
      setShowSubmissionRejectModal(false);
      await fetchSubmissions();
      alert('Submission rejected successfully');
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert(extractErrorMessage(error, 'Failed to reject submission'));
    }
  };

  // Viva Team functions
  const handleViewVivaTeam = async (vivaTeamId) => {
    try {
      const response = await vivaTeamAPI.getVivaTeamById(vivaTeamId);
      setSelectedVivaTeam(response);
      setShowVivaTeamDetailModal(true);
    } catch (error) {
      console.error('Error fetching viva team details:', error);
      alert('Failed to fetch viva team details');
    }
  };

  const handleScheduleViva = async (vivaTeamId, scheduledDate, location) => {
    try {
      await vivaTeamAPI.scheduleViva(vivaTeamId, scheduledDate, location);
      setShowScheduleModal(false);
      await fetchVivaTeams();
      alert('Viva scheduled successfully');
    } catch (error) {
      console.error('Error scheduling viva:', error);
      alert(extractErrorMessage(error, 'Failed to schedule viva'));
    }
  };

  const handleSubmitVivaOutcome = async (vivaTeamId, outcome, outcomeNotes) => {
    try {
      await vivaTeamAPI.submitVivaOutcome(vivaTeamId, outcome, outcomeNotes);
      setShowOutcomeModal(false);
      await fetchVivaTeams();
      alert('Viva outcome submitted successfully');
    } catch (error) {
      console.error('Error submitting viva outcome:', error);
      alert(extractErrorMessage(error, 'Failed to submit viva outcome'));
    }
  };

  // Render functions
  const renderDashboard = () => (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Supervisor Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.full_name || user?.username}</p>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-value">{stats.totalStudents}</div>
          <div className="stats-label">Total Students</div>
        </div>
        <div className="stats-card">
          <div className="stats-value">{stats.activeSubmissions}</div>
          <div className="stats-label">Active Submissions</div>
        </div>
        <div className="stats-card">
          <div className="stats-value">{stats.pendingVivaTeams}</div>
          <div className="stats-label">Pending Viva Teams</div>
        </div>
        <div className="stats-card">
          <div className="stats-value">{stats.approvedVivaTeams}</div>
          <div className="stats-label">Approved Viva Teams</div>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-4">
            <button 
              className="btn primary"
              onClick={() => setActiveSection('students')}
            >
              View My Students
            </button>
            <button 
              className="btn secondary"
              onClick={() => setActiveSection('submissions')}
            >
              Review Submissions
            </button>
            <button 
              className="btn secondary"
              onClick={() => setActiveSection('viva-teams')}
            >
              Manage Viva Teams
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">My Students</h1>
        <p className="page-subtitle">Manage and view your supervised students</p>
      </div>

      <div className="search-filter-section">
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search students..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </div>
          <div className="form-group">
            <select
              className="form-select filter-select"
              value={programmeFilter}
              onChange={(e) => setProgrammeFilter(e.target.value)}
            >
              <option value="">All Programmes</option>
              <option value="PhD">PhD</option>
              <option value="MRes">MRes</option>
              <option value="MPhil">MPhil</option>
            </select>
          </div>
          <button className="btn primary" onClick={fetchStudents}>
            Search
          </button>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Students ({students.length})</h2>
        </div>
        <div className="card-body">
          {studentsLoading ? (
            <div className="loading-spinner">Loading students...</div>
          ) : studentsError ? (
            <div className="alert error">{studentsError}</div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎓</div>
              <div className="empty-state-title">No Assigned Students Found</div>
              <div className="empty-state-description">
                {studentSearch || programmeFilter 
                  ? "No assigned students match your current search criteria."
                  : "You don't have any students assigned to you yet."
                }
              </div>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Student Number</th>
                    <th>Name</th>
                    <th>Programme</th>
                    <th>Mode</th>
                    <th>Cohort</th>
                    <th>Supervisor Role</th>
                    <th>Start Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students
                    .filter(student => {
                      const searchLower = studentSearch.toLowerCase();
                      const matchesSearch = !studentSearch || 
                        student.student_number.toLowerCase().includes(searchLower) ||
                        `${student.forename} ${student.surname}`.toLowerCase().includes(searchLower) ||
                        (student.programme_of_study && student.programme_of_study.toLowerCase().includes(searchLower));
                      
                      const matchesProgramme = !programmeFilter || 
                        (student.programme_of_study && student.programme_of_study.toLowerCase().includes(programmeFilter.toLowerCase()));
                      
                      return matchesSearch && matchesProgramme;
                    })
                    .map((student) => (
                    <tr key={student.student_number}>
                      <td className="id-cell">{student.student_number}</td>
                      <td>{student.forename} {student.surname}</td>
                      <td>{student.programme_of_study}</td>
                      <td>{student.mode}</td>
                      <td>{student.cohort}</td>
                      <td>{student.supervisor_role || 'N/A'}</td>
                      <td>{student.supervision_start_date ? new Date(student.supervision_start_date).toLocaleDateString() : 'N/A'}</td>
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
                                className="dropdown-btn primary btn-sm"
                                title="View Student Details"
                              >
                                View
                              </button>
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
        </div>
      </div>
    </div>
  );

  const renderSubmissions = () => (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Submissions</h1>
        <p className="page-subtitle">Review and manage student submissions</p>
      </div>

      <div className="search-filter-section">
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search by student number..."
              value={submissionSearchTerm}
              onChange={(e) => setSubmissionSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group">
            <select
              className="form-select filter-select"
              value={submissionTypeFilter}
              onChange={(e) => setSubmissionTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="registration">Registration</option>
              <option value="thesis">Thesis</option>
              <option value="proposal">Proposal</option>
            </select>
          </div>
          <div className="form-group">
            <select
              className="form-select filter-select"
              value={submissionStatusFilter}
              onChange={(e) => setSubmissionStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button className="btn primary" onClick={fetchSubmissions}>
            Search
          </button>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Submissions ({submissions.length})</h2>
        </div>
        <div className="card-body">
          {submissionsLoading ? (
            <div className="loading-spinner">Loading submissions...</div>
          ) : submissionsError ? (
            <div className="alert error">{submissionsError}</div>
          ) : submissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <div className="empty-state-title">No Submissions Found</div>
              <div className="empty-state-description">
                No submissions match your current search criteria.
              </div>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Submission Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td className="id-cell">{submission.id}</td>
                      <td>{submission.student_number}</td>
                      <td>
                        <span className="status-badge secondary">
                          {submission.submission_type}
                        </span>
                      </td>
                      <td className="text-wrap">{submission.title}</td>
                      <td>
                        <span className={`status-badge ${submission.status}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td className="date-cell">
                        {submission.submission_date ? 
                          new Date(submission.submission_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <div className="action-dropdown-wrapper">
                          <button
                            className="hamburger-btn"
                            onClick={() => setOpenDropdown(openDropdown === submission.id ? null : submission.id)}
                            title="Actions"
                          >
                            <span className="hamburger-icon">&#9776;</span>
                          </button>
                          {openDropdown === submission.id && (
                            <div className="action-dropdown-row">
                              <button
                                onClick={() => {
                                  handleViewSubmission(submission.id);
                                  setOpenDropdown(null);
                                }}
                                className="dropdown-btn primary btn-sm"
                                title="View Submission Details"
                              >
                                View
                              </button>
                              {submission.status === 'submitted' && (
                                <>
                                  <button
                                    onClick={() => {
                                      handleApproveSubmission(submission.id);
                                      setOpenDropdown(null);
                                    }}
                                    className="dropdown-btn success btn-sm"
                                    title="Approve Submission"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedSubmission(submission);
                                      setShowSubmissionRejectModal(true);
                                      setOpenDropdown(null);
                                    }}
                                    className="dropdown-btn danger btn-sm"
                                    title="Reject Submission"
                                  >
                                    Reject
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
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVivaTeams = () => (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Viva Teams</h1>
        <p className="page-subtitle">Manage viva examinations and teams</p>
      </div>

      <div className="search-filter-section">
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search by student number..."
              value={vivaTeamSearch}
              onChange={(e) => setVivaTeamSearch(e.target.value)}
            />
          </div>
          <div className="form-group">
            <select
              className="form-select filter-select"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option value="">All Stages</option>
              <option value="registration">Registration</option>
              <option value="confirmation">Confirmation</option>
              <option value="final">Final</option>
            </select>
          </div>
          <div className="form-group">
            <select
              className="form-select filter-select"
              value={vivaTeamStatusFilter}
              onChange={(e) => setVivaTeamStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="proposed">Proposed</option>
              <option value="approved">Approved</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button className="btn primary" onClick={fetchVivaTeams}>
            Search
          </button>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h2 className="card-title">Viva Teams ({vivaTeams.length})</h2>
        </div>
        <div className="card-body">
          {vivaTeamsLoading ? (
            <div className="loading-spinner">Loading viva teams...</div>
          ) : vivaTeamsError ? (
            <div className="alert error">{vivaTeamsError}</div>
          ) : vivaTeams.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎯</div>
              <div className="empty-state-title">No Viva Teams Found</div>
              <div className="empty-state-description">
                No viva teams match your current search criteria.
              </div>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student</th>
                    <th>Stage</th>
                    <th>Status</th>
                    <th>Proposed Date</th>
                    <th>Scheduled Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vivaTeams.map((vivaTeam) => (
                    <tr key={vivaTeam.id}>
                      <td className="id-cell">{vivaTeam.id}</td>
                      <td>{vivaTeam.student_number}</td>
                      <td>
                        <span className="status-badge secondary">
                          {vivaTeam.stage}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${vivaTeam.status}`}>
                          {vivaTeam.status}
                        </span>
                      </td>
                      <td className="date-cell">
                        {vivaTeam.proposed_date ? 
                          new Date(vivaTeam.proposed_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="date-cell">
                        {vivaTeam.scheduled_date ? 
                          new Date(vivaTeam.scheduled_date).toLocaleDateString() : 'N/A'}
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
                                  handleViewVivaTeam(vivaTeam.id);
                                  setOpenDropdown(null);
                                }}
                                className="dropdown-btn primary btn-sm"
                                title="View Viva Team Details"
                              >
                                View
                              </button>
                              {vivaTeam.status === 'approved' && !vivaTeam.scheduled_date && (
                                <button
                                  onClick={() => {
                                    setSelectedVivaTeam(vivaTeam);
                                    setShowScheduleModal(true);
                                    setOpenDropdown(null);
                                  }}
                                  className="dropdown-btn secondary btn-sm"
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
                                  title="Submit Outcome"
                                >
                                  Submit Outcome
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
      case 'submissions':
        return renderSubmissions();
      case 'viva-teams':
        return renderVivaTeams();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-section">
            <img 
              src={logo} 
              alt="PGR Management System" 
              className="sidebar-logo" 
            />
            {!sidebarCollapsed && (
              <div className="sidebar-branding">
                <h3>PGR Management</h3>
                <p>Supervisor Portal</p>
              </div>
            )}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <i className={`fas ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <div key={item.id} className="nav-item">
              <button
                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection(item.id);
                  setMobileSidebarOpen(false);
                }}
              >
                <i className={item.iconClass}></i>
                {!sidebarCollapsed && <span className="nav-text">{item.label}</span>}
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
            <div className="user-avatar">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!sidebarCollapsed && (
              <>
                <div className="user-info">
                  <div className="user-name">{user?.full_name || user?.username}</div>
                  <div className="user-role">Supervisor</div>
                </div>
                <button className="user-menu-toggle">
                  <i className={`fas ${userDropdownOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                </button>
              </>
            )}
          </div>
          
          {userDropdownOpen && !sidebarCollapsed && (
            <div className="user-dropdown show">
              <button className="dropdown-item" onClick={logout}>
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`dashboard-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="main-header">
          <button
            className="mobile-hamburger"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          <div className="header-title">
            <h1>Supervisor Dashboard</h1>
          </div>
        </header>

        {renderContent()}
      </main>

      {/* Modals */}
      {showStudentDetailModal && selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => {
            setShowStudentDetailModal(false);
            setSelectedStudent(null);
          }}
        />
      )}

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
    </div>
  );
};

// Modal Components
const StudentDetailModal = ({ student, onClose }) => {
  return (
    <div className="modal-overlay show">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Student Details</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="info-rows-container">
            <div className="info-row">
              <strong className="info-label">Student Number:</strong>
              <span className="info-value">{student.student_number}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">Name:</strong>
              <span className="info-value">{student.forename} {student.surname}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">Programme:</strong>
              <span className="info-value">{student.programme_of_study}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">Mode:</strong>
              <span className="info-value">{student.mode}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">Cohort:</strong>
              <span className="info-value">{student.cohort}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">Course Code:</strong>
              <span className="info-value">{student.course_code}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">Subject Area:</strong>
              <span className="info-value">{student.subject_area}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">International Student:</strong>
              <span className="info-value">{student.international_student ? 'Yes' : 'No'}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">Previous EHU Student:</strong>
              <span className="info-value">{student.previous_ehu_student ? 'Yes' : 'No'}</span>
            </div>
            {student.student_notes && (
              <div className="info-row">
                <strong className="info-label">Notes:</strong>
                <span className="info-value">{student.student_notes}</span>
              </div>
            )}
            
            {/* Supervision Information */}
            <div className="info-section-header">
              <h3>Supervision Details</h3>
            </div>
            <div className="info-row">
              <strong className="info-label">Supervisor Role:</strong>
              <span className="info-value">{student.supervisor_role || 'N/A'}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">Supervision Start Date:</strong>
              <span className="info-value">
                {student.supervision_start_date ? new Date(student.supervision_start_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            {student.supervision_end_date && (
              <div className="info-row">
                <strong className="info-label">Supervision End Date:</strong>
                <span className="info-value">
                  {new Date(student.supervision_end_date).toLocaleDateString()}
                </span>
              </div>
            )}
            {student.supervision_notes && (
              <div className="info-row">
                <strong className="info-label">Supervision Notes:</strong>
                <span className="info-value">{student.supervision_notes}</span>
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

const SubmissionDetailModal = ({ submission, onClose }) => {
  return (
    <div className="modal-overlay show">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Submission Details</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="info-rows-container">
            <div className="info-row">
              <strong className="info-label">ID:</strong>
              <span className="info-value">{submission.id}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">Student Number:</strong>
              <span className="info-value">{submission.student_number}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">Type:</strong>
              <span className="info-value">{submission.submission_type}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">Title:</strong>
              <span className="info-value">{submission.title}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">Status:</strong>
              <span className={`info-value status-badge ${submission.status}`}>
                {submission.status}
              </span>
            </div>
            <div className="info-row">
              <strong className="info-label">Description:</strong>
              <span className="info-value">{submission.description}</span>
            </div>
            {submission.file_name && (
              <div className="info-row">
                <strong className="info-label">File:</strong>
                <span className="info-value">{submission.file_name}</span>
              </div>
            )}
            {submission.submission_date && (
              <div className="info-row">
                <strong className="info-label">Submission Date:</strong>
                <span className="info-value">
                  {new Date(submission.submission_date).toLocaleString()}
                </span>
              </div>
            )}
            {submission.review_comments && (
              <div className="info-row">
                <strong className="info-label">Review Comments:</strong>
                <span className="info-value">{submission.review_comments}</span>
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
  const [reviewData, setReviewData] = useState({
    review_comments: '',
    status: 'reviewed'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(submission.id, reviewData);
  };

  return (
    <div className="modal-overlay show">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Review Submission</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Review Comments *</label>
              <textarea
                className="form-textarea"
                value={reviewData.review_comments}
                onChange={(e) => setReviewData({...reviewData, review_comments: e.target.value})}
                required
                rows="4"
                placeholder="Enter your review comments..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={reviewData.status}
                onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
              >
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubmissionRejectModal = ({ submission, onClose, onSave }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onSave(submission.id, { reason });
  };

  return (
    <div className="modal-overlay show">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Reject Submission</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="alert warning">
              <strong>Warning:</strong> You are about to reject this submission. This action cannot be undone.
            </div>
            <div className="form-group">
              <label className="form-label">Reason for Rejection *</label>
              <textarea
                className="form-textarea"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows="4"
                placeholder="Please provide a detailed reason for rejecting this submission..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn danger">
              Reject Submission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const VivaTeamDetailModal = ({ vivaTeam, onClose }) => {
  return (
    <div className="modal-overlay show">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Viva Team Details</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <div className="info-rows-container">
            <div className="info-row">
              <strong className="info-label">ID:</strong>
              <span className="info-value">{vivaTeam.id}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">Student Number:</strong>
              <span className="info-value">{vivaTeam.student_number}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">Stage:</strong>
              <span className="info-value">{vivaTeam.stage}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">Status:</strong>
              <span className={`info-value status-badge ${vivaTeam.status}`}>
                {vivaTeam.status}
              </span>
            </div>
            <div className="info-row">
              <strong className="info-label">External Examiner:</strong>
              <span className="info-value">{vivaTeam.external_examiner_name}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">External Examiner Email:</strong>
              <span className="info-value">{vivaTeam.external_examiner_email}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">External Examiner Institution:</strong>
              <span className="info-value">{vivaTeam.external_examiner_institution}</span>
            </div>
            <div className="info-row">
              <strong className="info-label">Proposed Date:</strong>
              <span className="info-value">
                {vivaTeam.proposed_date ? new Date(vivaTeam.proposed_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            {vivaTeam.scheduled_date && (
              <div className="info-row">
                <strong className="info-label">Scheduled Date:</strong>
                <span className="info-value">
                  {new Date(vivaTeam.scheduled_date).toLocaleDateString()}
                </span>
              </div>
            )}
            {vivaTeam.location && (
              <div className="info-row">
                <strong className="info-label">Location:</strong>
                <span className="info-value">{vivaTeam.location}</span>
              </div>
            )}
            {vivaTeam.outcome && (
              <div className="info-row">
                <strong className="info-label">Outcome:</strong>
                <span className="info-value">{vivaTeam.outcome}</span>
              </div>
            )}
            {vivaTeam.outcome_notes && (
              <div className="info-row">
                <strong className="info-label">Outcome Notes:</strong>
                <span className="info-value">{vivaTeam.outcome_notes}</span>
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

const VivaScheduleModal = ({ vivaTeam, onClose, onSave }) => {
  const [scheduleData, setScheduleData] = useState({
    scheduled_date: '',
    location: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!scheduleData.scheduled_date || !scheduleData.location) {
      alert('Please fill in all required fields');
      return;
    }
    onSave(vivaTeam.id, scheduleData.scheduled_date, scheduleData.location);
  };

  return (
    <div className="modal-overlay show">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Schedule Viva</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Scheduled Date *</label>
              <input
                type="date"
                className="form-input"
                value={scheduleData.scheduled_date}
                onChange={(e) => setScheduleData({...scheduleData, scheduled_date: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                type="text"
                className="form-input"
                value={scheduleData.location}
                onChange={(e) => setScheduleData({...scheduleData, location: e.target.value})}
                required
                placeholder="Enter viva location..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Schedule Viva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const VivaOutcomeModal = ({ vivaTeam, onClose, onSave }) => {
  const [outcomeData, setOutcomeData] = useState({
    outcome: '',
    outcome_notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!outcomeData.outcome) {
      alert('Please select an outcome');
      return;
    }
    onSave(vivaTeam.id, outcomeData.outcome, outcomeData.outcome_notes);
  };

  return (
    <div className="modal-overlay show">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Submit Viva Outcome</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Outcome *</label>
              <select
                className="form-select"
                value={outcomeData.outcome}
                onChange={(e) => setOutcomeData({...outcomeData, outcome: e.target.value})}
                required
              >
                <option value="">Select outcome...</option>
                <option value="pass">Pass</option>
                <option value="pass_with_minor_corrections">Pass with Minor Corrections</option>
                <option value="pass_with_major_corrections">Pass with Major Corrections</option>
                <option value="fail">Fail</option>
                <option value="resubmit">Resubmit</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Outcome Notes</label>
              <textarea
                className="form-textarea"
                value={outcomeData.outcome_notes}
                onChange={(e) => setOutcomeData({...outcomeData, outcome_notes: e.target.value})}
                rows="4"
                placeholder="Enter any additional notes about the outcome..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              Submit Outcome
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// Change Password Modal Component
const ChangePasswordModal = ({ show, onClose, onSubmit, formData, setFormData, loading, error, success }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Change Password</h3>
          <button className="modal-close" onClick={onClose}>�</button>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>
                {error}
              </div>
            )}
            
            {success && (
              <div className="alert alert-success" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#efe', color: '#3c3', borderRadius: '4px' }}>
                {success}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Current Password:</label>
              <input
                type="password"
                className="form-input"
                value={formData.current_password}
                onChange={(e) => setFormData({...formData, current_password: e.target.value})}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password:</label>
              <input
                type="password"
                className="form-input"
                value={formData.new_password}
                onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                required
                disabled={loading}
                minLength="6"
              />
              <small style={{ color: '#666', fontSize: '0.85rem' }}>Minimum 6 characters</small>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password:</label>
              <input
                type="password"
                className="form-input"
                value={formData.confirm_password}
                onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                required
                disabled={loading}
                minLength="6"
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupervisorDashboard;