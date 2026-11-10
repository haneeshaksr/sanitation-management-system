import React, { useState, useEffect } from 'react';
import { Complaint } from '../types';
import {
  Search,
  X,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface TrackComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialComplaintId?: string;
}

export const TrackComplaintModal: React.FC<TrackComplaintModalProps> = ({
  isOpen,
  onClose,
  initialComplaintId = '',
}) => {
  const [searchId, setSearchId] = useState(initialComplaintId || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialComplaintId) {
      setSearchId(initialComplaintId);
      lookupComplaint(initialComplaintId);
    } else {
      setComplaint(null);
      setError(null);
    }
  }, [initialComplaintId, isOpen]);

  if (!isOpen) return null;

  const lookupComplaint = async (id: string) => {
    const cleanId = id.trim().toUpperCase();
    if (!cleanId) {
      setError('Please enter a Complaint ID (e.g. CLN-1001)');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/complaints/${cleanId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Complaint not found.');
      }
      setComplaint(data.complaint);
    } catch (err: any) {
      setComplaint(null);
      setError(err.message || 'Complaint not found in Chandrugudem records.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupComplaint(searchId);
  };

  // Determine active step index
  const getStepIndex = (status: string) => {
    if (status === 'Resolved') return 3;
    if (status === 'In Progress') return 2;
    return 1; // Pending
  };

  const steps = [
    { title: 'Grievance Submitted', desc: 'Logged with photo and GPS location' },
    { title: 'Panchayat Verification', desc: 'Sanitation Inspector assigned' },
    { title: 'Sanitation Action', desc: 'Crew & tractor deployed on site' },
    { title: 'Resolved & Disinfected', desc: 'Area cleaned and verified' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-800 to-green-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <div>
              <h3 className="text-lg font-bold">Track Sanitation Complaint</h3>
              <p className="text-xs text-green-100">
                Live Resolution Tracker · Chandrugudem Gram Panchayat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input box */}
        <div className="p-6 bg-green-50/50 border-b border-green-100">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Complaint ID (e.g. CLN-1001 or CLN-1002)..."
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none uppercase font-mono tabular-nums bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              {isLoading ? 'Searching...' : 'Track'}
            </button>
          </form>

          {/* Quick chip examples */}
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-500">
            <span>Try sample IDs:</span>
            {['CLN-1001', 'CLN-1002', 'CLN-1004'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSearchId(id);
                  lookupComplaint(id);
                }}
                className="font-mono font-semibold text-green-700 hover:underline cursor-pointer"
              >
                #{id}
              </button>
            ))}
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 text-center">
              <p className="font-bold mb-1">No Record Found</p>
              <p>{error}</p>
            </div>
          )}

          {complaint ? (
            <div className="space-y-6">
              
              {/* Complaint Overview Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-extrabold text-green-950 bg-green-100 px-2.5 py-0.5 rounded border border-green-200">
                      #{complaint.complaintId}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {complaint.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 max-w-md">{complaint.description}</p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Current Status
                  </span>
                  {complaint.status === 'Resolved' ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
                      🟢 Resolved
                    </span>
                  ) : complaint.status === 'In Progress' ? (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-300">
                      🔵 In Progress
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-300">
                      🟡 Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Steps Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Sanitation Redressal Progress
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {steps.map((st, idx) => {
                    const activeIdx = getStepIndex(complaint.status);
                    const isDone = idx <= activeIdx;
                    const isCurrent = idx === activeIdx;

                    return (
                      <div key={idx} className="relative flex items-start gap-4">
                        <div
                          className={`absolute -left-6 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                            isDone
                              ? 'bg-green-600 border-green-600 text-white'
                              : 'bg-white border-slate-300 text-slate-400'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold ${
                                isDone ? 'text-green-950' : 'text-slate-400'
                              }`}
                            >
                              {st.title}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                                Current Stage
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{st.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-green-700" />
                    <span className="font-bold text-slate-800">Location Landmark</span>
                  </div>
                  <p className="text-slate-700 pl-5">{complaint.location}, {complaint.village}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-800">Logged On</span>
                  </div>
                  <p className="text-slate-700 pl-5 tabular-nums">
                    {new Date(complaint.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>

              {/* Admin Remarks Section */}
              {complaint.adminRemarks && (
                <div className="p-4 bg-green-50/80 rounded-2xl border border-green-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-green-900">
                    <MessageSquare className="w-4 h-4 text-green-700" />
                    Official Remarks from Panchayat Office:
                  </div>
                  <p className="text-xs text-green-950/90 leading-relaxed italic pl-5">
                    "{complaint.adminRemarks}"
                  </p>
                </div>
              )}

              {/* Uploaded Photo Preview */}
              {complaint.photoUrl && (
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">
                    Attached Site Photograph:
                  </span>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-video max-h-48 bg-slate-900">
                    <img
                      src={complaint.photoUrl}
                      alt="Complaint site"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            !error && (
              <div className="text-center py-10 text-slate-400">
                <span className="text-4xl block mb-2">🔎</span>
                <p className="text-sm font-semibold text-slate-600">Enter a Complaint ID above</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  You will see stage-by-stage verification, sanitation crew action, and official resolution updates.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
