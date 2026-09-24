import React, { useState, useEffect } from 'react';
import { leaveService } from '../services/api';
import { FileText, CheckCircle, XCircle, Clock, RefreshCw, Filter } from 'lucide-react';

const LeaveManagement = ({ showNotification }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const data = await leaveService.getAll(filterStatus);
      setLeaveRequests(data);
    } catch (err) {
      showNotification('Failed to fetch leave requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [filterStatus]);

  const handleReview = async (leaveId, status) => {
    try {
      await leaveService.review(leaveId, status);
      showNotification(`Leave request has been ${status.toLowerCase()}!`, 'success');
      fetchLeaveRequests();
    } catch (err) {
      showNotification(`Failed to update leave request status.`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-600" /> Leave Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Review staff leave applications and approve or reject requests.</p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leave Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold">
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">From Date</th>
                <th className="py-3.5 px-4">To Date</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
                      <span>Loading leave requests...</span>
                    </div>
                  </td>
                </tr>
              ) : leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                    No leave requests found for status "{filterStatus}".
                  </td>
                </tr>
              ) : (
                leaveRequests.map((req) => (
                  <tr key={req.leave_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{req.staff_name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{req.staff_email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{req.department}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-bold">{req.from_date}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-bold">{req.to_date}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">{req.reason}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : req.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : req.status === 'Cancelled'
                          ? 'bg-slate-100 text-slate-600 border-slate-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleReview(req.leave_id, 'Approved')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(req.leave_id, 'Rejected')}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-[11px] text-slate-400 font-medium italic">
                          Reviewed
                        </div>
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
  );
};

export default LeaveManagement;
