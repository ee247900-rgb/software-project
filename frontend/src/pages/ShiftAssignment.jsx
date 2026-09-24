import React, { useState, useEffect } from 'react';
import { staffService, shiftService, scheduleService } from '../services/api';
import { CalendarPlus, UserCheck, Clock, Calendar, CheckCircle2, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

const ShiftAssignment = ({ showNotification }) => {
  const [staffList, setStaffList] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    staff_id: '',
    shift_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Assigned'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, scheduleId: null });

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffData, shiftData, scheduleData] = await Promise.all([
        staffService.getAll(),
        shiftService.getAll(),
        scheduleService.getAll()
      ]);
      setStaffList(staffData);
      setShifts(shiftData);
      setSchedules(scheduleData);

      if (staffData.length > 0 && !formData.staff_id) {
        setFormData((prev) => ({ ...prev, staff_id: staffData[0].staff_id }));
      }
      if (shiftData.length > 0 && !formData.shift_id) {
        setFormData((prev) => ({ ...prev, shift_id: shiftData[0].shift_id }));
      }
    } catch (err) {
      showNotification('Failed to load assignment options', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.staff_id || !formData.shift_id || !formData.date) {
      setErrorMsg('Please select Staff, Shift, and Date.');
      return;
    }

    setSubmitting(true);
    try {
      await scheduleService.assign(formData);
      showNotification('Shift successfully assigned to staff member!', 'success');
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to assign shift. Please check for scheduling conflicts.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = async () => {
    try {
      await scheduleService.delete(deleteModal.scheduleId);
      showNotification('Shift assignment deleted.', 'success');
      setDeleteModal({ isOpen: false, scheduleId: null });
      loadData();
    } catch (err) {
      showNotification('Failed to delete assignment.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <CalendarPlus className="w-6 h-6 text-indigo-600" /> Shift Assignment
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Assign work shifts to staff members and prevent scheduling conflicts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment Form Card */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 h-fit">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            New Shift Assignment
          </h3>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAssign} className="space-y-4">
            {/* 1. Select Staff */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                1. Select Staff Member *
              </label>
              <select
                required
                value={formData.staff_id}
                onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-900"
              >
                {staffList.length === 0 ? (
                  <option value="">No staff available</option>
                ) : (
                  staffList.map((stf) => (
                    <option key={stf.staff_id} value={stf.staff_id}>
                      {stf.name} ({stf.department} - {stf.designation})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* 2. Select Shift */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                2. Select Shift *
              </label>
              <select
                required
                value={formData.shift_id}
                onChange={(e) => setFormData({ ...formData, shift_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-900"
              >
                {shifts.length === 0 ? (
                  <option value="">No shifts available</option>
                ) : (
                  shifts.map((shf) => (
                    <option key={shf.shift_id} value={shf.shift_id}>
                      {shf.shift_type} ({shf.start_time}) - {shf.date}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* 3. Select Date */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                3. Assignment Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-900"
              />
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs font-medium focus:outline-none focus:border-slate-900"
              >
                <option value="Assigned">Assigned</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting || staffList.length === 0 || shifts.length === 0}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{submitting ? 'Assigning...' : 'Assign Shift'}</span>
            </button>
          </form>
        </div>

        {/* Existing Assigned Schedules Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Active Shift Assignments ({schedules.length})
            </h3>
            <button
              onClick={loadData}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-extrabold">
                  <th className="py-3 px-3">Schedule ID</th>
                  <th className="py-3 px-3">Staff Name</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Shift</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500 font-semibold">
                      Loading shift assignments...
                    </td>
                  </tr>
                ) : schedules.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                      No shift assignments saved yet.
                    </td>
                  </tr>
                ) : (
                  schedules.map((sc) => (
                    <tr key={sc.schedule_id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono text-indigo-700 font-extrabold">SCH-{String(sc.schedule_id).padStart(3, '0')}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{sc.staff_name}</td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{sc.department}</td>
                      <td className="py-3 px-3 text-purple-700 font-bold">{sc.shift_type} ({sc.start_time})</td>
                      <td className="py-3 px-3 text-slate-800 font-bold">{sc.date}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          sc.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : sc.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                        }`}>
                          {sc.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, scheduleId: sc.schedule_id })}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Shift Assignment"
        message="Are you sure you want to remove this shift assignment?"
        onConfirm={handleDeleteSchedule}
        onCancel={() => setDeleteModal({ isOpen: false, scheduleId: null })}
      />
    </div>
  );
};

export default ShiftAssignment;
