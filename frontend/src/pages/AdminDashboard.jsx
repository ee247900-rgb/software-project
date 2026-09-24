import React, { useEffect, useState } from 'react';
import { reportService } from '../services/api';
import {
  Users,
  Clock,
  CalendarCheck,
  FileText,
  UserCheck,
  PlusCircle,
  CalendarPlus,
  FileSpreadsheet,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const AdminDashboard = ({ setCurrentTab }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await reportService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Active Staff',
      value: stats?.totalStaff || 0,
      badge: 'Registered',
      icon: Users,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      action: () => setCurrentTab('staff-management')
    },
    {
      title: 'Total Shifts',
      value: stats?.totalShifts || 0,
      badge: 'Schedules',
      icon: Clock,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-200',
      action: () => setCurrentTab('shift-management')
    },
    {
      title: "Today's Scheduled",
      value: stats?.todayScheduled || 0,
      badge: 'Assigned Today',
      icon: CalendarCheck,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      action: () => setCurrentTab('schedule-management')
    },
    {
      title: 'Pending Leaves',
      value: stats?.pendingLeave || 0,
      badge: 'Action Needed',
      icon: FileText,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
      action: () => setCurrentTab('leave-management')
    },
    {
      title: "Today's Attendance",
      value: stats?.todayAttendance || 0,
      badge: 'Checked In',
      icon: UserCheck,
      iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      action: () => setCurrentTab('attendance-management')
    }
  ];

  const quickActions = [
    { label: 'Add Staff', icon: PlusCircle, tab: 'staff-management', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
    { label: 'Create Shift', icon: Clock, tab: 'shift-management', color: 'bg-purple-600 hover:bg-purple-700 text-white' },
    { label: 'Assign Shift', icon: CalendarPlus, tab: 'shift-assignment', color: 'bg-slate-900 hover:bg-slate-800 text-white' },
    { label: 'View Schedule', icon: CalendarCheck, tab: 'schedule-management', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    { label: 'Review Leaves', icon: FileText, tab: 'leave-management', color: 'bg-amber-600 hover:bg-amber-700 text-white' },
    { label: 'Attendance', icon: UserCheck, tab: 'attendance-management', color: 'bg-cyan-600 hover:bg-cyan-700 text-white' },
    { label: 'Reports', icon: FileSpreadsheet, tab: 'reports', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-800" />
        <span className="text-sm font-semibold text-slate-700">Loading Dashboard Metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Executive Control Dashboard
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Staff Scheduling Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl font-medium">
              Monitor real-time metrics, allocate shifts, manage staff leave applications, and track attendance.
            </p>
          </div>

          <button
            onClick={fetchStats}
            className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* 5 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-2xl border ${card.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>

                <div className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</div>
                <div className="text-xs font-bold text-slate-700 mt-1">{card.title}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>{card.badge}</span>
                <span className="text-indigo-600 group-hover:underline">View →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Quick Management Actions
          </h3>
          <span className="text-[11px] text-slate-500 font-semibold">One-click shortcuts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {quickActions.map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <button
                key={idx}
                onClick={() => setCurrentTab(btn.tab)}
                className={`${btn.color} p-3.5 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all shadow-sm hover:scale-105 active:scale-95`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-center">{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Streams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedules Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
              Scheduled Shift Allocation
            </h3>
            <button
              onClick={() => setCurrentTab('schedule-management')}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Full Schedule →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-extrabold">
                  <th className="py-2.5 px-3">Staff Name</th>
                  <th className="py-2.5 px-3">Shift</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentSchedules?.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400">
                      No shift schedules found.
                    </td>
                  </tr>
                ) : (
                  stats?.recentSchedules?.map((item) => (
                    <tr key={item.schedule_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{item.staff_name}</td>
                      <td className="py-3 px-3 text-indigo-700 font-bold">{item.shift_type} ({item.start_time})</td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{item.date}</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Leave Applications */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              Pending Leave Reviews
            </h3>
            <button
              onClick={() => setCurrentTab('leave-management')}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Review Requests →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-extrabold">
                  <th className="py-2.5 px-3">Staff Name</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentLeaves?.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-slate-400">
                      No leave requests pending.
                    </td>
                  </tr>
                ) : (
                  stats?.recentLeaves?.map((item) => (
                    <tr key={item.leave_id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{item.staff_name}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{item.from_date} to {item.to_date}</td>
                      <td className="py-3 px-3 text-slate-500 truncate max-w-[130px]">{item.reason}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : item.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
