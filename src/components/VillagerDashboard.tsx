import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Complaint, ComplaintStats } from '../types';
import {
  PlusCircle,
  ListOrdered,
  Search,
  BookOpen,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface VillagerDashboardProps {
  onReportComplaint: () => void;
  onViewMyComplaints: () => void;
  onTrackComplaint: (complaintId?: string) => void;
  onViewAwareness: () => void;
}

export const VillagerDashboard: React.FC<VillagerDashboardProps> = ({
  onReportComplaint,
  onViewMyComplaints,
  onTrackComplaint,
  onViewAwareness,
}) => {
  const { user, token } = useAuth();
  const { onComplaintUpdated, onComplaintCreated } = useSocket();

  const [stats, setStats] = useState<ComplaintStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    resolutionRate: 0,
  });

  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const [statsRes, complaintsRes] = await Promise.all([
        fetch('/api/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/complaints', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      if (complaintsRes.ok) {
        const complaintsData = await complaintsRes.json();
        setRecentComplaints(complaintsData.complaints.slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Real-time listener for updates without refresh!
  useEffect(() => {
    const unsubUpdate = onComplaintUpdated((updated) => {
      setRecentComplaints((prev) =>
        prev.map((c) => (c._id === updated._id || c.complaintId === updated.complaintId ? updated : c))
      );
      // Refresh stats
      fetch('/api/stats', { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => {
          if (d.stats) setStats(d.stats);
        });
    });

    const unsubCreate = onComplaintCreated((created) => {
      if (created.userId === user?._id) {
        setRecentComplaints((prev) => [created, ...prev.slice(0, 3)]);
        setStats((prev) => ({
          ...prev,
          total: prev.total + 1,
          pending: prev.pending + 1,
        }));
      }
    });

    return () => {
      unsubUpdate();
      unsubCreate();
    };
  }, [onComplaintUpdated, onComplaintCreated, user?._id, token]);

  const getStatusBadge = (status: string) => {
    if (status === 'Resolved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          🟢 Resolved
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          🔵 In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        🟡 Pending
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Welcome Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-green-900 via-green-800 to-green-700 text-white p-6 sm:p-10 shadow-xl border border-green-600">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-green-100 text-xs font-semibold mb-3">
            <span>Villager Portal</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Chandrugudem
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Welcome Back, {user?.fullName || 'Villager'} 🌿
          </h2>

          <p className="text-lg sm:text-xl font-medium text-emerald-100 mb-2">
            Your Voice Matters! Help Us Keep Chandrugudem Clean.
          </p>

          <p className="text-xs sm:text-sm text-green-100/80 mb-6 leading-relaxed">
            Report waste accumulation, clogged drains, or stagnation issues. Track inspection and resolution progress in real time.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onReportComplaint}
              className="px-5 py-3 bg-white text-green-900 font-bold rounded-xl shadow-md hover:bg-green-50 transition-colors flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-green-700" />
              Report a Complaint
            </button>
            <button
              onClick={onViewMyComplaints}
              className="px-5 py-3 bg-green-800/80 hover:bg-green-800 text-white font-semibold rounded-xl border border-white/20 transition-colors flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <ListOrdered className="w-4 h-4" />
              My Complaints
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-8 -bottom-10 opacity-15 text-9xl pointer-events-none select-none">
          🌱
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-green-900">
            My Sanitation Grievance Overview
          </h3>
          <button
            onClick={fetchDashboardData}
            title="Refresh statistics"
            className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Stats</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Complaints */}
          <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Complaints</span>
              <ListOrdered className="w-4 h-4 text-green-600" />
            </div>
            <div className="text-3xl font-extrabold text-green-950 tabular-nums">
              {stats.total}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Submitted by you</span>
          </div>

          {/* Pending Complaints */}
          <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
            <div className="flex items-center justify-between text-amber-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-600 tabular-nums">
              {stats.pending}
            </div>
            <span className="text-[11px] text-amber-700 mt-1 block">Awaiting Panchayat action</span>
          </div>

          {/* In Progress */}
          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
            <div className="flex items-center justify-between text-blue-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
              <AlertTriangle className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-extrabold text-blue-600 tabular-nums">
              {stats.inProgress}
            </div>
            <span className="text-[11px] text-blue-700 mt-1 block">Sanitation team assigned</span>
          </div>

          {/* Resolved Complaints */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm">
            <div className="flex items-center justify-between text-emerald-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 tabular-nums">
              {stats.resolved}
            </div>
            <span className="text-[11px] text-emerald-700 mt-1 block font-medium">
              {stats.resolutionRate}% Cleanliness rate
            </span>
          </div>
        </div>
      </div>

      {/* 4 Main Action Navigation Cards */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-green-900 mb-4">
          Quick Actions & Services
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Report a Complaint */}
          <div
            onClick={onReportComplaint}
            className="bg-white p-5 rounded-2xl border border-green-200 hover:border-green-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1 group-hover:text-green-700">
                Report a Complaint
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Submit waste pile, drain blockage, or stagnant water photos with GPS location.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-green-700 flex items-center justify-between">
              <span>Submit Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. My Complaints */}
          <div
            onClick={onViewMyComplaints}
            className="bg-white p-5 rounded-2xl border border-green-200 hover:border-green-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ListOrdered className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-700">
                My Complaints
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                View all your past submissions, photos, priority tags, and Panchayat admin remarks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-blue-700 flex items-center justify-between">
              <span>View History ({stats.total})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Track Complaint */}
          <div
            onClick={() => onTrackComplaint()}
            className="bg-white p-5 rounded-2xl border border-green-200 hover:border-green-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1 group-hover:text-amber-700">
                Track Complaint
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter Complaint ID (e.g. #CLN-1001) to trace stage-by-stage resolution status.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-amber-700 flex items-center justify-between">
              <span>Track by ID</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Cleanliness Awareness */}
          <div
            onClick={onViewAwareness}
            className="bg-white p-5 rounded-2xl border border-green-200 hover:border-green-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1 group-hover:text-emerald-700">
                Cleanliness Awareness
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Waste segregation guides, dengue prevention, sanitation schedule, and helplines.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700 flex items-center justify-between">
              <span>Read Guidelines</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions Feed */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-100 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-green-50 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Complaints in Chandrugudem</h3>
            <p className="text-xs text-slate-500">Live feed updated in real time via Socket.IO</p>
          </div>
          <button
            onClick={onViewMyComplaints}
            className="text-xs font-bold text-green-700 hover:text-green-900 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <span className="text-4xl block mb-2">🌱</span>
            <p className="text-sm font-semibold">No complaints reported yet.</p>
            <p className="text-xs mt-1">Report sanitation issues to keep our village clean.</p>
            <button
              onClick={onReportComplaint}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Report First Complaint
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentComplaints.map((c) => (
              <div
                key={c._id}
                className="p-4 rounded-2xl border border-slate-100 hover:border-green-300 transition-all bg-green-50/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-green-900 bg-green-100 px-2 py-0.5 rounded tabular-nums">
                      #{c.complaintId}
                    </span>
                    {getStatusBadge(c.status)}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1">{c.category}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 truncate max-w-[180px]">
                    <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    {c.location}
                  </span>

                  <button
                    onClick={() => onTrackComplaint(c.complaintId)}
                    className="text-green-700 hover:text-green-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
