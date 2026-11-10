import React, { useEffect, useState } from 'react';
import { AwarenessData } from '../types';
import {
  Trash2,
  Calendar,
  Phone,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  HeartPulse,
  Droplet,
  Sparkles,
} from 'lucide-react';

export const CleanlinessAwareness: React.FC = () => {
  const [data, setData] = useState<AwarenessData | null>(null);
  const [activeBinTab, setActiveBinTab] = useState<'wet' | 'dry' | 'hazardous'>('wet');

  useEffect(() => {
    fetch('/api/awareness')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((err) => console.error('Failed to load awareness data:', err));
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      
      {/* Awareness Header */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-green-700">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-green-100 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Swachh Andhra Pradesh Gramin Initiative</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Cleanliness & Public Hygiene Guidelines 🌿
          </h2>
          <p className="text-xs sm:text-sm text-green-100/90 leading-relaxed">
            Preserving Chandrugudem's village environment starts in every household. Learn how segregating your garbage, eliminating stagnant rainwater, and adhering to the morning waste collection schedule protects our families from diseases like dengue, malaria, and typhoid.
          </p>
        </div>
      </div>

      {/* 3-Bin Waste Segregation System */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-100 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-green-700">
            Source Segregation at Home
          </span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            The 3-Bin Waste Segregation System
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Always segregate waste before handing it over to the Panchayat sanitation rickshaws.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mb-8 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveBinTab('wet')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeBinTab === 'wet'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🟢 Wet Waste (Green)
          </button>
          <button
            onClick={() => setActiveBinTab('dry')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeBinTab === 'dry'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔵 Dry Waste (Blue)
          </button>
          <button
            onClick={() => setActiveBinTab('hazardous')}
            className={`py-2 rounded-xl transition-all cursor-pointer ${
              activeBinTab === 'hazardous'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔴 Hazardous (Red)
          </button>
        </div>

        {/* Bin Content Display */}
        <div className="max-w-2xl mx-auto">
          {activeBinTab === 'wet' && (
            <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🥬</span>
                <div>
                  <h4 className="text-base font-bold text-emerald-950">
                    Wet & Organic Waste (Green Bin)
                  </h4>
                  <p className="text-xs text-emerald-800">
                    Biodegradable waste that naturally decomposes into organic compost for Chandrugudem farmland.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-emerald-900">
                <div className="font-bold uppercase tracking-wider text-[11px] text-emerald-700">
                  Allowed Items:
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Vegetable & fruit peels
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Leftover cooked rice & curry
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Tea powder & coffee grounds
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Garden leaves & coconut shells
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                <span className="font-semibold">Processing Destination:</span>
                <span className="font-bold text-emerald-700">Chandrugudem Vermicompost Yard</span>
              </div>
            </div>
          )}

          {activeBinTab === 'dry' && (
            <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📦</span>
                <div>
                  <h4 className="text-base font-bold text-blue-950">
                    Dry & Recyclable Waste (Blue Bin)
                  </h4>
                  <p className="text-xs text-blue-800">
                    Non-biodegradable items that can be collected, baled, and recycled into new raw materials.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-blue-900">
                <div className="font-bold uppercase tracking-wider text-[11px] text-blue-700">
                  Allowed Items:
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    Plastic bottles & milk packets
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    Cardboard boxes & paper
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    Glass bottles & metal cans
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    Packaging materials & wrappers
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-white rounded-xl border border-blue-200 text-xs text-blue-950 flex items-center justify-between">
                <span className="font-semibold">Processing Destination:</span>
                <span className="font-bold text-blue-700">Solid Waste Processing Centre (Mylavaram)</span>
              </div>
            </div>
          )}

          {activeBinTab === 'hazardous' && (
            <div className="p-6 rounded-2xl bg-red-50/60 border border-red-200 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <h4 className="text-base font-bold text-red-950">
                    Hazardous & Sanitary Waste (Red Bin)
                  </h4>
                  <p className="text-xs text-red-800">
                    Items posing biological or chemical risk that must NEVER be mixed with regular manure or water drains.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-red-900">
                <div className="font-bold uppercase tracking-wider text-[11px] text-red-700">
                  Allowed Items:
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-red-600" />
                    Sanitary pads & baby diapers
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-red-600" />
                    Expired pills & syrup bottles
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-red-600" />
                    Empty pesticide & fertilizer tins
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-red-600" />
                    Torch batteries & tube lights
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-white rounded-xl border border-red-200 text-xs text-red-950 flex items-center justify-between">
                <span className="font-semibold">Processing Destination:</span>
                <span className="font-bold text-red-700">Scientific Incinerator Unit</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Disease Prevention & Stagnant Water Advisory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-green-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-green-900 font-bold text-base">
            <HeartPulse className="w-5 h-5 text-red-500" />
            <span>Prevent Mosquito-Borne Fevers</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Stagnant water in empty coconut shells, used tires, or roadside pits leads to breeding of Aedes and Anopheles mosquitoes that transmit Dengue, Chikungunya, and Malaria.
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">1.</span>
              <span>Turn over empty containers, pots, and tires around your house to avoid rainwater pooling.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">2.</span>
              <span>Clean and scrub overhead water storage tanks and sumps once every Sunday (Dry Day).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">3.</span>
              <span>Report any street water accumulation immediately on CleanISS for suction clearance.</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-green-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-green-900 font-bold text-base">
            <Droplet className="w-5 h-5 text-blue-600" />
            <span>Safe Village Drinking Water & Drainage</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Keeping roadside stormwater drains free of plastic ensures wastewater drains away freely and doesn't contaminate village borewells and drinking water taps.
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">1.</span>
              <span>Never dump plastic polythene bags into roadside open drains.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">2.</span>
              <span>Do not channel household septic overflows into open storm drains.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">3.</span>
              <span>Sanitation staff apply lime and bleaching powder twice every week along open drains.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Chandrugudem Sanitation Schedule */}
      {data && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-green-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-green-700" />
            <h3 className="text-lg font-bold text-slate-900">
              Chandrugudem Gram Panchayat Sanitation Timetable
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.schedule.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-green-50/40 border border-green-100">
                <span className="font-bold text-xs text-green-950 block mb-1">
                  📅 {item.day}
                </span>
                <p className="text-xs text-slate-600">{item.task}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helplines Strip */}
      {data && (
        <div className="bg-gradient-to-br from-green-950 to-green-900 text-white rounded-3xl p-6 sm:p-8 border border-green-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-green-300">
                Direct Contact
              </span>
              <h3 className="text-xl font-bold mt-1">
                Sanitation Emergency Helplines
              </h3>
              <p className="text-xs text-green-200 mt-1">
                Reach out to Chandrugudem Gram Panchayat officers for immediate assistance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {data.helplineNumbers.map((hl, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white/10 rounded-xl border border-white/15 flex items-center justify-between gap-3"
                >
                  <span className="text-green-100">{hl.label}:</span>
                  <span className="font-bold font-mono text-emerald-300 tabular-nums">{hl.phone}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
