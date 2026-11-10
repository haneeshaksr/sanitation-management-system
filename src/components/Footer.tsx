import React from 'react';
import { Phone, MapPin, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-green-950 text-green-100 border-t border-green-900 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Village Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold text-white tracking-tight">CleanISS</span>
            </div>
            <p className="text-sm text-green-200/80 leading-relaxed max-w-md">
              Smart Village Cleanliness Program for Chandrugudem Gram Panchayat, Mylavaram Mandal, NTR District, Andhra Pradesh. Empowering villagers with instant reporting and real-time grievance tracking for a healthier community.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-green-300">
              <MapPin className="w-4 h-4 text-green-400 shrink-0" />
              <span>Gram Panchayat Secretariat, Main Road, Chandrugudem - 521230</span>
            </div>
          </div>

          {/* Emergency & Helplines */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Sanitation Helplines
            </h4>
            <ul className="space-y-2 text-xs text-green-200/90">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-green-400" />
                <span>Panchayat Secretary: <strong>98480 12345</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-green-400" />
                <span>Sanitation Inspector: <strong>94401 98765</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-green-400" />
                <span>AP Swachh Sankalpam: <strong>14420</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-green-400" />
                <span>Spandana CM Helpline: <strong>1902</strong></span>
              </li>
            </ul>
          </div>

          {/* Government Initiatives */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Initiatives & Standards
            </h4>
            <ul className="space-y-2 text-xs text-green-200/80">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>Swachh Andhra Pradesh Gramin</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>100% Segregated Waste Collection</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>Zero Stagnant Water Target</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span>Weekly Drain Desilting</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-green-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-green-300/70 gap-4">
          <p>© 2026 Chandrugudem Gram Panchayat. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" /> for Rural Cleanliness & Public Health
          </p>
        </div>
      </div>
    </footer>
  );
};
