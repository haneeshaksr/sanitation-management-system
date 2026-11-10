import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Eye, EyeOff, User, Phone, MapPin, Lock, ShieldCheck, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'villager' | 'admin' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'villager',
  onSuccess,
}) => {
  const { login, register, error, clearError, isLoading, quickLogin } = useAuth();

  const [mode, setMode] = useState<'villager-login' | 'admin-login' | 'register'>(() => {
    if (defaultTab === 'admin') return 'admin-login';
    if (defaultTab === 'register') return 'register';
    return 'villager-login';
  });

  // Form states
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [village, setVillage] = useState('Chandrugudem');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationMsg(null);

    if (mode === 'register') {
      if (!fullName.trim()) {
        setValidationMsg('Please enter your full name.');
        return;
      }
      if (mobileNumber.trim().length < 10) {
        setValidationMsg('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (password.length < 6) {
        setValidationMsg('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setValidationMsg('Passwords do not match.');
        return;
      }

      try {
        await register({
          fullName,
          mobileNumber,
          village,
          password,
          confirmPassword,
        });
        onSuccess?.();
        onClose();
      } catch (err) {
        // error handled by context
      }
    } else {
      if (!mobileNumber.trim() || !password) {
        setValidationMsg('Please enter both mobile number and password.');
        return;
      }

      try {
        await login(mobileNumber, password);
        onSuccess?.();
        onClose();
      } catch (err) {
        // error handled by context
      }
    }
  };

  const setDemoCredentials = (type: 'villager' | 'admin') => {
    clearError();
    setValidationMsg(null);
    if (type === 'admin') {
      setMode('admin-login');
      setMobileNumber('9848012345');
      setPassword('Admin@123');
    } else {
      setMode('villager-login');
      setMobileNumber('9440112233');
      setPassword('Village@123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with clean gradient */}
        <div className="bg-gradient-to-r from-green-800 to-green-600 px-6 py-6 text-white relative">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">🌱</span>
            <span className="font-extrabold text-lg tracking-tight">CleanISS Chandrugudem</span>
          </div>
          <p className="text-xs text-green-100">
            {mode === 'admin-login'
              ? 'Gram Panchayat Administration Portal'
              : mode === 'register'
              ? 'Create New Villager Citizen Account'
              : 'Villager Sanitation Grievance Access'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 mt-4 p-1 bg-black/20 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('villager-login');
                clearError();
                setValidationMsg(null);
              }}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'villager-login'
                  ? 'bg-white text-green-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Villager Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('admin-login');
                clearError();
                setValidationMsg(null);
              }}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'admin-login'
                  ? 'bg-white text-green-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Panchayat Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                clearError();
                setValidationMsg(null);
              }}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-green-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Error & Validation Messages */}
          {(error || validationMsg) && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <span className="font-bold">⚠️</span>
              <span>{error || validationMsg}</span>
            </div>
          )}

          {/* Registration Extra Fields */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. K. Ramesh Babu"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Village *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Chandrugudem"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Mobile Number Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {mode === 'admin-login' ? 'Admin Mobile Number *' : 'Mobile Number *'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none tabular-nums"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-slate-200 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Registration only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all text-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : mode === 'register' ? (
              <span>Register & Access CleanISS</span>
            ) : mode === 'admin-login' ? (
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Login as Panchayat Admin
              </span>
            ) : (
              <span>Login to Dashboard</span>
            )}
          </button>

          {/* Quick Demo Credentials Autofill */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center">
              Quick 1-Click Demo Login:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('villager')}
                className="py-1.5 px-2 bg-green-50 hover:bg-green-100 text-green-900 rounded-lg text-xs font-semibold border border-green-200 transition-colors text-center cursor-pointer"
              >
                Villager Demo
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors text-center cursor-pointer"
              >
                Panchayat Admin Demo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
