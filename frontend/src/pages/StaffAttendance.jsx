import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/api';
import { UserCheck, Clock, CheckCircle2, Calendar, RefreshCw, Sparkles, Activity } from 'lucide-react';

const StaffAttendance = ({ showNotification }) => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const [todayData, logsData] = await Promise.all([
        attendanceService.getTodayStatus(),
        attendanceService.getMyAttendance()
      ]);
      setTodayStatus(todayData);
      setAttendanceLogs(logsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleCheckIn = async () => {
    try {
      const res = await attendanceService.checkIn();
      showNotification(`Checked in at ${res.check_in}`, 'success');
      loadAttendance();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to check in.', 'error');
    }
  };

  const handleCheckOut = async () => {
    try {
      const res = await attendanceService.checkOut();
      showNotification(`Checked out at ${res.check_out}`, 'success');
      loadAttendance();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to check out.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-400" />
            Attendance Management Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Record your daily work shift check-in and check-out timestamps.</p>
        </div>
        <button
          onClick={loadAttendance}
          className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 border border-slate-700/60"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Status
        </button>
      </div>

      {/* Main Interactive Check-In/Out Dashboard Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="text-xs font-extrabold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Today's Shift Date
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div className="bg-slate-950/90 px-5 py-3 rounded-2xl border border-slate-800 flex items-center gap-3 shadow-inner">
            <Clock className="w-6 h-6 text-emerald-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Live System Clock</div>
              <div className="text-xl font-mono font-bold text-white tracking-tight">{currentTime}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1: Check In Box */}
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800/80 space-y-4 text-center shadow-inner hover:border-emerald-500/40 transition-all">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 1: Shift Check-In</div>
            <div className="text-3xl font-mono font-black text-emerald-400 tracking-tight">
              {todayStatus?.check_in || '--:--:--'}
            </div>
            <button
              onClick={handleCheckIn}
              disabled={!!todayStatus?.check_in}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                todayStatus?.check_in
                  ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/40 hover:scale-105 border border-white/10'
              }`}
            >
              {todayStatus?.check_in ? '✔ Check-In Recorded' : 'Mark Check-In Now'}
            </button>
          </div>

          {/* Step 2: Check Out Box */}
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800/80 space-y-4 text-center shadow-inner hover:border-cyan-500/40 transition-all">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 2: Shift Check-Out</div>
            <div className="text-3xl font-mono font-black text-cyan-400 tracking-tight">
              {todayStatus?.check_out || '--:--:--'}
            </div>
            <button
              onClick={handleCheckOut}
              disabled={!todayStatus?.check_in || !!todayStatus?.check_out}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                !todayStatus?.check_in || todayStatus?.check_out
                  ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/40 hover:scale-105 border border-white/10'
              }`}
            >
              {todayStatus?.check_out ? '✔ Check-Out Recorded' : 'Mark Check-Out Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl p-6 space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          My Attendance Log History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Check-In</th>
                <th className="py-3.5 px-4">Check-Out</th>
                <th className="py-3.5 px-4">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400 font-semibold">
                    Loading attendance records...
                  </td>
                </tr>
              ) : attendanceLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                attendanceLogs.map((log) => (
                  <tr key={log.attend_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{log.date}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{log.check_in || '--:--:--'}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{log.check_out || '--:--:--'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                        log.check_out
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : log.check_in
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}>
                        {log.status}
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

export default StaffAttendance;
