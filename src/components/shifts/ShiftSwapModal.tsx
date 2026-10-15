'use client';

import React, { useState, useMemo } from 'react';
import { User, Shift, ShiftSwap, ConflictCheckResult } from '@/lib/types';
import { checkShiftSwapConflict } from '@/lib/conflict-checker';
import { useToast } from '@/components/ui/Toast';
import { formatRosterShiftTime } from '@/lib/utils';
import { 
  X, 
  Search, 
  Check, 
  ArrowRightLeft, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck
} from 'lucide-react';

interface ShiftSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  allUsers: User[];
  allShifts: Shift[];
  initialShiftId?: string;
  onSwapCreated: (newSwap: ShiftSwap) => void;
}

const REASON_PRESETS = [
  'Doctor / Medical Appointment',
  'Family Event / Obligation',
  'Transport / Commute Issue',
  'Personal Study / Exam',
];

export function ShiftSwapModal({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  allShifts,
  initialShiftId,
  onSwapCreated,
}: ShiftSwapModalProps) {
  const { toast } = useToast();

  const mySwappableShifts = useMemo(() => {
    return allShifts.filter((s) => s.userId === currentUser.id && s.status !== 'COMPLETED');
  }, [allShifts, currentUser.id]);

  const [selectedMyShiftId, setSelectedMyShiftId] = useState<string>(
    initialShiftId || (mySwappableShifts[0]?.id ?? '')
  );

  const [searchName, setSearchName] = useState('');
  const [selectedPeerId, setSelectedPeerId] = useState<string>('');
  const [selectedPeerShiftId, setSelectedPeerShiftId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter peers by name (excluding self and admins)
  const candidatePeers = useMemo(() => {
    const q = searchName.trim().toLowerCase();
    return allUsers.filter((u) => {
      if (u.id === currentUser.id) return false;
      if (u.role === 'ADMIN') return false;
      if (!q) return true;
      return u.name.toLowerCase().includes(q) || u.agentId.toLowerCase().includes(q);
    });
  }, [allUsers, currentUser.id, searchName]);

  const selectedPeer = useMemo(() => {
    return allUsers.find((u) => u.id === selectedPeerId);
  }, [allUsers, selectedPeerId]);

  const peerShifts = useMemo(() => {
    if (!selectedPeerId) return [];
    return allShifts.filter((s) => s.userId === selectedPeerId && s.status !== 'COMPLETED');
  }, [allShifts, selectedPeerId]);

  const mySelectedShift = useMemo(() => {
    return allShifts.find((s) => s.id === selectedMyShiftId);
  }, [allShifts, selectedMyShiftId]);

  const peerSelectedShift = useMemo(() => {
    return allShifts.find((s) => s.id === selectedPeerShiftId);
  }, [allShifts, selectedPeerShiftId]);

  // Conflict validation
  const conflictResult: ConflictCheckResult | null = useMemo(() => {
    if (!mySelectedShift || !selectedPeer || !peerSelectedShift) {
      return null;
    }

    const myAllShifts = allShifts.filter((s) => s.userId === currentUser.id);
    const peerAllShifts = allShifts.filter((s) => s.userId === selectedPeer.id);

    return checkShiftSwapConflict(
      currentUser,
      mySelectedShift,
      myAllShifts,
      selectedPeer,
      peerSelectedShift,
      peerAllShifts
    );
  }, [currentUser, mySelectedShift, selectedPeer, peerSelectedShift, allShifts]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!mySelectedShift) {
      toast({ type: 'warning', title: 'Please choose which shift you want to give away' });
      return;
    }
    if (!selectedPeer) {
      toast({ type: 'warning', title: 'Please select a colleague to swap with' });
      return;
    }
    if (!peerSelectedShift) {
      toast({ type: 'warning', title: "Please choose which of your colleague's shifts you want to take" });
      return;
    }
    if (!reason.trim()) {
      toast({ type: 'warning', title: 'Please enter a quick reason for the swap' });
      return;
    }

    setIsSubmitting(true);

    const newSwap: ShiftSwap = {
      id: `swp-${Date.now().toString().slice(-4)}`,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterAgentId: currentUser.agentId,
      requesterShiftId: mySelectedShift.id,
      requesterShift: mySelectedShift,
      requesterGroup: currentUser.shiftGroup,
      requesterShiftCode: mySelectedShift.shiftCode || '8',

      targetPeerId: selectedPeer.id,
      targetPeerName: selectedPeer.name,
      targetPeerAgentId: selectedPeer.agentId,
      targetShiftId: peerSelectedShift.id,
      targetShift: peerSelectedShift,
      targetGroup: selectedPeer.shiftGroup,
      targetShiftCode: peerSelectedShift.shiftCode || '8',

      status: 'PENDING_PEER',
      swapReason: reason.trim(),
      conflictCheckPassed: !conflictResult?.hasConflict,
      conflictDetails: conflictResult || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      onSwapCreated(newSwap);
      setIsSubmitting(false);
      toast({
        type: 'success',
        title: 'Swap Request Sent!',
        message: `Your request was sent to ${selectedPeer.name}. Once they accept, your Team Leader will approve it.`,
      });
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
              Request Shift Swap
            </h2>
            <p className="text-xs text-slate-500">
              Exchange shifts with a Contact Center colleague in 3 simple steps
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Step 1: Your Shift */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Your shift to give away
            </label>
            <select
              value={selectedMyShiftId}
              onChange={(e) => setSelectedMyShiftId(e.target.value)}
              className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {mySwappableShifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shiftDate} • {formatRosterShiftTime(s)}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Choose Colleague by Name */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Choose colleague to swap with
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Type colleague name (e.g. Sarah, Marcus, Elena)..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Colleague Quick Picker Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pt-1 pr-1">
              {candidatePeers.slice(0, 6).map((peer) => {
                const isSelected = selectedPeerId === peer.id;
                return (
                  <button
                    key={peer.id}
                    type="button"
                    onClick={() => {
                      setSelectedPeerId(peer.id);
                      setSelectedPeerShiftId('');
                    }}
                    className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={peer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={peer.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{peer.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{peer.shiftGroup}</p>
                    </div>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Colleague's Shift to Take */}
          {selectedPeer && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Choose {selectedPeer.name.split(' ')[0]}&apos;s shift to take
              </label>
              {peerShifts.length === 0 ? (
                <p className="p-3 bg-amber-50 rounded-2xl text-xs text-amber-700 border border-amber-200">
                  {selectedPeer.name} has no available upcoming shifts in this rotation.
                </p>
              ) : (
                <select
                  value={selectedPeerShiftId}
                  onChange={(e) => setSelectedPeerShiftId(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose their shift --</option>
                  {peerShifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.shiftDate} • {formatRosterShiftTime(s)}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Conflict Check Banner */}
          {conflictResult && (
            <div className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 border ${
              conflictResult.hasConflict
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              {conflictResult.hasConflict ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">
                  {conflictResult.hasConflict ? 'Rest Time Warning' : 'Shift Safe & Conflict Free'}
                </p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {conflictResult.errors[0] || conflictResult.warnings[0] || 'Meets the mandatory 11-hour rest window rule.'}
                </p>
              </div>
            </div>
          )}

          {/* Quick Reason Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Reason for swap
            </label>
            <div className="flex flex-wrap gap-1.5">
              {REASON_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setReason(p)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                    reason === p
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or type a custom note..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending Request...' : 'Send Swap Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
