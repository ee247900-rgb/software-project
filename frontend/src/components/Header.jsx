import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Clock, Shield, UserCheck, Menu, Sparkles } from 'lucide-react';

const Header = ({ currentTab, toggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTabName = (name) => {
    return name
      .replace('-', ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between no-print shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {formatTabName(currentTab)}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Staff Scheduling & Shift Management System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* System Online Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>System Online</span>
        </div>

        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100/90 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-mono font-bold text-slate-800 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>{time}</span>
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 bg-slate-50 pl-3.5 pr-2 py-1.5 rounded-full border border-slate-200 shadow-sm">
          <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-900">{user?.name}</div>
            <div className="text-[10px] text-slate-500 font-semibold truncate max-w-[120px]">
              {user?.role === 'admin' ? 'Administrator' : user?.department || 'Staff'}
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 text-[10px] uppercase font-extrabold rounded-full flex items-center gap-1 ${
              isAdmin
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
            }`}
          >
            {isAdmin ? <Shield className="w-3 h-3 text-amber-700" /> : <UserCheck className="w-3 h-3 text-indigo-700" />}
            {user?.role}
          </span>

          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all ml-0.5"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
