import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SystemAdminDashboard from '../pages/SystemAdminDashboard';
import AcademicAdminDashboard from '../pages/AcademicAdminDashboard';
import GbosAdminDashboard from '../pages/GbosAdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect students to their specific dashboard
    if (user?.role === 'student') {
      navigate('/student/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const renderDashboard = () => {
    switch (user?.role) {
      case 'system_admin':
        return <SystemAdminDashboard />;
      case 'academic_admin':
        return <AcademicAdminDashboard />;
      case 'gbos_admin':
        return <GbosAdminDashboard />;
      case 'gbos_approver':
        return <div>GBOS Approver Dashboard - Coming Soon</div>;
      case 'dos':
        return <div>Director of Studies Dashboard - Coming Soon</div>;
      case 'supervisor':
        return <div>Supervisor Dashboard - Coming Soon</div>;
      case 'student':
        return <div>Redirecting to Student Dashboard...</div>;
      case 'examiner':
        return <div>Examiner Dashboard - Coming Soon</div>;
      case 'ethics_admin':
        return <div>Ethics Admin Dashboard - Coming Soon</div>;
      case 'international_office':
        return <div>International Office Dashboard - Coming Soon</div>;
      case 'research_office':
        return <div>Research Office Dashboard - Coming Soon</div>;
      case 'finance_admin':
        return <div>Finance Admin Dashboard - Coming Soon</div>;
      case 'hr_representative':
        return <div>HR Representative Dashboard - Coming Soon</div>;
      default:
        return <div>Default User Dashboard - Coming Soon</div>;
    }
  };

  return renderDashboard();
};

export default Dashboard;
