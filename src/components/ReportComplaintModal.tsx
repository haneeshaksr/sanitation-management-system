import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ComplaintCategory, Complaint } from '../types';
import confetti from 'canvas-confetti';
import {
  X,
  UploadCloud,
  MapPin,
  Calendar,
  Crosshair,
  CheckCircle2,
  Trash2,
  Camera,
  AlertCircle,
} from 'lucide-react';

interface ReportComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplaintSubmitted?: (complaint: Complaint) => void;
}

const CATEGORIES: ComplaintCategory[] = [
  'Waste Accumulation',
  'Drainage Blockage',
  'Overflowing Drains',
  'Water Stagnation',
  'Street Cleanliness',
];

const PRESET_LOCATIONS = [
  'Ramalayam Temple Street',
  'Main Bazaar Road',
  'Near Primary Health Centre (PHC)',
  'Zilla Parishad High School Road',
  'Overhead Water Tank Area (Ward 4)',
  'Panchayat Secretariat Gate',
  'SC Colony Main Lane',
  'Weekly Market Yard',
];

export const ReportComplaintModal: React.FC<ReportComplaintModalProps> = ({
  isOpen,
  onClose,
  onComplaintSubmitted,
}) => {
  const { user, token } = useAuth();

  const [category, setCategory] = useState<ComplaintCategory>('Waste Accumulation');
  const [description, setDescription] = useState('');
  const [village, setVillage] = useState('Chandrugudem');
  const [location, setLocation] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [latitude, setLatitude] = useState<number | null>(16.7335);
  const [longitude, setLongitude] = useState<number | null>(80.6421);
  const [gpsStatus, setGpsStatus] = useState<string>('Location calibrated (Chandrugudem)');
  const [dateTime] = useState<string>(() => new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSubmittedComplaint(null);
      setErrorMessage(null);
      if (user?.village) setVillage(user.village);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Handle GPS detection
  const handleDetectGPS = () => {
    setGpsStatus('Detecting satellite GPS coordinates...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(5)));
          setLongitude(Number(pos.coords.longitude.toFixed(5)));
          setGpsStatus(`GPS Acquired: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`);
        },
        () => {
          // Fallback to Chandrugudem Village GPS center
          setLatitude(16.7335);
          setLongitude(80.6421);
          setGpsStatus('Calibrated to Chandrugudem Village Center (16.7335° N, 80.6421° E)');
        },
        { timeout: 5000 }
      );
    } else {
      setLatitude(16.7335);
      setLongitude(80.6421);
      setGpsStatus('Calibrated to Chandrugudem Village (16.7335° N, 80.6421° E)');
    }
  };

  // Handle photo file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSamplePhoto = (samplePath: string) => {
    setPhotoUrl(samplePath);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!description.trim()) {
      setErrorMessage('Please provide a description of the sanitation issue.');
      return;
    }

    if (!location.trim()) {
      setErrorMessage('Please specify the landmark or street location.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category,
          description,
          village,
          location,
          photoUrl: photoUrl || '/src/assets/images/village_cleanliness_drive_1794321991944.jpg',
          latitude,
          longitude,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit complaint.');
      }

      setSubmittedComplaint(data.complaint);
      onComplaintSubmitted?.(data.complaint);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#16A34A', '#22C55E', '#86EFAC', '#15803D'],
        });
      } catch (e) {
        // confetti fallback
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-800 to-green-600 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <h3 className="text-lg font-bold">Report a Sanitation Complaint</h3>
            </div>
            <p className="text-xs text-green-100 mt-0.5">
              Chandrugudem Gram Panchayat Sanitation Management
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedComplaint ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner animate-bounce">
              🌱
            </div>

            <div>
              <h4 className="text-2xl font-extrabold text-green-950 mb-2">
                Complaint Submitted Successfully! 🌱
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you for contributing to Chandrugudem's cleanliness. Your complaint has been registered in the Panchayat Sanitation Dispatch System.
              </p>
            </div>

            <div className="bg-green-50/80 rounded-2xl p-5 border border-green-200 max-w-md mx-auto text-left space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-green-200 text-xs">
                <span className="text-slate-600 font-medium">Generated Complaint ID</span>
                <span className="font-extrabold text-green-900 text-base font-mono tabular-nums">
                  #{submittedComplaint.complaintId}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Category:</span>
                <span className="font-semibold text-slate-800">{submittedComplaint.category}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Location:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                  {submittedComplaint.location}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Current Status:</span>
                <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  🟡 Pending Review
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSubmittedComplaint(null);
                  setDescription('');
                  setLocation('');
                  setPhotoUrl('');
                }}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-green-800 bg-green-100 hover:bg-green-200 rounded-xl transition-colors cursor-pointer"
              >
                + Report Another Issue
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-md transition-all cursor-pointer"
              >
                View in My Complaints
              </button>
            </div>
          </div>
        ) : (
          /* Form Content */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                1. Complaint Category *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all border cursor-pointer flex items-center justify-between ${
                      category === cat
                        ? 'border-green-600 bg-green-50/80 text-green-900 shadow-xs'
                        : 'border-slate-200 hover:border-green-300 text-slate-700'
                    }`}
                  >
                    <span>{cat}</span>
                    {category === cat && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                2. Complaint Description *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail (e.g., Overflowing trash blocking road entrance near water tank, foul smell, urgent clearance needed)"
                className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none"
              />
            </div>

            {/* Village & Location Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  3. Village *
                </label>
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Chandrugudem"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  4. Location / Landmark *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Near Ramalayam Temple Street"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none"
                />
              </div>
            </div>

            {/* Preset Location Suggestions */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 mb-1 block">
                Quick Landmark Suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_LOCATIONS.slice(0, 5).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-green-100 text-slate-700 hover:text-green-900 transition-colors cursor-pointer"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Issue Photograph Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                5. Upload Issue Photograph
              </label>

              {photoUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-green-200 aspect-video max-h-48 bg-slate-900">
                  <img
                    src={photoUrl}
                    alt="Sanitation issue preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-colors cursor-pointer"
                    title="Remove photograph"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded">
                    Photo attached
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="border-2 border-dashed border-green-200 hover:border-green-400 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-green-50/40 hover:bg-green-50 transition-colors">
                    <UploadCloud className="w-6 h-6 text-green-600" />
                    <span className="text-xs font-semibold text-slate-700">
                      Click to upload photo from your device or camera
                    </span>
                    <span className="text-[10px] text-slate-500">
                      PNG, JPG, JPEG up to 10MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>Or attach village scene sample:</span>
                    <button
                      type="button"
                      onClick={() => handleUseSamplePhoto('/src/assets/images/village_cleanliness_drive_1794321991944.jpg')}
                      className="text-green-700 hover:underline font-medium cursor-pointer"
                    >
                      Bazaar square photo
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => handleUseSamplePhoto('/src/assets/images/hero_chandrugudem_village_1794321990689.jpg')}
                      className="text-green-700 hover:underline font-medium cursor-pointer"
                    >
                      Street scene photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Date & Time + GPS Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                <Calendar className="w-4 h-4 text-green-700 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-500 block">Report Timestamp</span>
                  <span className="font-semibold text-slate-800">{dateTime}</span>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="w-full flex items-center justify-between text-xs bg-slate-50 hover:bg-green-50 border border-slate-200 hover:border-green-300 p-2.5 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-green-600" />
                    <div>
                      <span className="text-[10px] text-slate-500 block">GPS Coordinates</span>
                      <span className="font-bold text-green-900 font-mono text-[11px] tabular-nums">
                        {latitude?.toFixed(4)}° N, {longitude?.toFixed(4)}° E
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-green-700 font-semibold underline">
                    Calibrate
                  </span>
                </button>
                <span className="text-[10px] text-slate-500 block px-1">{gpsStatus}</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-2xl shadow-lg transition-all text-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Registering Complaint in System...' : 'SUBMIT COMPLAINT 🌱'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
