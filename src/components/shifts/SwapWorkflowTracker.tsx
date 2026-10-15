'use client';

import React, { useState } from 'react';
import { ShiftSwap, User } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';
import { formatRosterShiftTime } from '@/lib/utils';
import { 
  ArrowRightLeft, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Inbox,
  Send,
  UserCheck
} from 'lucide-react';

interface SwapWorkflowTrackerProps {
  swaps: ShiftSwap[];
  currentUser: User;
  onUpdateSwapStatus: (
    swapId: string, 
    newStatus: ShiftSwap['status'], 
    notes?: string, 
    approverId?: string
  ) => void;
}

export function SwapWorkflowTracker({
  swaps,
  currentUser,
  onUpdateSwapStatus,
}: SwapWorkflowTrackerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'available' | 'my_requests'>('available');

  // Tab 1: Available Swaps / Incoming requests for this agent
  const availableSwaps = swaps.filter(
    (s) => s.targetPeerId === currentUser.id || (s.status === 'PENDING_PEER' && s.requesterId !== currentUser.id)
  );

  // Tab 2: My requests sent out by this agent
  const myRequests = swaps.filter((s) => s.requesterId === currentUser.id);

  const handleAccept = (swap: ShiftSwap) => {
    onUpdateSwapStatus(swap.id, 'PEER_ACCEPTED', 'Accepted by colleague.', currentUser.id);
    toast({
      type: 'success',
      title: 'Shift Swap Accepted!',
      message: 'Sent to your Team Leader for final clearance.',
    });
  };

  const handleDecline = (swap: ShiftSwap) => {
    onUpdateSwapStatus(swap.id, 'REJECTED', 'Declined by colleague.', currentUser.id);
    toast({
      type: 'info',
      title: 'Shift Swap Declined',
      message: 'The swap proposal has been declined.',
    });
  };

  const getStatusPill = (status: ShiftSwap['status']) => {
    switch (status) {
      case 'APPROVED_BY_TL':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Approved & Final
          </span>
        );
      case 'PEER_ACCEPTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Waiting for Team Leader
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Declined
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Waiting for Colleague
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher: Available Swaps vs My Requests */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('available')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'available'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Available Swaps & Incoming</span>
          {availableSwaps.filter((s) => s.status === 'PENDING_PEER').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-white text-blue-600 text-[10px] font-black">
              {availableSwaps.filter((s) => s.status === 'PENDING_PEER').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('my_requests')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'my_requests'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>My Swap Requests</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
            {myRequests.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Available Swaps Cards */}
      {activeTab === 'available' && (
        <div className="space-y-3">
          {availableSwaps.length === 0 ? (
            <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No pending swap requests</p>
              <p className="text-xs text-slate-400">
                When a colleague requests to trade shifts with you, it will appear right here.
              </p>
            </div>
          ) : (
            availableSwaps.map((swap) => {
              const isActionable = swap.status === 'PENDING_PEER' && swap.targetPeerId === currentUser.id;

              return (
                <div
                  key={swap.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-700 shrink-0">
                      {swap.requesterName.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{swap.requesterName}</p>
                        <span className="text-[11px] text-slate-400 font-medium">• Wants to swap</span>
                      </div>
                      
                      {/* Shift details */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {swap.requesterShift?.shiftDate || 'Scheduled date'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          <Clock className="w-3.5 h-3.5" />
                          {formatRosterShiftTime(swap.requesterShift)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 pt-1">
                        Reason: <span className="text-slate-700 font-medium">&quot;{swap.swapReason}&quot;</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    {getStatusPill(swap.status)}

                    {isActionable && (
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() => handleAccept(swap)}
                          className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleDecline(swap)}
                          className="py-2 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: My Swap Requests (Simple 3-step progress tracker) */}
      {activeTab === 'my_requests' && (
        <div className="space-y-3">
          {myRequests.length === 0 ? (
            <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
              <ArrowRightLeft className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800">You haven&apos;t sent any swap requests yet</p>
              <p className="text-xs text-slate-400">
                Click &quot;Request Shift Swap&quot; above to trade shifts with any colleague.
              </p>
            </div>
          ) : (
            myRequests.map((swap) => {
              const isColleagueAccepted = swap.status === 'PEER_ACCEPTED' || swap.status === 'APPROVED_BY_TL';
              const isTLApproved = swap.status === 'APPROVED_BY_TL';
              const isRejected = swap.status === 'REJECTED';

              return (
                <div
                  key={swap.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Request sent to:</p>
                      <h4 className="text-sm font-bold text-slate-900">{swap.targetPeerName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Your shift on <span className="font-semibold text-slate-700">{swap.requesterShift?.shiftDate}</span> ({formatRosterShiftTime(swap.requesterShift)}) for their shift on <span className="font-semibold text-slate-700">{swap.targetShift?.shiftDate}</span> ({formatRosterShiftTime(swap.targetShift)})
                      </p>
                    </div>
                    <div>
                      {getStatusPill(swap.status)}
                    </div>
                  </div>

                  {/* 3-Step Simple Progress Bar */}
                  {!isRejected ? (
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
                      {/* Step 1: Sent */}
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                        <div className="text-[11px] font-semibold text-slate-800">
                          1. Sent to Colleague
                        </div>
                      </div>

                      {/* Step 2: Colleague Accepted */}
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isColleagueAccepted ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {isColleagueAccepted ? '✓' : '2'}
                        </span>
                        <div className={`text-[11px] font-semibold ${
                          isColleagueAccepted ? 'text-slate-800' : 'text-slate-400'
                        }`}>
                          2. Colleague Response
                        </div>
                      </div>

                      {/* Step 3: TL Approval */}
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isTLApproved ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {isTLApproved ? '✓' : '3'}
                        </span>
                        <div className={`text-[11px] font-semibold ${
                          isTLApproved ? 'text-slate-800' : 'text-slate-400'
                        }`}>
                          3. Team Leader Sign-off
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50 rounded-xl text-xs text-rose-700 border border-rose-200">
                      This shift swap was not approved. You remain on your original schedule.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
