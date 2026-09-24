import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarPlus,
  CalendarCheck,
  FileText,
  UserCheck,
  FileSpreadsheet,
  User,
  LogOut,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ currentTab, setCurrentTab, isOpen, setIsOpen }) => {
  const { user, logout, isAdmin } = useAuth();

  const adminNavItems = [
    { category: 'Overview', items: [{ id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
    {
      category: 'Management',
      items: [
        { id: 'staff-management', label: 'Staff Management', icon: Users },
        { id: 'shift-management', label: 'Shift Management', icon: Clock },
        { id: 'shift-assignment', label: 'Shift Assignment', icon: CalendarPlus },
        { id: 'schedule-management', label: 'Staff Schedule', icon: CalendarCheck },
      ]
    },
    {
      category: 'Operations',
      items: [
        { id: 'leave-management', label: 'Leave Requests', icon: FileText },
        { id: 'attendance-management', label: 'Attendance Logs', icon: UserCheck },
        { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
        { id: 'profile', label: 'Profile Settings', icon: User },
      ]
    }
  ];

  const staffNavItems = [
    { category: 'Portal', items: [{ id: 'staff-dashboard', label: 'My Dashboard', icon: LayoutDashboard }] },
    {
      category: 'My Work',
      items: [
        { id: 'staff-schedule', label: 'My Schedule', icon: CalendarCheck },
        { id: 'staff-leave', label: 'Apply Leave', icon: FileText },
        { id: 'staff-attendance', label: 'Mark Attendance', icon: UserCheck },
        { id: 'profile', label: 'My Profile', icon: User },
      ]
    }
  ];

  const navGroups = isAdmin ? adminNavItems : staffNavItems;

  const handleSelect = (id) => {
    setCurrentTab(id);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 no-print shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo */}
        <div className="p-5 border-b border-slate-200/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-md text-white font-black text-xl tracking-wider">
              SS
            </div>
            <div>
              <div className="font-black text-slate-900 text-base leading-tight tracking-tight flex items-center gap-1">
                ShiftSchedule
              </div>
              <div className="text-[10px] font-mono text-indigo-600 font-bold tracking-wider uppercase">
                System Portal
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3.5 mx-3.5 my-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner">
          <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Logged in as</div>
          <div className="text-sm font-black text-slate-900 truncate mt-0.5">{user?.name}</div>
          <div className="text-[11px] text-indigo-700 font-bold capitalize flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            {user?.role} Mode
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {group.category}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-all group relative ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-md font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Footer Logout */}
        <div className="p-3.5 border-t border-slate-200/90">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
