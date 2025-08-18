import { api } from './api';

// Student API endpoints
export const studentAPI = {
  // Get student by student number
  getStudentByNumber: async (studentNumber) => {
    const response = await api.get(`/api/v1/students/${studentNumber}`);
    return response.data;
  },

  // Get all supervisors
  getAllSupervisors: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.skip !== undefined) queryParams.append('skip', params.skip);
    if (params.limit !== undefined) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.department) queryParams.append('department', params.department);
    
    const url = `/api/v1/supervisors/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get supervisor by ID
  getSupervisorById: async (supervisorId) => {
    const response = await api.get(`/api/v1/supervisors/${supervisorId}`);
    return response.data;
  },

  // Get student supervisors
  getStudentSupervisors: async (studentNumber) => {
    const response = await api.get(`/api/v1/student-supervisors/student/${studentNumber}`);
    return response.data;
  },

  // Get registrations (with optional filters)
  getRegistrations: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.skip !== undefined) queryParams.append('skip', params.skip);
    if (params.limit !== undefined) queryParams.append('limit', params.limit);
    if (params.student_number) queryParams.append('student_number', params.student_number);
    if (params.status) queryParams.append('status', params.status);
    
    const url = `/api/v1/registrations/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get registration by ID
  getRegistrationById: async (registrationId) => {
    const response = await api.get(`/api/v1/registrations/${registrationId}`);
    return response.data;
  },

  // Get student registration
  getStudentRegistration: async (studentNumber) => {
    const response = await api.get(`/api/v1/registrations/student/${studentNumber}`);
    return response.data;
  },

  // Request registration extension
  requestRegistrationExtension: async (registrationId, extensionDays, reason) => {
    const queryParams = new URLSearchParams();
    queryParams.append('extension_days', extensionDays);
    queryParams.append('reason', reason);
    
    const response = await api.post(`/api/v1/registrations/${registrationId}/extension?${queryParams.toString()}`);
    return response.data;
  },

  // Update registration (admin only - included for completeness)
  updateRegistration: async (registrationId, data) => {
    const response = await api.put(`/api/v1/registrations/${registrationId}`, data);
    return response.data;
  }
};

// Export individual functions for easier imports
export const getStudentByNumber = studentAPI.getStudentByNumber;
export const getAllSupervisors = studentAPI.getAllSupervisors;
export const getSupervisorById = studentAPI.getSupervisorById;
export const getStudentSupervisors = studentAPI.getStudentSupervisors;
export const getRegistrations = studentAPI.getRegistrations;
export const getRegistrationById = studentAPI.getRegistrationById;
export const getStudentRegistration = studentAPI.getStudentRegistration;
export const requestRegistrationExtension = studentAPI.requestRegistrationExtension;
export const updateRegistration = studentAPI.updateRegistration;

export default studentAPI;
