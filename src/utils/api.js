import axios from 'axios';

// Appraisal API functions
export const appraisalAPI = {
  getAllAppraisals: async (skip = 0, limit = 100, status = '', studentNumber = '') => {
    let url = `/api/v1/appraisals/?skip=${skip}&limit=${limit}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (studentNumber) url += `&student_number=${encodeURIComponent(studentNumber)}`;
    const response = await api.get(url);
    return response.data;
  },

  getAppraisalById: async (appraisalId) => {
    const response = await api.get(`/api/v1/appraisals/${appraisalId}`);
    return response.data;
  },

  getStudentAppraisals: async (studentNumber) => {
    const response = await api.get(`/api/v1/appraisals/student/${studentNumber}`);
    return response.data;
  },

  createAppraisal: async (appraisalData) => {
    const response = await api.post('/api/v1/appraisals/', appraisalData);
    return response.data;
  },

  submitStudentAppraisal: async (appraisalId, submissionData) => {
    const response = await api.put(`/api/v1/appraisals/${appraisalId}/student-submission`, submissionData);
    return response.data;
  },

  submitDosAppraisal: async (appraisalId, dosData) => {
    const response = await api.put(`/api/v1/appraisals/${appraisalId}/dos-submission`, dosData);
    return response.data;
  },

  reviewAppraisal: async (appraisalId, reviewData) => {
    const response = await api.put(`/api/v1/appraisals/${appraisalId}/review`, reviewData);
    return response.data;
  }
};

// Base API URL
//  const BASE_URL = 'https://edgebackend-hzf7ahdnf9bzbecm.uksouth-01.azurewebsites.net';
const BASE_URL = 'https://pgr-backend-c5enhsgthggxf8h6.uksouth-01.azurewebsites.net';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/api/v1/auth/token', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/api/v1/auth/me', userData);
    return response.data;
  },
  
  changePassword: async (passwordData) => {
    const response = await api.put('/api/v1/auth/change-password', passwordData);
    return response.data;
  }
};

// Admin API functions
export const adminAPI = {
  getAllUsers: async (skip = 0, limit = 100) => {
    const response = await api.get(`/api/v1/auth/admin/users?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  
  getUserById: async (userId) => {
    const response = await api.get(`/api/v1/auth/admin/users/${userId}`);
    return response.data;
  },
  
  updateUser: async (userId, userData) => {
    const response = await api.put(`/api/v1/auth/admin/users/${userId}`, userData);
    return response.data;
  },
  
  resetUserPassword: async (userId, newPassword) => {
    const response = await api.put(`/api/v1/auth/admin/users/${userId}/reset-password`, {
      new_password: newPassword
    });
    return response.data;
  }
};

// Student API functions
export const studentAPI = {
  getAllStudents: async (skip = 0, limit = 100, search = '', programme = '') => {
    let url = `/api/v1/students/?skip=${skip}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (programme) url += `&programme=${encodeURIComponent(programme)}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  getStudentByNumber: async (studentNumber) => {
    const response = await api.get(`/api/v1/students/${studentNumber}`);
    return response.data;
  },
  
  // Get current student (tries multiple strategies)
  getCurrentStudent: async (user) => {
    console.log('Attempting to find student for user:', user);
    
    // Strategy 0: Check if user object already has student_number
    if (user.student_number) {
      console.log('User object has student_number:', user.student_number);
      try {
        const response = await api.get(`/api/v1/students/${user.student_number}`);
        console.log('Strategy 0 SUCCESS - Found student:', response.data);
        return response.data;
      } catch (error) {
        console.log('Strategy 0 failed');
      }
    }
    
    // Strategy 1: Try if there's a /students/me endpoint
    try {
      console.log('Strategy 1: Trying /api/v1/students/me endpoint...');
      const response = await api.get('/api/v1/students/me');
      console.log('Strategy 1 SUCCESS - Found student via /me endpoint:', response.data);
      return response.data;
    } catch (error) {
      console.log('Strategy 1 failed - No /students/me endpoint');
    }
    
    // Strategy 2: Try username as student_number (most common case)
    try {
      console.log(`Strategy 2: Trying to get student by student_number: ${user.username}`);
      const response = await api.get(`/api/v1/students/${user.username}`);
      console.log('Strategy 2 SUCCESS - Found student:', response.data);
      return response.data;
    } catch (error) {
      console.log('Strategy 2 failed - Username is not student_number');
    }
    
    // Strategy 3 & 4: Fetch all students (may fail due to permissions)
    try {
      console.log('Strategy 3/4: Fetching all students to match by user_id or email...');
      const response = await api.get(`/api/v1/students/?skip=0&limit=1000`);
      const students = response.data;
      console.log(`Fetched ${students.length} students`);
      
      if (students.length === 0) {
        console.warn('⚠️ No students returned - likely a permissions issue. Student role cannot list all students.');
        throw new Error('Permission denied: Cannot list students. Backend needs to add student_number to /auth/me response or create /students/me endpoint.');
      }
      
      // Try to find by user_id
      console.log(`Looking for student with user_id: ${user.id}`);
      let student = students.find(s => s.user_id === user.id);
      if (student) {
        console.log('Strategy 3 SUCCESS - Found student by user_id:', student);
        return student;
      }
      console.log('No student found with user_id:', user.id);
      
      // Try to find by email
      console.log(`Looking for student with email: ${user.email}`);
      student = students.find(s => s.email && s.email.toLowerCase() === user.email.toLowerCase());
      if (student) {
        console.log('Strategy 4 SUCCESS - Found student by email:', student);
        return student;
      }
      console.log('No student found with email:', user.email);
      
    } catch (error) {
      if (error.message.includes('Permission denied')) {
        throw error;
      }
      console.error('Failed to fetch students list:', error);
    }
    
    throw new Error(`Unable to find student record. Please ask your backend developer to add "student_number" field to the /api/v1/auth/me endpoint response.`);
  },
  
  // Keep the old function for backwards compatibility
  getStudentByUserId: async (userId) => {
    const response = await api.get(`/api/v1/students/?skip=0&limit=1000`);
    const students = response.data;
    const student = students.find(s => s.user_id === userId);
    if (!student) {
      throw new Error(`No student found for user_id: ${userId}`);
    }
    return student;
  },
  
  createStudent: async (studentData) => {
    const { email, ...bodyData } = studentData;
    const response = await api.post(`/api/v1/students/?email=${encodeURIComponent(email)}`, bodyData);
    return response.data;
  },
  
  updateStudent: async (studentNumber, studentData) => {
    const response = await api.put(`/api/v1/students/${studentNumber}`, studentData);
    return response.data;
  },
  
  deleteStudent: async (studentNumber) => {
    const response = await api.delete(`/api/v1/students/${studentNumber}`);
    return response.data;
  },
  
  // Export the getStudentByUserId for external use
  getStudentByUserId: async (userId) => {
    const response = await api.get(`/api/v1/students/?skip=0&limit=1000`);
    const students = response.data;
    const student = students.find(s => s.user_id === userId);
    if (!student) {
      throw new Error(`No student found for user_id: ${userId}`);
    }
    return student;
  }
};

// Supervisor API functions
export const supervisorAPI = {
  getAllSupervisors: async (skip = 0, limit = 100, search = '', department = '') => {
    let url = `/api/v1/supervisors/?skip=${skip}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (department) url += `&department=${encodeURIComponent(department)}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  getSupervisorById: async (supervisorId) => {
    const response = await api.get(`/api/v1/supervisors/${supervisorId}`);
    return response.data;
  },
  
  createSupervisor: async (supervisorData) => {
    const response = await api.post('/api/v1/supervisors/', supervisorData);
    return response.data;
  },
  
  updateSupervisor: async (supervisorId, supervisorData) => {
    const response = await api.put(`/api/v1/supervisors/${supervisorId}`, supervisorData);
    return response.data;
  },
  
  deleteSupervisor: async (supervisorId) => {
    const response = await api.delete(`/api/v1/supervisors/${supervisorId}`);
    return response.data;
  },
  
  // Get current supervisor (tries multiple strategies)
  getCurrentSupervisor: async (user) => {
    // Strategy 1: Try to find by user_id
    try {
      const response = await api.get(`/api/v1/supervisors/?skip=0&limit=1000`);
      const supervisors = response.data;
      const supervisor = supervisors.find(s => s.user_id === user.id);
      if (supervisor) {
        return supervisor;
      }
    } catch (error) {
      console.error('Failed to fetch supervisors list:', error);
    }
    
    // Strategy 2: Try to find by email
    try {
      const response = await api.get(`/api/v1/supervisors/?skip=0&limit=1000`);
      const supervisors = response.data;
      const supervisor = supervisors.find(s => s.email === user.email);
      if (supervisor) {
        return supervisor;
      }
    } catch (error) {
      console.error('Failed to match by email:', error);
    }
    
    throw new Error('Unable to find supervisor record. Please contact administrator.');
  },
  
  // Keep the old function for backwards compatibility
  getSupervisorByUserId: async (userId) => {
    const response = await api.get(`/api/v1/supervisors/?skip=0&limit=1000`);
    const supervisors = response.data;
    const supervisor = supervisors.find(s => s.user_id === userId);
    if (!supervisor) {
      throw new Error(`No supervisor found for user_id: ${userId}`);
    }
    return supervisor;
  }
};

// Student-Supervisor Assignment API functions
export const assignmentAPI = {
  getAllAssignments: async (skip = 0, limit = 100) => {
    const response = await api.get(`/api/v1/student-supervisors/?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  
  getStudentSupervisors: async (studentNumber) => {
    const response = await api.get(`/api/v1/student-supervisors/student/${studentNumber}`);
    return response.data;
  },
  
  getSupervisorStudents: async (supervisorId) => {
    const response = await api.get(`/api/v1/student-supervisors/supervisor/${supervisorId}`);
    return response.data;
  },
  
  assignSupervisor: async (assignmentData) => {
    const response = await api.post('/api/v1/student-supervisors/assign', assignmentData);
    return response.data;
  },
  
  updateAssignment: async (assignmentId, assignmentData) => {
    const response = await api.put(`/api/v1/student-supervisors/${assignmentId}`, assignmentData);
    return response.data;
  },
  
  removeAssignment: async (assignmentId) => {
    const response = await api.delete(`/api/v1/student-supervisors/${assignmentId}`);
    return response.data;
  }
};

// Registration API functions
export const registrationAPI = {
  getAllRegistrations: async (skip = 0, limit = 100, studentNumber = '', status = '') => {
    let url = `/api/v1/registrations/?skip=${skip}&limit=${limit}`;
    if (studentNumber) url += `&student_number=${encodeURIComponent(studentNumber)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  getRegistrationById: async (registrationId) => {
    const response = await api.get(`/api/v1/registrations/${registrationId}`);
    return response.data;
  },
  
  getRegistrationByStudent: async (studentNumber) => {
    const response = await api.get(`/api/v1/registrations/student/${studentNumber}`);
    return response.data;
  },
  
  createRegistration: async (registrationData) => {
    const response = await api.post('/api/v1/registrations/', registrationData);
    return response.data;
  },
  
  updateRegistration: async (registrationId, registrationData) => {
    const response = await api.put(`/api/v1/registrations/${registrationId}`, registrationData);
    return response.data;
  },
  
  requestExtension: async (registrationId, extensionDays, reason) => {
    const response = await api.post(`/api/v1/registrations/${registrationId}/extension?extension_days=${extensionDays}&reason=${encodeURIComponent(reason)}`);
    return response.data;
  },
  
  approveExtension: async (registrationId) => {
    const response = await api.post(`/api/v1/registrations/${registrationId}/extension/approve`);
    return response.data;
  }
};

// Viva Team API functions
export const vivaTeamAPI = {
  getAll: async (params = {}) => {
    const { skip = 0, limit = 100, student_number = '', stage = '', status = '' } = params;
    let url = `/api/v1/viva-teams/?skip=${skip}&limit=${limit}`;
    if (student_number) url += `&student_number=${encodeURIComponent(student_number)}`;
    if (stage) url += `&stage=${encodeURIComponent(stage)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  getAllVivaTeams: async (skip = 0, limit = 100, studentNumber = '', stage = '', status = '') => {
    let url = `/api/v1/viva-teams/?skip=${skip}&limit=${limit}`;
    if (studentNumber) url += `&student_number=${encodeURIComponent(studentNumber)}`;
    if (stage) url += `&stage=${encodeURIComponent(stage)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  getVivaTeamById: async (vivaTeamId) => {
    const response = await api.get(`/api/v1/viva-teams/${vivaTeamId}`);
    return response.data;
  },
  
  createVivaTeam: async (vivaTeamData) => {
    const response = await api.post('/api/v1/viva-teams/', vivaTeamData);
    return response.data;
  },
  
  updateVivaTeam: async (vivaTeamId, vivaTeamData) => {
    const response = await api.put(`/api/v1/viva-teams/${vivaTeamId}`, vivaTeamData);
    return response.data;
  },
  
  approveVivaTeam: async (vivaTeamId) => {
    const response = await api.post(`/api/v1/viva-teams/${vivaTeamId}/approve`);
    return response.data;
  },
  
  rejectVivaTeam: async (vivaTeamId, reason) => {
    const response = await api.post(`/api/v1/viva-teams/${vivaTeamId}/reject?reason=${encodeURIComponent(reason)}`);
    return response.data;
  },
  
  scheduleViva: async (vivaTeamId, scheduledDate, location) => {
    const response = await api.post(`/api/v1/viva-teams/${vivaTeamId}/schedule?scheduled_date=${scheduledDate}&location=${encodeURIComponent(location)}`);
    return response.data;
  },
  
  submitVivaOutcome: async (vivaTeamId, outcome, outcomeNotes = '') => {
    let url = `/api/v1/viva-teams/${vivaTeamId}/outcome?outcome=${encodeURIComponent(outcome)}`;
    if (outcomeNotes) url += `&outcome_notes=${encodeURIComponent(outcomeNotes)}`;
    
    const response = await api.post(url);
    return response.data;
  }
};

// Submission API functions
export const submissionAPI = {
  createSubmission: async (submissionData) => {
    const response = await api.post('/api/v1/submissions/', submissionData);
    return response.data;
  },
  
  getSubmissions: async (studentNumber = null, submissionType = null, status = null) => {
    try {
      let url = '/api/v1/submissions/';
      const params = [];
      
      if (studentNumber) params.push(`student_number=${encodeURIComponent(studentNumber)}`);
      if (submissionType) params.push(`submission_type=${encodeURIComponent(submissionType)}`);
      if (status) params.push(`status=${encodeURIComponent(status)}`);
      
      if (params.length > 0) url += '?' + params.join('&');
      
      console.log('Fetching submissions from:', url);
      const response = await api.get(url);
      console.log('Submissions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  },
  
  getSubmissionById: async (submissionId) => {
    try {
      const url = `/api/v1/submissions/${submissionId}`;
      console.log('Fetching submission by ID from:', url);
      const response = await api.get(url);
      console.log('Submission by ID response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching submission ${submissionId}:`, error);
      throw error;
    }
  },
  
  updateSubmission: async (submissionId, submissionData) => {
    try {
      console.log(`Updating submission ${submissionId} with data:`, submissionData);
      const response = await api.put(`/api/v1/submissions/${submissionId}`, submissionData);
      console.log('Update submission response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating submission ${submissionId}:`, error);
      throw error;
    }
  },
  
  uploadFile: async (submissionId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log(`Uploading file for submission ${submissionId}`);
      const response = await api.post(`/api/v1/submissions/${submissionId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('File upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error uploading file for submission ${submissionId}:`, error);
      throw error;
    }
  },
  
  approveSubmission: async (submissionId) => {
    try {
      console.log(`Approving submission ${submissionId}`);
      const response = await api.post(`/api/v1/submissions/${submissionId}/approve`);
      console.log('Approve submission response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error approving submission ${submissionId}:`, error);
      throw error;
    }
  },
  
  rejectSubmission: async (submissionId, reason) => {
    try {
      console.log(`Rejecting submission ${submissionId} with reason:`, reason);
      const response = await api.post(`/api/v1/submissions/${submissionId}/reject?reason=${encodeURIComponent(reason)}`);
      console.log('Reject submission response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error rejecting submission ${submissionId}:`, error);
      throw error;
    }
  },
  
  reviewSubmission: async (submissionId, reviewData) => {
    try {
      console.log(`Reviewing submission ${submissionId} with data:`, reviewData);
      const response = await api.put(`/api/v1/submissions/${submissionId}/review`, reviewData);
      console.log('Review submission response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error reviewing submission ${submissionId}:`, error);
      throw error;
    }
  }
};

// Viva API functions
export const vivaAPI = {
  createViva: async (vivaData) => {
    try {
      console.log('Creating viva with data:', vivaData);
      const response = await api.post('/api/v1/vivas/', vivaData);
      console.log('Create viva response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating viva:', error);
      throw error;
    }
  },

  getAllVivas: async (skip = 0, limit = 100, studentNumber = '', stage = '') => {
    try {
      let url = `/api/v1/vivas/?skip=${skip}&limit=${limit}`;
      if (studentNumber) url += `&student_number=${encodeURIComponent(studentNumber)}`;
      if (stage) url += `&stage=${encodeURIComponent(stage)}`;
      console.log('Fetching vivas with URL:', url);
      const response = await api.get(url);
      console.log('Fetched vivas:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching vivas:', error);
      throw error;
    }
  },

  getVivaById: async (vivaId) => {
    try {
      console.log(`Fetching viva with ID ${vivaId}`);
      const response = await api.get(`/api/v1/vivas/${vivaId}`);
      console.log('Fetched viva:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching viva ${vivaId}:`, error);
      throw error;
    }
  },

  updateViva: async (vivaId, vivaData) => {
    try {
      console.log(`Updating viva ${vivaId} with data:`, vivaData);
      const response = await api.put(`/api/v1/vivas/${vivaId}`, vivaData);
      console.log('Update viva response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating viva ${vivaId}:`, error);
      throw error;
    }
  },

  getStudentVivas: async (studentNumber) => {
    try {
      console.log(`Fetching vivas for student ${studentNumber}`);
      const response = await api.get(`/api/v1/vivas/student/${studentNumber}`);
      console.log('Fetched student vivas:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching student vivas for ${studentNumber}:`, error);
      throw error;
    }
  },

  createVivaOutcome: async (vivaId, outcomeData) => {
    try {
      console.log(`Creating outcome for viva ${vivaId} with data:`, outcomeData);
      const response = await api.post(`/api/v1/vivas/${vivaId}/outcomes`, outcomeData);
      console.log('Create viva outcome response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error creating outcome for viva ${vivaId}:`, error);
      throw error;
    }
  },

  getVivaOutcomes: async (vivaId) => {
    try {
      console.log(`Fetching outcomes for viva ${vivaId}`);
      const response = await api.get(`/api/v1/vivas/${vivaId}/outcomes`);
      console.log('Fetched viva outcomes:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching outcomes for viva ${vivaId}:`, error);
      throw error;
    }
  },

  updateVivaOutcome: async (outcomeId, outcomeData) => {
    try {
      console.log(`Updating outcome ${outcomeId} with data:`, outcomeData);
      const response = await api.put(`/api/v1/vivas/outcomes/${outcomeId}`, outcomeData);
      console.log('Update viva outcome response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating outcome ${outcomeId}:`, error);
      throw error;
    }
  },

  confirmViva: async (vivaId) => {
    try {
      console.log(`Confirming viva ${vivaId}`);
      const response = await api.post(`/api/v1/vivas/${vivaId}/confirm`);
      console.log('Confirm viva response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error confirming viva ${vivaId}:`, error);
      throw error;
    }
  },

  completeVivaOrganization: async (vivaId) => {
    try {
      console.log(`Completing organization for viva ${vivaId}`);
      const response = await api.post(`/api/v1/vivas/${vivaId}/complete-organization`);
      console.log('Complete viva organization response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error completing organization for viva ${vivaId}:`, error);
      throw error;
    }
  }
};

export default api;
