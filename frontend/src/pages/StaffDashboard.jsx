import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { scheduleService, leaveService, attendanceService } from '../services/api';
import { CalendarCheck, FileText, UserCheck, Clock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

const StaffDashboard = ({ setCurrentTab, showNotification }) => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStaffData = async () => {
    setLoading(true);
    try {
      const [schData, leaveData, attData] = await Promise.all([
        scheduleService.getMySchedule(),
        leaveService.getMyRequests(),
        attendanceService.getTodayStatus()
      ]);
      setSchedules(schData);
      setLeaveRequests(leaveData);
      setTodayAttendance(attData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaffData();
  }, []);

  const handleQuickCheckIn = async () => {
    try {
      await attendanceService.checkIn();
      showNotification('Checked in successfully!', 'success');
      loadStaffData();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to check in.', 'error');
    }
  };

  const handleQuickCheckOut = async () => {
    try {
      await attendanceService.checkOut();
      showNotification('Checked out successfully!', 'success');
      loadStaffData();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to check out.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-6 rounded-3xl border border-cyan-900/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-sm text-cyan-300/80 mt-1">
            Department: <span className="font-semibold text-white">{user?.department}</span> | Designation: <span className="font-semibold text-white">{user?.designation}</span>
          </p>
        </div>

        {/* Attendance Action Widget */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 flex items-center gap-3">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Today's Attendance Status</div>
            <div className="text-xs font-bold text-emerald-400">
              {todayAttendance?.status || 'Not Checked In'}
            </div>
          </div>
          {!todayAttendance?.check_in ? (
            <button
              onClick={handleQuickCheckIn}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
            >
              Check In
            </button>
          ) : !todayAttendance?.check_out ? (
            <button
              onClick={handleQuickCheckOut}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all"
            >
              Check Out
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-semibold px-2">Shift Completed</span>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: My Schedule */}
        <div
          onClick={() => setCurrentTab('staff-schedule')}
          className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <div className="text-3xl font-black text-white">{schedules.length}</div>
            <div className="text-sm font-semibold text-slate-300 mt-1">Assigned Shifts</div>
            <div className="text-xs text-slate-400 mt-0.5">Click to view complete work schedule</div>
          </div>
        </div>

        {/* Card 2: Leave Status */}
        <div
          onClick={() => setCurrentTab('staff-leave')}
          className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <div className="text-3xl font-black text-white">{leaveRequests.length}</div>
            <div className="text-sm font-semibold text-slate-300 mt-1">My Leave Applications</div>
            <div className="text-xs text-slate-400 mt-0.5">Apply for leave & track approval status</div>
          </div>
        </div>

        {/* Card 3: Mark Attendance */}
        <div
          onClick={() => setCurrentTab('staff-attendance')}
          className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserCheck className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-transform" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-400">{todayAttendance?.status || 'Not Checked In'}</div>
            <div className="text-sm font-semibold text-slate-300 mt-1">Attendance Tracker</div>
            <div className="text-xs text-slate-400 mt-0.5">Check in / check out & view monthly history</div>
          </div>
        </div>
      </div>

      {/* Assigned Schedule Table Snippet */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            My Upcoming Shifts
          </h3>
          <button
            onClick={() => setCurrentTab('staff-schedule')}
            className="text-xs font-semibold text-cyan-400 hover:underline"
          >
            View Full Schedule
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Shift Type</th>
                <th className="py-2.5 px-3">Start Time</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-slate-500">
                    No shifts assigned yet.
                  </td>
                </tr>
              ) : (
                schedules.slice(0, 5).map((sc) => (
                  <tr key={sc.schedule_id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-semibold text-white">{sc.date}</td>
                    <td className="py-3 px-3 text-cyan-300 font-medium">{sc.shift_type}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono">{sc.start_time}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        {sc.status}
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
  );
};

export default StaffDashboard;
