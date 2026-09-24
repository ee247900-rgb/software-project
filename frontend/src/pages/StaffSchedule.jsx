import React, { useState, useEffect } from 'react';
import { scheduleService } from '../services/api';
import { CalendarCheck, Clock, RefreshCw } from 'lucide-react';

const StaffSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const data = await scheduleService.getMySchedule();
      setSchedules(data);
    } catch (err) {
      console.error('Failed to fetch staff schedule', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-cyan-400" />
            My Work Schedule
          </h2>
          <p className="text-sm text-slate-400 mt-1">View your assigned shifts, timings, and work status.</p>
        </div>
        <button
          onClick={fetchSchedule}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Schedule
        </button>
      </div>

      {/* Schedule Table */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Shift Type</th>
                <th className="py-3.5 px-4">Start Time</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                      <span>Loading your schedule...</span>
                    </div>
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">
                    No work shifts have been assigned to you yet.
                  </td>
                </tr>
              ) : (
                schedules.map((sc) => (
                  <tr key={sc.schedule_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-white">{sc.date}</td>
                    <td className="py-4 px-4 font-semibold text-cyan-300">{sc.shift_type}</td>
                    <td className="py-4 px-4 font-mono text-slate-300">{sc.start_time}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        sc.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : sc.status === 'Cancelled'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      }`}>
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

export default StaffSchedule;
