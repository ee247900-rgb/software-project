import React, { useState, useEffect } from 'react';
import { scheduleService, staffService, shiftService } from '../services/api';
import { CalendarCheck, Filter, RefreshCw, Search, CheckCircle, Clock, X, Trash2, Edit3 } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

const ScheduleManagement = ({ showNotification }) => {
  const [schedules, setSchedules] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    staff_id: '',
    department: '',
    date: '',
    shift_id: '',
    status: ''
  });

  const [editStatusModal, setEditStatusModal] = useState({ isOpen: false, scheduleId: null, currentStatus: 'Assigned' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, scheduleId: null });

  const fetchOptions = async () => {
    try {
      const [stf, shf] = await Promise.all([staffService.getAll(), shiftService.getAll()]);
      setStaffList(stf);
      setShifts(shf);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const data = await scheduleService.getAll(filters);
      setSchedules(data);
    } catch (err) {
      showNotification('Failed to fetch schedules', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      staff_id: '',
      department: '',
      date: '',
      shift_id: '',
      status: ''
    });
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await scheduleService.update(editStatusModal.scheduleId, { status: newStatus });
      showNotification(`Schedule status updated to ${newStatus}.`, 'success');
      setEditStatusModal({ isOpen: false, scheduleId: null, currentStatus: 'Assigned' });
      fetchSchedules();
    } catch (err) {
      showNotification('Failed to update status.', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await scheduleService.delete(deleteModal.scheduleId);
      showNotification('Schedule assignment deleted.', 'success');
      setDeleteModal({ isOpen: false, scheduleId: null });
      fetchSchedules();
    } catch (err) {
      showNotification('Failed to delete schedule.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Staff Schedules</h2>
          <p className="text-sm text-slate-400 mt-1">View and filter complete work schedules for all staff members across departments.</p>
        </div>
        <button
          onClick={fetchSchedules}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-cyan-400" />
            Filter Schedules
          </span>
          <button
            onClick={handleResetFilters}
            className="text-xs text-cyan-400 hover:underline font-semibold"
          >
            Clear All Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Staff Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Staff Member</label>
            <select
              value={filters.staff_id}
              onChange={(e) => setFilters({ ...filters, staff_id: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Staff</option>
              {staffList.map((stf) => (
                <option key={stf.staff_id} value={stf.staff_id}>{stf.name}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Operations">Operations</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Shift Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Shift Type</label>
            <select
              value={filters.shift_id}
              onChange={(e) => setFilters({ ...filters, shift_id: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Shifts</option>
              {shifts.map((shf) => (
                <option key={shf.shift_id} value={shf.shift_id}>{shf.shift_type} ({shf.date})</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Statuses</option>
              <option value="Assigned">Assigned</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Staff Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Shift Type</th>
                <th className="py-3.5 px-4">Start Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                      <span>Loading schedules...</span>
                    </div>
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No schedule records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                schedules.map((sc) => (
                  <tr key={sc.schedule_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{sc.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-cyan-300">{sc.staff_name}</td>
                    <td className="py-3.5 px-4 text-slate-300">{sc.department}</td>
                    <td className="py-3.5 px-4 text-purple-300 font-medium">{sc.shift_type}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">{sc.start_time}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        sc.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : sc.status === 'Cancelled'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      }`}>
                        {sc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditStatusModal({ isOpen: true, scheduleId: sc.schedule_id, currentStatus: sc.status })}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Update Status
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, scheduleId: sc.schedule_id })}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Status Modal */}
      {editStatusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Update Schedule Status</h3>
            <p className="text-xs text-slate-400">Select new status for schedule SCH-{editStatusModal.scheduleId}:</p>
            
            <div className="space-y-2">
              {['Assigned', 'Completed', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(st)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    editStatusModal.currentStatus === st
                      ? 'bg-cyan-600 text-white border-cyan-400'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setEditStatusModal({ isOpen: false, scheduleId: null, currentStatus: 'Assigned' })}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule record?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, scheduleId: null })}
      />
    </div>
  );
};

export default ScheduleManagement;
