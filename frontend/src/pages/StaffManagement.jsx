import React, { useState, useEffect } from 'react';
import { staffService } from '../services/api';
import { Search, UserPlus, Edit3, Trash2, Eye, X, Mail, Phone, Building, Briefcase, Key, ShieldCheck, RefreshCw, UserCheck } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

const StaffManagement = ({ showNotification }) => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, staffId: null, staffName: '' });

  const [editingStaff, setEditingStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    department: 'Engineering',
    designation: 'Developer',
    phone: '',
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');

  const fetchStaff = async (search = '') => {
    setLoading(true);
    try {
      const data = await staffService.getAll(search);
      setStaffList(data);
    } catch (err) {
      showNotification('Failed to fetch staff members', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff(searchTerm);
  }, [searchTerm]);

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      department: 'Engineering',
      designation: 'Developer',
      phone: '',
      email: '',
      password: ''
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      department: staff.department,
      designation: staff.designation,
      phone: staff.phone,
      email: staff.email,
      password: ''
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenViewModal = (staff) => {
    setViewingStaff(staff);
    setIsViewModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.department || !formData.designation || !formData.phone || !formData.email) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      if (editingStaff) {
        await staffService.update(editingStaff.staff_id, formData);
        showNotification('Staff member updated successfully!', 'success');
      } else {
        await staffService.create(formData);
        showNotification('New staff member added successfully!', 'success');
      }
      setIsFormModalOpen(false);
      fetchStaff(searchTerm);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Operation failed. Check input data.');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await staffService.delete(deleteModal.staffId);
      showNotification(`Staff member "${deleteModal.staffName}" deleted successfully!`, 'success');
      setDeleteModal({ isOpen: false, staffId: null, staffName: '' });
      fetchStaff(searchTerm);
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete staff member.', 'error');
    }
  };

  const getDeptColor = (dept) => {
    switch (dept?.toLowerCase()) {
      case 'engineering':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'customer support':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'operations':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'human resources':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600" /> Staff Directory & Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Add, update, search, and manage staff credentials across departments.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search staff by Name, Department, Designation, Email, or Phone..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 text-xs transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-900 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>
        <button
          onClick={() => fetchStaff(searchTerm)}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Search
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-extrabold">
                <th className="py-4 px-4">Staff ID</th>
                <th className="py-4 px-4">Staff Member</th>
                <th className="py-4 px-4">Department</th>
                <th className="py-4 px-4">Designation</th>
                <th className="py-4 px-4">Phone</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-500 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-slate-800" />
                      <span>Loading staff directory...</span>
                    </div>
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                    No staff records found matching your query.
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.staff_id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-3.5 px-4 font-mono text-indigo-700 font-extrabold">
                      STF-{String(staff.staff_id).padStart(3, '0')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-sm">
                          {staff.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900 text-xs">
                          {staff.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getDeptColor(staff.department)}`}>
                        {staff.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{staff.designation}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{staff.phone}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{staff.email}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenViewModal(staff)}
                          title="View Details"
                          className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(staff)}
                          title="Edit Staff"
                          className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, staffId: staff.staff_id, staffName: staff.name })}
                          title="Delete Staff"
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

      {/* Add / Edit Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900">
                {editingStaff ? 'Update Staff Credentials' : 'Register New Staff Member'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
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

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Turner"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Engineering, HR, etc."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Developer, Support Lead"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1-555-0199"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@company.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Login Password {editingStaff && '(Optional)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingStaff ? '••••••••' : 'Default password: staff123'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-md"
                >
                  {editingStaff ? 'Save Changes' : 'Create Staff Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Staff Modal */}
      {isViewModalOpen && viewingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Staff Profile Summary
              </h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase">Staff ID</div>
                <div className="text-base font-extrabold text-indigo-700 font-mono">STF-{String(viewingStaff.staff_id).padStart(3, '0')}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase">Full Name</div>
                  <div className="font-bold text-slate-900 mt-1">{viewingStaff.name}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase">Department</div>
                  <div className="font-bold text-indigo-700 mt-1">{viewingStaff.department}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase">Designation</div>
                  <div className="font-bold text-slate-900 mt-1">{viewingStaff.designation}</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase">Phone</div>
                  <div className="font-bold text-slate-900 mt-1 font-mono">{viewingStaff.phone}</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase">Email Address</div>
                <div className="font-bold text-indigo-700 mt-1">{viewingStaff.email}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Staff Record"
        message={`Are you sure you want to delete staff member "${deleteModal.staffName}"? This will permanently remove their records.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, staffId: null, staffName: '' })}
      />
    </div>
  );
};

export default StaffManagement;
