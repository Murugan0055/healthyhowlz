import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  X, 
  UserCheck, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  Calendar, 
  CheckCircle, 
  Coins,
  Phone
} from 'lucide-react';
import { api } from '../services/api';

export default function ManualCheckinModal({ isOpen, onClose, onCheckinComplete }) {
  // Officer PIN Auth state (PIN gate) - requires PIN fresh on EVERY open
  const [pin, setPin] = useState('');
  const [isPinAuthenticated, setIsPinAuthenticated] = useState(false);
  const [authenticatedOfficer, setAuthenticatedOfficer] = useState(null);
  const [pinError, setPinError] = useState('');

  // Member Search state
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [officerNotes, setOfficerNotes] = useState('Front desk verbal verification');

  // Security gate: Always force PIN entry fresh on every manual check-in click
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setIsPinAuthenticated(false);
      setAuthenticatedOfficer(null);
      setPinError('');
      setQuery('');
      setSearchResults([]);
      setSelectedMember(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setPin('');
    setIsPinAuthenticated(false);
    setAuthenticatedOfficer(null);
    setPinError('');
    setQuery('');
    setSearchResults([]);
    setSelectedMember(null);
    onClose();
  };

  const handlePinSubmit = async (e) => {
    e?.preventDefault();
    if (pin.length < 4) {
      setPinError('Please enter a 4-digit security PIN');
      return;
    }

    setLoading(true);
    setPinError('');
    try {
      const result = await api.verifyManualPin(query || '', pin);
      if (result.success) {
        setIsPinAuthenticated(true);
        setAuthenticatedOfficer(result.officer);
        if (result.members) {
          setSearchResults(result.members);
        }
      } else {
        setPinError(result.message || 'Invalid Officer PIN');
      }
    } catch (err) {
      setPinError('PIN verification failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (val) => {
    setQuery(val);
    const searchVal = (val || '').trim();

    try {
      // Pass searchVal (or empty string if cleared) so backend always returns matching or all members
      const result = await api.verifyManualPin(searchVal, pin);
      if (result.success && result.members) {
        setSearchResults(result.members);
      }
    } catch (e) {
      console.error('Search error:', e);
    }
  };

  const handleClearSearch = async () => {
    setQuery('');
    try {
      const result = await api.verifyManualPin('', pin);
      if (result.success && result.members) {
        setSearchResults(result.members);
      }
    } catch (e) {
      console.error('Clear search error:', e);
    }
  };

  const handleConfirmCheckin = async (member) => {
    setLoading(true);
    try {
      const payload = {
        memberId: member.id,
        officerId: authenticatedOfficer?.id || 'staff-front-desk',
        officerName: authenticatedOfficer?.name || 'Priya V (Front Desk)',
        notes: officerNotes
      };
      const checkinResult = await api.confirmManualCheckin(payload);

      // Force PIN prompt next time by wiping security authorization immediately
      setPin('');
      setIsPinAuthenticated(false);
      setAuthenticatedOfficer(null);
      setPinError('');
      setQuery('');
      setSearchResults([]);
      setSelectedMember(null);

      onClose();
      onCheckinComplete(checkinResult);
    } catch (e) {
      alert('Manual check-in failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="relative w-full max-w-xl bg-[#111827] border-2 border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-8 text-white overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold brand-font text-white flex items-center gap-2">
                Protected Manual Check-In
              </h3>
              <p className="text-xs text-slate-400">
                Front Officer Security Gate • Audit Trail Logged
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: PIN Authentication Gate (if not yet authenticated) */}
        {!isPinAuthenticated ? (
          <div className="my-6">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 mb-2 border border-amber-500/20">
                <Lock className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Officer Security Authorization</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Enter your 4-digit Officer PIN to unlock manual overrides and prevent unauthorized entries.
              </p>
              <p className="text-[11px] text-emerald-400/80 mt-1 font-mono">
                (Default Desk PIN: 1234 or Owner PIN: 9999)
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="max-w-xs mx-auto space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-3xl tracking-[0.5em] font-mono py-3 rounded-xl bg-slate-900 border-2 border-slate-700 focus:border-emerald-500 focus:outline-none text-emerald-400"
                />
                {pinError && (
                  <p className="text-xs text-rose-400 text-center mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || pin.length < 4}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
              >
                {loading ? 'Verifying...' : 'Unlock Manual Check-In'}
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: Member Search & ID Photo Verification */
          <div className="my-4 space-y-4">
            
            {/* Officer Audit Badge */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Authorized Officer:</span>
                <span className="font-bold text-emerald-300">{authenticatedOfficer?.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                Audit Log Active
              </span>
            </div>

            {/* Search Input: Name or last 4 digits of phone */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type member's name or last 4 digits of phone..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-emerald-500 focus:outline-none text-sm text-white placeholder-slate-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Clear search (show all members)"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Members Count Header */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
              <span className="font-semibold">
                {query ? `Matching Search Results (${searchResults.length})` : `All Registered Members (${searchResults.length})`}
              </span>
              {query && (
                <button
                  onClick={handleClearSearch}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  Clear filter & show all
                </button>
              )}
            </div>

            {/* Search Results / Visual Member ID Photo Verification */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {searchResults.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  {query ? (
                    <>
                      No registered members match "{query}".{' '}
                      <button onClick={handleClearSearch} className="text-emerald-400 underline ml-1 font-semibold">
                        Show all members
                      </button>
                    </>
                  ) : (
                    'No members registered in the gym system yet.'
                  )}
                </div>
              )}

              {searchResults.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-4 transition-all"
                >
                  {/* Photo & Member details */}
                  <div className="flex items-center gap-3">
                    <img
                      src={mem.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                      alt={mem.name}
                      className="w-14 h-14 rounded-xl object-cover border-2 border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-white">{mem.name}</h5>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-300 border border-slate-700">
                          {mem.member_code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{mem.phone}</span>
                      </p>
                      <p className="text-[11px] text-emerald-400 font-semibold">{mem.plan_title || mem.plan_name}</p>
                    </div>
                  </div>

                  {/* Confirm Checkin Button */}
                  <button
                    onClick={() => handleConfirmCheckin(mem)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-xs text-slate-950 shadow-md shadow-emerald-500/20 transition-all flex-shrink-0"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Confirm</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Officer Notes */}
            <div className="pt-2">
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                Audit Override Note (Logged with your Staff ID):
              </label>
              <input
                type="text"
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                placeholder="e.g. Phone battery died, verified face at desk"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-slate-600"
              />
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

