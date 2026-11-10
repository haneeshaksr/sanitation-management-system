import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Bell, Shield, LogOut, CheckCircle, Clock } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: (defaultTab?: 'villager' | 'admin' | 'register') => void;
  onOpenReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuth,
  onOpenReport,
}) => {
  const { user, logout, quickLogin } = useAuth();
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead, isConnected } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element Brand Zone */}
        <button
          onClick={() => setCurrentTab('home')}
          className="text-left flex items-center gap-2 group cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-700 to-green-500 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            🌱
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-green-900 group-hover:text-green-700 transition-colors whitespace-nowrap shrink-0">
              CleanISS
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-green-700 -mt-1 hidden sm:block">
              Chandrugudem Village
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setCurrentTab('home')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentTab === 'home'
                ? 'text-green-700 font-semibold border-b-2 border-green-600 pb-0.5'
                : 'hover:text-green-800'
            }`}
          >
            Home
          </button>

          {user && (
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'text-green-700 font-semibold border-b-2 border-green-600 pb-0.5'
                  : 'hover:text-green-800'
              }`}
            >
              {user.role === 'admin' ? 'Admin Console' : 'Villager Dashboard'}
            </button>
          )}

          {user?.role === 'villager' && (
            <button
              onClick={() => setCurrentTab('my-complaints')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentTab === 'my-complaints'
                  ? 'text-green-700 font-semibold border-b-2 border-green-600 pb-0.5'
                  : 'hover:text-green-800'
              }`}
            >
              My Complaints
            </button>
          )}

          <button
            onClick={() => setCurrentTab('track')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentTab === 'track'
                ? 'text-green-700 font-semibold border-b-2 border-green-600 pb-0.5'
                : 'hover:text-green-800'
            }`}
          >
            Track Complaint
          </button>

          <button
            onClick={() => setCurrentTab('awareness')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentTab === 'awareness'
                ? 'text-green-700 font-semibold border-b-2 border-green-600 pb-0.5'
                : 'hover:text-green-800'
            }`}
          >
            Cleanliness Awareness
          </button>
        </nav>

        {/* Zone 3: Actions & Auth */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Socket live status */}
          <div
            title={isConnected ? 'Real-Time Updates Active' : 'Connecting...'}
            className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium px-2.5 py-1 bg-green-50 rounded-lg border border-green-200"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-600' : 'bg-amber-400'
              }`}
            />
            <span className="text-[11px] text-green-800">
              {isConnected ? 'Live Sync' : 'Connecting'}
            </span>
          </div>

          {user ? (
            <>
              {/* Notification Popover */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="View notifications"
                  className="relative p-2 text-slate-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-green-100 py-2 z-50 text-slate-800">
                    <div className="px-4 py-2 border-b border-green-50 flex items-center justify-between">
                      <div className="font-semibold text-sm text-green-950">Notifications</div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-xs text-green-700 hover:text-green-900 font-medium cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-green-50">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => {
                              markNotificationAsRead(notif._id);
                              setCurrentTab(user.role === 'admin' ? 'dashboard' : 'my-complaints');
                              setShowNotifications(false);
                            }}
                            className={`p-3 text-xs cursor-pointer transition-colors ${
                              notif.read ? 'bg-white hover:bg-slate-50' : 'bg-green-50/70 hover:bg-green-100/70 font-medium'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {notif.message.includes('Resolved') ? (
                                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className="text-slate-700 leading-snug">{notif.message}</p>
                                <span className="text-[10px] text-slate-400 block mt-1 tabular-nums">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Primary action button */}
              {user.role === 'villager' ? (
                <button
                  onClick={onOpenReport}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
                >
                  + Report Issue
                </button>
              ) : (
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-green-800 hover:bg-green-900 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin Panel
                </button>
              )}

              {/* User badge & logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-green-200">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-green-900 leading-tight truncate max-w-[120px]">
                    {user.fullName.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-green-600 font-medium">
                    {user.role === 'admin' ? 'Panchayat Admin' : 'Villager'}
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('villager')}
                className="px-3 py-1.5 text-xs font-semibold text-green-800 hover:bg-green-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Register
              </button>
              <button
                onClick={() => quickLogin('admin')}
                title="Quick demo access as Panchayat Secretary"
                className="hidden xl:inline-flex px-2.5 py-1.5 text-[11px] font-medium text-green-900 bg-green-100 hover:bg-green-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Admin Demo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden border-t border-green-100 px-4 py-2 flex items-center justify-around text-xs font-medium text-slate-600 overflow-x-auto">
        <button
          onClick={() => setCurrentTab('home')}
          className={`px-2 py-1 ${currentTab === 'home' ? 'text-green-700 font-bold' : ''}`}
        >
          Home
        </button>
        {user && (
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-2 py-1 ${currentTab === 'dashboard' ? 'text-green-700 font-bold' : ''}`}
          >
            Dashboard
          </button>
        )}
        {user?.role === 'villager' && (
          <button
            onClick={() => setCurrentTab('my-complaints')}
            className={`px-2 py-1 ${currentTab === 'my-complaints' ? 'text-green-700 font-bold' : ''}`}
          >
            Complaints
          </button>
        )}
        <button
          onClick={() => setCurrentTab('track')}
          className={`px-2 py-1 ${currentTab === 'track' ? 'text-green-700 font-bold' : ''}`}
        >
          Track
        </button>
        <button
          onClick={() => setCurrentTab('awareness')}
          className={`px-2 py-1 ${currentTab === 'awareness' ? 'text-green-700 font-bold' : ''}`}
        >
          Awareness
        </button>
      </div>
    </header>
  );
};
