import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Complaint, ComplaintStats, ComplaintStatus, ComplaintPriority, User } from '../types';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Users,
  FileSpreadsheet,
  MessageSquare,
  MapPin,
  Phone,
  Eye,
  X,
  RefreshCw,
  Send,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const { onComplaintCreated, onComplaintUpdated } = useSocket();

  const [activeTab, setActiveTab] = useState<'complaints' | 'users'>('complaints');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [stats, setStats] = useState<ComplaintStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    resolutionRate: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Update modal state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [editStatus, setEditStatus] = useState<ComplaintStatus>('Pending');
  const [editPriority, setEditPriority] = useState<ComplaintPriority>('Medium');
  const [editRemarks, setEditRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Load complaints and stats
  const fetchAdminData = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const [compRes, statsRes, usersRes] = await Promise.all([
        fetch('/api/complaints?viewAll=true', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (compRes.ok) {
        const data = await compRes.json();
        setComplaints(data.complaints || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Real-time listener for incoming complaints from villagers
  useEffect(() => {
    const unsubCreate = onComplaintCreated((newComp) => {
      setComplaints((prev) => [newComp, ...prev]);
      setStats((prev) => ({
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1,
        resolutionRate: Math.round((prev.resolved / (prev.total + 1)) * 100),
      }));
    });

    const unsubUpdate = onComplaintUpdated((updated) => {
      setComplaints((prev) =>
        prev.map((c) => (c._id === updated._id || c.complaintId === updated.complaintId ? updated : c))
      );
      if (selectedComplaint && selectedComplaint._id === updated._id) {
        setSelectedComplaint(updated);
      }
    });

    return () => {
      unsubCreate();
      unsubUpdate();
    };
  }, [onComplaintCreated, onComplaintUpdated, selectedComplaint]);

  // Open modal for editing
  const handleOpenEdit = (c: Complaint) => {
    setSelectedComplaint(c);
    setEditStatus(c.status);
    setEditPriority(c.priority);
    setEditRemarks(c.adminRemarks || '');
    setUpdateSuccess(null);
  };

  // Submit status update
  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsUpdating(true);
    setUpdateSuccess(null);

    try {
      const res = await fetch(`/api/complaints/${selectedComplaint._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: editStatus,
          priority: editPriority,
          adminRemarks: editRemarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update complaint.');
      }

      setUpdateSuccess(`Updated #${data.complaint.complaintId} in real-time.`);
      setSelectedComplaint(data.complaint);

      // Local optimistic update
      setComplaints((prev) =>
        prev.map((c) => (c._id === data.complaint._id ? data.complaint : c))
      );

      // Recalculate stats
      const total = complaints.length;
      const resolved = complaints.filter((c) => (c._id === data.complaint._id ? editStatus === 'Resolved' : c.status === 'Resolved')).length;
      const pending = complaints.filter((c) => (c._id === data.complaint._id ? editStatus === 'Pending' : c.status === 'Pending')).length;
      const inProgress = complaints.filter((c) => (c._id === data.complaint._id ? editStatus === 'In Progress' : c.status === 'In Progress')).length;

      setStats({
        total,
        pending,
        inProgress,
        resolved,
        resolutionRate: Math.round((resolved / total) * 100),
      });

      setTimeout(() => {
        setSelectedComplaint(null);
        setUpdateSuccess(null);
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Error updating complaint.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = [
      'Complaint ID',
      'Category',
      'Location',
      'Village',
      'Status',
      'Priority',
      'Submitted By',
      'Mobile Number',
      'Admin Remarks',
      'Submitted At',
    ];

    const rows = complaints.map((c) => [
      `"${c.complaintId}"`,
      `"${c.category}"`,
      `"${c.location.replace(/"/g, '""')}"`,
      `"${c.village}"`,
      `"${c.status}"`,
      `"${c.priority}"`,
      `"${c.userName}"`,
      `"${c.userMobile}"`,
      `"${(c.adminRemarks || '').replace(/"/g, '""')}"`,
      `"${new Date(c.createdAt).toLocaleString('en-IN')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CleanISS_Chandrugudem_Complaints_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesSearch =
      c.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.userMobile.includes(searchQuery) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Admin Welcome Header */}
      <div className="bg-gradient-to-r from-green-950 via-green-900 to-green-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-green-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-green-200 text-xs font-semibold mb-3 border border-white/15">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Panchayat Secretarial Console · Chandrugudem</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to CleanISS Administration 🌿
          </h2>
          <p className="text-xs sm:text-sm text-green-100/80 mt-1 max-w-xl">
            Logged in as {user?.fullName || 'Panchayat Secretary'}. Manage villager complaints, deploy sanitation crews, and monitor real-time village hygiene metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchAdminData}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-xs font-semibold flex items-center gap-2 cursor-pointer border border-white/20"
            title="Refresh from database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 rounded-xl transition-all text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV Report
          </button>
        </div>
      </div>

      {/* Statistics Strip - 5 Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Total */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-green-100 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Total Complaints
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
            {stats.total}
          </div>
          <span className="text-[11px] text-green-700 mt-1 block">Village wide</span>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-100 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block mb-1">
            Pending Review
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 tabular-nums">
            {stats.pending}
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">Requires inspection</span>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-100 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block mb-1">
            In Progress
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 tabular-nums">
            {stats.inProgress}
          </div>
          <span className="text-[11px] text-blue-700 mt-1 block">Tractor / crew active</span>
        </div>

        {/* Resolved */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
            Resolved
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums">
            {stats.resolved}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Action completed</span>
        </div>

        {/* Resolution Percentage */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-green-200 shadow-xs col-span-2 lg:col-span-1 bg-gradient-to-br from-green-50 to-white">
          <span className="text-[11px] font-semibold text-green-800 uppercase tracking-wider block mb-1">
            Resolution %
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-green-900 tabular-nums">
            {stats.resolutionRate}%
          </div>
          <span className="text-[11px] text-green-700 mt-1 block font-medium">
            Efficiency Rating
          </span>
        </div>
      </div>

      {/* Main Tabs (Complaints vs Users) */}
      <div className="flex items-center gap-3 border-b border-green-100 pb-2">
        <button
          onClick={() => setActiveTab('complaints')}
          className={`pb-2 text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'complaints'
              ? 'text-green-800 border-b-2 border-green-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All Complaints Queue ({complaints.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-2 text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'text-green-800 border-b-2 border-green-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Registered Villagers ({usersList.length})
        </button>
      </div>

      {activeTab === 'complaints' ? (
        /* Complaints View */
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch justify-between bg-white p-4 rounded-2xl border border-green-100 shadow-xs">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, landmark, villager name, or phone..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:border-green-600 outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Category:
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:border-green-600 outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Waste Accumulation">Waste Accumulation</option>
                <option value="Drainage Blockage">Drainage Blockage</option>
                <option value="Overflowing Drains">Overflowing Drains</option>
                <option value="Water Stagnation">Water Stagnation</option>
                <option value="Street Cleanliness">Street Cleanliness</option>
              </select>
            </div>
          </div>

          {/* Complaints Table */}
          <div className="bg-white rounded-2xl border border-green-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-green-50/70 border-b border-green-100 text-green-950 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Landmark / Village</th>
                    <th className="py-3 px-4">Villager Details</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No complaints match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((c) => (
                      <tr key={c._id} className="hover:bg-green-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-green-900 tabular-nums whitespace-nowrap">
                          #{c.complaintId}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {c.category}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate" title={c.location}>
                          <div className="font-medium text-slate-800 truncate">{c.location}</div>
                          <span className="text-[10px] text-slate-400">{c.village}</span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{c.userName}</div>
                          <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                            {c.userMobile}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              c.priority === 'Urgent'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : c.priority === 'High'
                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                : c.priority === 'Medium'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {c.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {c.status === 'Resolved' ? (
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[11px] border border-emerald-200">
                              🟢 Resolved
                            </span>
                          ) : c.status === 'In Progress' ? (
                            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full font-bold text-[11px] border border-blue-200">
                              🔵 In Progress
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[11px] border border-amber-200">
                              🟡 Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs shadow-2xs transition-all cursor-pointer"
                          >
                            Manage Status
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
      ) : (
        /* Users Tab */
        <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Registered Villagers & Staff
          </h3>
          <div className="divide-y divide-slate-100">
            {usersList.map((u) => {
              const userComplaintsCount = complaints.filter((c) => c.userId === u._id).length;
              return (
                <div key={u._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{u.fullName}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono tabular-nums">{u.mobileNumber}</span>
                      <span>·</span>
                      <span>{u.village}</span>
                      <span>·</span>
                      <span className="capitalize font-semibold text-green-700">{u.role}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-bold text-slate-800 tabular-nums">
                      {userComplaintsCount}
                    </span>{' '}
                    <span className="text-slate-500">complaints logged</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Complaint Status & Remarks Management Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="bg-gradient-to-r from-green-900 to-green-700 px-6 py-5 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-green-200 block">
                  Panchayat Redressal Dispatch
                </span>
                <h3 className="text-lg font-bold">
                  Manage Complaint #{selectedComplaint.complaintId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateComplaint} className="p-6 space-y-5">
              
              {updateSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{updateSuccess}</span>
                </div>
              )}

              {/* Readonly Summary Info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Category:</span>
                  <span className="font-bold text-slate-800">{selectedComplaint.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Location:</span>
                  <span className="font-bold text-slate-800">{selectedComplaint.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Submitted By:</span>
                  <span className="font-bold text-slate-800">
                    {selectedComplaint.userName} ({selectedComplaint.userMobile})
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-slate-600">
                  <span className="font-semibold text-slate-700 block mb-0.5">Description:</span>
                  "{selectedComplaint.description}"
                </div>
              </div>

              {/* Photo preview if available */}
              {selectedComplaint.photoUrl && (
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">
                    Submitted Photograph:
                  </span>
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-36 aspect-video bg-slate-900">
                    <img
                      src={selectedComplaint.photoUrl}
                      alt="Complaint photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Change Status */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Update Grievance Status *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Pending', 'In Progress', 'Resolved'] as ComplaintStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        editStatus === st
                          ? st === 'Resolved'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : st === 'In Progress'
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Priority */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Assigned Priority
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Low', 'Medium', 'High', 'Urgent'] as ComplaintPriority[]).map((pr) => (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => setEditPriority(pr)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        editPriority === pr
                          ? 'bg-green-800 text-white border-green-800'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {pr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Panchayat Remarks & Action Notes
                </label>
                <textarea
                  rows={3}
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="e.g. Sanitation tractor dispatched with 4 workers. Silt cleared and bleaching powder sprinkled."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  * Villager will instantly receive this update via Socket.IO push notification.
                </span>
              </div>

              {/* Submit update */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-60 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isUpdating ? 'Broadcasting...' : 'Save & Broadcast Live 🌱'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
