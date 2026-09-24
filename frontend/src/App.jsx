import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import NotificationToast from './components/NotificationToast';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import StaffManagement from './pages/StaffManagement';
import ShiftManagement from './pages/ShiftManagement';
import ShiftAssignment from './pages/ShiftAssignment';
import ScheduleManagement from './pages/ScheduleManagement';
import LeaveManagement from './pages/LeaveManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import Reports from './pages/Reports';

// Staff Pages
import StaffDashboard from './pages/StaffDashboard';
import StaffSchedule from './pages/StaffSchedule';
import StaffLeave from './pages/StaffLeave';
import StaffAttendance from './pages/StaffAttendance';

// Shared Pages
import UserProfile from './pages/UserProfile';

const MainLayout = () => {
  const { user, isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState(() => (isAdmin ? 'admin-dashboard' : 'staff-dashboard'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      if (!currentTab.startsWith('admin-') && !['staff-management', 'shift-management', 'shift-assignment', 'schedule-management', 'leave-management', 'attendance-management', 'reports', 'profile'].includes(currentTab)) {
        setCurrentTab('admin-dashboard');
      }
    } else {
      if (['staff-management', 'shift-management', 'shift-assignment', 'schedule-management', 'leave-management', 'attendance-management', 'reports'].includes(currentTab)) {
        setCurrentTab('staff-dashboard');
      }
    }
  }, [user, isAdmin]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const renderContent = () => {
    switch (currentTab) {
      // Admin Views
      case 'admin-dashboard':
        return <AdminDashboard setCurrentTab={setCurrentTab} />;
      case 'staff-management':
        return <StaffManagement showNotification={showNotification} />;
      case 'shift-management':
        return <ShiftManagement showNotification={showNotification} />;
      case 'shift-assignment':
        return <ShiftAssignment showNotification={showNotification} />;
      case 'schedule-management':
        return <ScheduleManagement showNotification={showNotification} />;
      case 'leave-management':
        return <LeaveManagement showNotification={showNotification} />;
      case 'attendance-management':
        return <AttendanceManagement showNotification={showNotification} />;
      case 'reports':
        return <Reports showNotification={showNotification} />;

      // Staff Views
      case 'staff-dashboard':
        return <StaffDashboard setCurrentTab={setCurrentTab} showNotification={showNotification} />;
      case 'staff-schedule':
        return <StaffSchedule />;
      case 'staff-leave':
        return <StaffLeave showNotification={showNotification} />;
      case 'staff-attendance':
        return <StaffAttendance showNotification={showNotification} />;

      // Shared
      case 'profile':
        return <UserProfile />;

      default:
        return isAdmin ? <AdminDashboard setCurrentTab={setCurrentTab} /> : <StaffDashboard setCurrentTab={setCurrentTab} showNotification={showNotification} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Header currentTab={currentTab} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>
      </div>

      {/* Global Notification Toast */}
      <NotificationToast
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

const AppContent = () => {
  const { user } = useAuth();
  if (!user) {
    return <LoginPage />;
  }
  return <MainLayout />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
