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
const BASE_URL = 'https://edgebackend-hzf7ahdnf9bzbecm.uksouth-01.azurewebsites.net';

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
  
  createStudent: async (studentData) => {
    const response = await api.post('/api/v1/students/', studentData);
    return response.data;
  },
  
  updateStudent: async (studentNumber, studentData) => {
    const response = await api.put(`/api/v1/students/${studentNumber}`, studentData);
    return response.data;
  },
  
  deleteStudent: async (studentNumber) => {
    const response = await api.delete(`/api/v1/students/${studentNumber}`);
    return response.data;
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

export default api;
