import React, { useState, useEffect } from 'react';
import { shiftService } from '../services/api';
import { Clock, Plus, Edit3, Trash2, Calendar, X, RefreshCw } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

const ShiftManagement = ({ showNotification }) => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, shiftId: null, shiftType: '' });

  const [formData, setFormData] = useState({
    shift_type: 'Morning',
    start_time: '08:00',
    date: new Date().toISOString().split('T')[0]
  });
  const [formError, setFormError] = useState('');

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const data = await shiftService.getAll();
      setShifts(data);
    } catch (err) {
      showNotification('Failed to fetch shifts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingShift(null);
    setFormData({
      shift_type: 'Morning',
      start_time: '08:00',
      date: new Date().toISOString().split('T')[0]
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (shift) => {
    setEditingShift(shift);
    setFormData({
      shift_type: shift.shift_type,
      start_time: shift.start_time ? shift.start_time.substring(0, 5) : '08:00',
      date: shift.date ? shift.date.substring(0, 10) : new Date().toISOString().split('T')[0]
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.shift_type || !formData.start_time || !formData.date) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      if (editingShift) {
        await shiftService.update(editingShift.shift_id, formData);
        showNotification('Shift updated successfully!', 'success');
      } else {
        await shiftService.create(formData);
        showNotification('New shift created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchShifts();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save shift.');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await shiftService.delete(deleteModal.shiftId);
      showNotification('Shift deleted successfully!', 'success');
      setDeleteModal({ isOpen: false, shiftId: null, shiftType: '' });
      fetchShifts();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete shift.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-600" /> Shift Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Create, update, and manage shift schedules for staff allocation.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Shift
        </button>
      </div>

      {/* Shifts Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold">
                <th className="py-3.5 px-4">Shift ID</th>
                <th className="py-3.5 px-4">Shift Type</th>
                <th className="py-3.5 px-4">Start Time</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
                      <span>Loading shift schedules...</span>
                    </div>
                  </td>
                </tr>
              ) : shifts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 font-medium">
                    No shifts created yet. Click "Create New Shift" to add one.
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr key={shift.shift_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-purple-700 font-extrabold">SHF-{String(shift.shift_id).padStart(3, '0')}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        shift.shift_type === 'Morning'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : shift.shift_type === 'Afternoon'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          : shift.shift_type === 'Evening'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {shift.shift_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-800 font-bold">{shift.start_time}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{shift.date}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(shift)}
                          title="Edit Shift"
                          className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, shiftId: shift.shift_id, shiftType: `${shift.shift_type} (${shift.date})` })}
                          title="Delete Shift"
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Modal for Create/Edit Shift */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingShift ? 'Edit Shift Schedule' : 'Create New Shift'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Shift Type *
                </label>
                <select
                  value={formData.shift_type}
                  onChange={(e) => setFormData({ ...formData, shift_type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                >
                  <option value="Morning">Morning Shift</option>
                  <option value="Afternoon">Afternoon Shift</option>
                  <option value="Evening">Evening Shift</option>
                  <option value="Night">Night Shift</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Shift Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md"
                >
                  {editingShift ? 'Save Changes' : 'Create Shift'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Shift"
        message={`Are you sure you want to delete shift "${deleteModal.shiftType}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, shiftId: null, shiftType: '' })}
      />
    </div>
  );
};

export default ShiftManagement;
