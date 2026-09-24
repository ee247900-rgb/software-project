import React, { useState, useEffect } from 'react';
import { leaveService } from '../services/api';
import { FileText, Send, XCircle, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

const StaffLeave = ({ showNotification }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    from_date: new Date().toISOString().split('T')[0],
    to_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reason: ''
  });

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, leaveId: null });

  const fetchLeave = async () => {
    setLoading(true);
    try {
      const data = await leaveService.getMyRequests();
      setLeaveRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeave();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.from_date || !formData.to_date || !formData.reason.trim()) {
      setFormError('Please fill in From Date, To Date, and Reason.');
      return;
    }

    if (new Date(formData.from_date) > new Date(formData.to_date)) {
      setFormError('From Date cannot be after To Date.');
      return;
    }

    setSubmitting(true);
    try {
      await leaveService.apply(formData);
      showNotification('Leave application submitted successfully!', 'success');
      setFormData({
        from_date: new Date().toISOString().split('T')[0],
        to_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        reason: ''
      });
      fetchLeave();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async () => {
    try {
      await leaveService.cancel(cancelModal.leaveId);
      showNotification('Leave request cancelled.', 'success');
      setCancelModal({ isOpen: false, leaveId: null });
      fetchLeave();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to cancel leave request.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-amber-400" />
          Apply for Leave & Status
        </h2>
        <p className="text-sm text-slate-400 mt-1">Submit time-off requests and monitor review progress from management.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Apply Leave Form */}
        <div className="lg:col-span-1 bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4 h-fit">
          <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
            New Leave Application
          </h3>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {formError}
            </div>
          )}

          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                From Date *
              </label>
              <input
                type="date"
                required
                value={formData.from_date}
                onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                To Date *
              </label>
              <input
                type="date"
                required
                value={formData.to_date}
                onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Reason for Leave *
              </label>
              <textarea
                rows="3"
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Medical appointment, personal reasons, etc."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-900/40 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          </form>
        </div>

        {/* Leave Status History Table */}
        <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">
            My Leave Applications History
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3">Leave ID</th>
                  <th className="py-3 px-3">From Date</th>
                  <th className="py-3 px-3">To Date</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400">
                      Loading leave requests...
                    </td>
                  </tr>
                ) : leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-500">
                      You have not submitted any leave requests yet.
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((req) => (
                    <tr key={req.leave_id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono text-amber-400 font-bold">LVE-{String(req.leave_id).padStart(3, '0')}</td>
                      <td className="py-3 px-3 text-slate-200 font-medium">{req.from_date}</td>
                      <td className="py-3 px-3 text-slate-200 font-medium">{req.to_date}</td>
                      <td className="py-3 px-3 text-slate-300 max-w-xs">{req.reason}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          req.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : req.status === 'Rejected'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : req.status === 'Cancelled'
                            ? 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {req.status === 'Pending' ? (
                          <button
                            onClick={() => setCancelModal({ isOpen: true, leaveId: req.leave_id })}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-semibold"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500">--</span>
                        )}
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
        isOpen={cancelModal.isOpen}
        title="Cancel Leave Request"
        message="Are you sure you want to cancel this pending leave request?"
        onConfirm={handleCancelLeave}
        onCancel={() => setCancelModal({ isOpen: false, leaveId: null })}
      />
    </div>
  );
};

export default StaffLeave;
