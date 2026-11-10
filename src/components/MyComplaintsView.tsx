import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Complaint } from '../types';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Eye,
  MessageSquare,
  ShieldAlert,
  ArrowLeft,
  X,
  Clock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface MyComplaintsViewProps {
  onBack: () => void;
  onTrackComplaint: (id: string) => void;
  onNewComplaint: () => void;
}

export const MyComplaintsView: React.FC<MyComplaintsViewProps> = ({
  onBack,
  onTrackComplaint,
  onNewComplaint,
}) => {
  const { token, user } = useAuth();
  const { onComplaintUpdated, onComplaintCreated } = useSocket();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchMyComplaints = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await fetch('/api/complaints', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setComplaints(data.complaints || []);
      }
    } catch (err) {
      console.error('Failed to fetch user complaints:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMyComplaints();
  }, [fetchMyComplaints]);

  // Real-time updates without manual refresh
  useEffect(() => {
    const unsubUpdate = onComplaintUpdated((updated) => {
      setComplaints((prev) =>
        prev.map((c) => (c._id === updated._id || c.complaintId === updated.complaintId ? updated : c))
      );
    });

    const unsubCreate = onComplaintCreated((created) => {
      if (created.userId === user?._id) {
        setComplaints((prev) => [created, ...prev]);
      }
    });

    return () => {
      unsubUpdate();
      unsubCreate();
    };
  }, [onComplaintUpdated, onComplaintCreated, user?._id]);

  const filtered = complaints.filter((c) => {
    const matchesStatus = filterStatus === 'All' || c.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      c.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'Resolved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          🟢 Resolved
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
          🔵 In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
        🟡 Pending
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      Urgent: 'bg-red-50 text-red-700 border-red-200',
      High: 'bg-orange-50 text-orange-700 border-orange-200',
      Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      Low: 'bg-slate-50 text-slate-600 border-slate-200',
    };
    return (
      <span
        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
          colors[priority] || colors.Medium
        }`}
      >
        {priority} Priority
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar with Back and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-green-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-green-800 hover:bg-green-50 rounded-xl transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold text-green-950">My Sanitation Complaints</h2>
            <p className="text-xs text-slate-500">
              Track grievance progress, assigned sanitation crew, and official remarks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMyComplaints}
            className="p-2.5 bg-white hover:bg-green-50 border border-green-200 text-green-800 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Reload complaints"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onNewComplaint}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            + Report New Issue
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-green-50/80 rounded-xl border border-green-200/60 overflow-x-auto">
          {['All', 'Pending', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-white text-green-900 shadow-xs'
                  : 'text-slate-600 hover:text-green-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, landmark, or category..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Complaints List */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-green-600 mb-2" />
          <span className="text-xs font-medium">Fetching complaints from Chandrugudem server...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-green-100 shadow-sm max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-3">
            📋
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Complaints Found</h3>
          <p className="text-xs text-slate-500 mb-4">
            {searchQuery
              ? `No complaints match "${searchQuery}". Try a different keyword.`
              : 'You have not submitted any complaints in this category.'}
          </p>
          <button
            onClick={onNewComplaint}
            className="px-5 py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors cursor-pointer"
          >
            Submit a Sanitation Complaint
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((complaint) => (
            <div
              key={complaint._id}
              className="bg-white rounded-2xl border border-green-100 shadow-xs hover:shadow-md hover:border-green-300 transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-green-950 bg-green-100 px-2.5 py-1 rounded-md tabular-nums border border-green-200">
                      #{complaint.complaintId}
                    </span>
                    {getPriorityBadge(complaint.priority)}
                  </div>
                  {getStatusBadge(complaint.status)}
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2 mb-1">
                  {complaint.category}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">
                  {complaint.description}
                </p>

                {/* Location and Date metadata */}
                <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-green-700 shrink-0" />
                    <span className="truncate">{complaint.location}, {complaint.village}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="tabular-nums">
                      {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Photograph Thumbnail (if present) */}
              {complaint.photoUrl && (
                <div className="px-5 pb-3">
                  <div
                    onClick={() => setSelectedPhoto(complaint.photoUrl)}
                    className="relative rounded-xl overflow-hidden aspect-[21/9] bg-slate-900 cursor-pointer group border border-slate-200"
                  >
                    <img
                      src={complaint.photoUrl}
                      alt="Sanitation issue"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                      <Eye className="w-4 h-4" /> Click to enlarge
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Remarks Callout (if added) */}
              {complaint.adminRemarks ? (
                <div className="mx-5 mb-4 p-3 bg-green-50/70 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-900 mb-1">
                    <MessageSquare className="w-3.5 h-3.5 text-green-700" />
                    Panchayat Secretary Remarks:
                  </div>
                  <p className="text-xs text-green-950/90 leading-relaxed">
                    "{complaint.adminRemarks}"
                  </p>
                </div>
              ) : (
                <div className="mx-5 mb-4 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assigned to field sanitation inspector for site visit.</span>
                </div>
              )}

              {/* Card Footer / Actions */}
              <div className="bg-slate-50/70 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Last updated: {new Date(complaint.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => onTrackComplaint(complaint.complaintId)}
                  className="px-3.5 py-1.5 bg-white hover:bg-green-50 border border-green-200 text-green-800 rounded-lg font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-green-600" />
                  Track Live Timeline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enlarged Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
        >
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={selectedPhoto}
              alt="Enlarged issue"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
