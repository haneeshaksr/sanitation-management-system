/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WelcomeHero } from './components/WelcomeHero';
import { VillagerDashboard } from './components/VillagerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { MyComplaintsView } from './components/MyComplaintsView';
import { ReportComplaintModal } from './components/ReportComplaintModal';
import { AuthModal } from './components/AuthModal';
import { TrackComplaintModal } from './components/TrackComplaintModal';
import { CleanlinessAwareness } from './components/CleanlinessAwareness';
import { ToastContainer } from './components/ToastContainer';

function MainApp() {
  const { user } = useAuth();

  const [currentTab, setCurrentTab] = useState<'home' | 'dashboard' | 'my-complaints' | 'track' | 'awareness'>('home');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'villager' | 'admin' | 'register'>('villager');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [trackTargetId, setTrackTargetId] = useState<string>('');

  const handleOpenAuth = (defaultTab: 'villager' | 'admin' | 'register' = 'villager') => {
    setAuthDefaultTab(defaultTab);
    setIsAuthOpen(true);
  };

  const handleOpenReport = () => {
    if (!user) {
      handleOpenAuth('villager');
    } else {
      setIsReportOpen(true);
    }
  };

  const handleTrackComplaint = (complaintId?: string) => {
    setTrackTargetId(complaintId || '');
    setIsTrackOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0FDF4] text-slate-800 antialiased selection:bg-green-200 selection:text-green-900">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'track') {
            handleTrackComplaint();
          } else {
            setCurrentTab(tab as any);
          }
        }}
        onOpenAuth={handleOpenAuth}
        onOpenReport={handleOpenReport}
      />

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {currentTab === 'home' && (
          <WelcomeHero
            onGetStarted={() => {
              if (user) {
                setCurrentTab('dashboard');
              } else {
                handleOpenAuth('villager');
              }
            }}
            onLogin={() => handleOpenAuth('villager')}
            onTrack={() => handleTrackComplaint()}
            onAwareness={() => setCurrentTab('awareness')}
          />
        )}

        {currentTab === 'dashboard' && (
          <>
            {!user ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-green-100 shadow-sm max-w-md mx-auto my-12">
                <span className="text-4xl block mb-3">🔒</span>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Authentication Required
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Please log in with your mobile number to access your dashboard.
                </p>
                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => handleOpenAuth('villager')}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs shadow-sm cursor-pointer"
                  >
                    Villager Login
                  </button>
                  <button
                    onClick={() => handleOpenAuth('admin')}
                    className="w-full py-2.5 bg-green-100 hover:bg-green-200 text-green-900 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Panchayat Admin Login
                  </button>
                </div>
              </div>
            ) : user.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <VillagerDashboard
                onReportComplaint={handleOpenReport}
                onViewMyComplaints={() => setCurrentTab('my-complaints')}
                onTrackComplaint={handleTrackComplaint}
                onViewAwareness={() => setCurrentTab('awareness')}
              />
            )}
          </>
        )}

        {currentTab === 'my-complaints' && (
          <>
            {!user ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-green-100 shadow-sm max-w-md mx-auto my-12">
                <span className="text-4xl block mb-3">📋</span>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Login to View Your Complaints
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Sign in to view your submitted grievances and real-time status updates.
                </p>
                <button
                  onClick={() => handleOpenAuth('villager')}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  Villager Login
                </button>
              </div>
            ) : (
              <MyComplaintsView
                onBack={() => setCurrentTab('dashboard')}
                onTrackComplaint={handleTrackComplaint}
                onNewComplaint={handleOpenReport}
              />
            )}
          </>
        )}

        {currentTab === 'awareness' && <CleanlinessAwareness />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Real-time Overlays */}
      <ReportComplaintModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onComplaintSubmitted={() => {
          // If on dashboard or my-complaints, state auto-refreshes via socket
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultTab={authDefaultTab}
        onSuccess={() => {
          setCurrentTab('dashboard');
        }}
      />

      <TrackComplaintModal
        isOpen={isTrackOpen}
        onClose={() => setIsTrackOpen(false)}
        initialComplaintId={trackTargetId}
      />

      {/* Floating Socket.IO Real-Time Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <MainApp />
      </SocketProvider>
    </AuthProvider>
  );
}
