import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Building, Briefcase, Shield, Key } from 'lucide-react';

const UserProfile = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="bg-slate-900/80 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-cyan-400" />
          User Profile
        </h2>
        <p className="text-sm text-slate-400 mt-1">View account information and system permissions.</p>
      </div>

      <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-cyan-500/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{user?.name}</h3>
            <p className="text-sm text-cyan-400 font-semibold capitalize">{user?.role} Account</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              Email Address
            </div>
            <div className="text-sm font-semibold text-white">{user?.email}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              System Role
            </div>
            <div className="text-sm font-semibold text-white uppercase">{user?.role}</div>
          </div>

          {!isAdmin && (
            <>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-purple-400" />
                  Department
                </div>
                <div className="text-sm font-semibold text-white">{user?.department}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  Designation
                </div>
                <div className="text-sm font-semibold text-white">{user?.designation}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 md:col-span-2">
                <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-pink-400" />
                  Phone Contact
                </div>
                <div className="text-sm font-semibold text-white font-mono">{user?.phone || 'N/A'}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
