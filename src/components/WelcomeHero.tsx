import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ComplaintStats } from '../types';
import { ArrowRight, CheckCircle2, ShieldAlert, Sparkles, MapPin, Eye, FileText } from 'lucide-react';

interface WelcomeHeroProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onTrack: () => void;
  onAwareness: () => void;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  onGetStarted,
  onLogin,
  onTrack,
  onAwareness,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ComplaintStats>({
    total: 5,
    pending: 2,
    inProgress: 1,
    resolved: 2,
    resolutionRate: 40,
  });

  useEffect(() => {
    fetch('/api/public-stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch((err) => console.error('Error fetching public stats:', err));
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section with Indian Village Background & Green Gradient Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-green-200">
        
        {/* Village Background Photography */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_chandrugudem_village_1794321990689.jpg"
            alt="Pristine clean road and surroundings in Chandrugudem village"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-[0.88]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-950/92 via-green-900/80 to-green-950/65" />
        </div>

        {/* Floating Decorative Leaf Elements */}
        <div className="absolute top-8 right-12 z-10 pointer-events-none opacity-40 animate-float-leaf text-4xl hidden sm:block">
          🍃
        </div>
        <div className="absolute bottom-16 right-1/4 z-10 pointer-events-none opacity-30 animate-float-leaf text-3xl hidden md:block" style={{ animationDelay: '2s' }}>
          🌿
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-4xl px-6 py-16 sm:px-12 sm:py-20 lg:py-24 text-white">
          
          {/* Welcome Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-green-100 mb-6 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Welcome to CleanISS</span>
            <span className="text-white/60">·</span>
            <span className="flex items-center gap-1 text-green-200">
              <MapPin className="w-3 h-3" /> Chandrugudem, NTR Dist
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-4 text-balance">
            Welcome to Our Cleanliness Program 🌿
          </h1>

          <p className="text-lg sm:text-2xl font-medium text-emerald-100 mb-4 max-w-2xl leading-snug">
            Let's Make Chandrugudem a Cleaner, Greener, and Healthier Village Together!
          </p>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-green-100/90 max-w-xl mb-8 leading-relaxed">
            Report sanitation issues. Track complaints. Build a cleaner community.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            {user ? (
              <button
                onClick={onGetStarted}
                className="px-6 py-3.5 bg-green-500 hover:bg-green-400 text-green-950 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer text-sm"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={onGetStarted}
                  className="px-6 py-3.5 bg-white text-green-900 hover:bg-green-50 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer text-sm"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onLogin}
                  className="px-6 py-3.5 bg-green-800/80 hover:bg-green-800 text-white font-semibold rounded-xl border border-white/25 backdrop-blur-sm transition-all cursor-pointer text-sm"
                >
                  Login
                </button>
              </>
            )}

            <button
              onClick={onTrack}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 backdrop-blur-sm transition-all flex items-center gap-2 cursor-pointer text-sm"
            >
              <Eye className="w-4 h-4" />
              Track Complaint
            </button>
          </div>

          {/* Verification markers */}
          <div className="mt-10 pt-6 border-t border-white/15 flex flex-wrap items-center gap-6 text-xs text-green-200">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Direct Panchayat Dispatch
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Real-Time Status Notifications
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Photo & Location Verification
            </span>
          </div>
        </div>
      </div>

      {/* Key Village Cleanliness Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Complaints
          </div>
          <div className="text-3xl font-extrabold text-green-950 tabular-nums">
            {stats.total}
          </div>
          <div className="text-xs text-green-700 mt-1">Reported by villagers</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            Pending Review
          </div>
          <div className="text-3xl font-extrabold text-amber-600 tabular-nums">
            {stats.pending}
          </div>
          <div className="text-xs text-slate-500 mt-1">Awaiting inspection</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
            In Action / Progress
          </div>
          <div className="text-3xl font-extrabold text-blue-600 tabular-nums">
            {stats.inProgress}
          </div>
          <div className="text-xs text-slate-500 mt-1">Sanitation crew assigned</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            Resolved Cleanliness
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 tabular-nums">
            {stats.resolved}
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-1">
            {stats.resolutionRate}% Resolution Rate
          </div>
        </div>
      </div>

      {/* Program Highlights & Realistic Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Sanitation Drive Visual Card */}
        <div className="bg-white rounded-3xl border border-green-100 p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 bg-green-50 px-3 py-1 rounded-md mb-3">
              <Sparkles className="w-3.5 h-3.5 text-green-600" />
              Community Driven Cleanliness
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Chandrugudem Cleanliness Drive & Waste Segregation
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Regular door-to-door solid waste segregation into Wet, Dry, and Hazardous categories keeps the village pathways, irrigation canals, and school perimeters free of debris.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-green-100 aspect-video mb-4">
            <img
              src="/src/assets/images/village_cleanliness_drive_1794321991944.jpg"
              alt="Clean Indian village square in Andhra Pradesh with waste segregation bins"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <button
            onClick={onAwareness}
            className="w-full py-2.5 text-xs font-semibold text-green-800 bg-green-50 hover:bg-green-100 rounded-xl transition-colors cursor-pointer text-center"
          >
            Read Village Waste Segregation Guidelines →
          </button>
        </div>

        {/* Gram Panchayat Office & Redressal Mechanism */}
        <div className="bg-white rounded-3xl border border-green-100 p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 bg-green-50 px-3 py-1 rounded-md mb-3">
              <ShieldAlert className="w-3.5 h-3.5 text-green-600" />
              Gram Panchayat Administration
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Fast-Track Redressal by Chandrugudem Panchayat
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Complaints submitted on CleanISS are directly routed to the Panchayat Secretary and Sanitation Inspector for swift inspection, machinery deployment, and disinfection.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-green-100 aspect-video mb-4">
            <img
              src="/src/assets/images/panchayat_office_building_1794321991895.jpg"
              alt="Chandrugudem Gram Panchayat building"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-900 block">Inspection Window</span>
              <span className="text-slate-500">Within 4 to 12 Hours</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-900 block">Sanitation Fleet</span>
              <span className="text-slate-500">Tractors, Rickshaws & Tankers</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Core Complaint Categories Preview */}
      <div className="bg-gradient-to-b from-green-50 to-white rounded-3xl p-8 border border-green-100">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-green-700">
            Common Sanitation Issues
          </span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            What Issues Can You Report on CleanISS?
          </h3>
          <p className="text-xs text-slate-500 mt-2">
            Click on any category to report an issue directly with photo and location
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              title: 'Waste Accumulation',
              desc: 'Garbage heaps on roads, bazaar waste, plastic dumping',
              icon: '🗑️',
            },
            {
              title: 'Drainage Blockage',
              desc: 'Choked underground drains, silt buildup, bad odor',
              icon: '🚰',
            },
            {
              title: 'Overflowing Drains',
              desc: 'Sewage overflowing onto streets & house entrances',
              icon: '🌊',
            },
            {
              title: 'Water Stagnation',
              desc: 'Puddles after rain, mosquito breeding spots near schools',
              icon: '🦟',
            },
            {
              title: 'Street Cleanliness',
              desc: 'Dust, dried leaves, dead animal disposal, sweeping',
              icon: '🧹',
            },
          ].map((cat, idx) => (
            <div
              key={idx}
              onClick={onGetStarted}
              className="bg-white p-5 rounded-2xl border border-green-100 hover:border-green-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <h4 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-green-700">
                  {cat.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-green-700 flex items-center gap-1">
                Report this <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
