import React, { useState, useEffect } from 'react';
import { attendanceService, staffService } from '../services/api';
import { UserCheck, Calendar, Filter, RefreshCw, Clock } from 'lucide-react';

const AttendanceManagement = ({ showNotification }) => {
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    date: '',
    staff_id: '',
    from_date: '',
    to_date: ''
  });

  const fetchOptions = async () => {
    try {
      const data = await staffService.getAll();
      setStaffList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getAll(filters);
      setAttendanceLogs(data);
    } catch (err) {
      showNotification('Failed to fetch attendance logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({ date: '', staff_id: '', from_date: '', to_date: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Attendance Management</h2>
          <p className="text-sm text-slate-400">Monitor check-in and check-out logs for all staff members.</p>
        </div>
        <button
          onClick={fetchAttendance}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-pink-400" />
            Attendance Filters
          </span>
          <button
            onClick={handleResetFilters}
            className="text-xs text-pink-400 hover:underline font-semibold"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Single Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Staff Member</label>
            <select
              value={filters.staff_id}
              onChange={(e) => setFilters({ ...filters, staff_id: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-pink-500"
            >
              <option value="">All Staff</option>
              {staffList.map((stf) => (
                <option key={stf.staff_id} value={stf.staff_id}>{stf.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">From Date</label>
            <input
              type="date"
              value={filters.from_date}
              onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">To Date</label>
            <input
              type="date"
              value={filters.to_date}
              onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Check-In Time</th>
                <th className="py-3.5 px-4">Check-Out Time</th>
                <th className="py-3.5 px-4">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-pink-400" />
                      <span>Loading attendance records...</span>
                    </div>
                  </td>
                </tr>
              ) : attendanceLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No attendance records found matching filters.
                  </td>
                </tr>
              ) : (
                attendanceLogs.map((log) => (
                  <tr key={log.attend_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{log.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-cyan-300">{log.staff_name}</td>
                    <td className="py-3.5 px-4 text-slate-300">{log.department}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400">{log.check_in || '--:--:--'}</td>
                    <td className="py-3.5 px-4 font-mono text-cyan-400">{log.check_out || '--:--:--'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
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

export default AttendanceManagement;
