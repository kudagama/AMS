'use client';

import React from 'react';
import { ShiftSwap, ExcuseLog, User } from '@/lib/types';
import { formatDate, formatDuration, formatTimeRange } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ArrowRightLeft, 
  FileText,
  CheckCheck
} from 'lucide-react';

interface SupervisorApprovalsHubProps {
  swaps: ShiftSwap[];
  excuses: ExcuseLog[];
  currentUser: User;
  onUpdateSwapStatus: (swapId: string, status: ShiftSwap['status'], notes?: string, approverId?: string) => void;
  onUpdateExcuseStatus: (excuseId: string, status: ExcuseLog['status'], feedback?: string) => void;
}

export function SupervisorApprovalsHub({
  swaps,
  excuses,
  currentUser,
  onUpdateSwapStatus,
  onUpdateExcuseStatus,
}: SupervisorApprovalsHubProps) {
  const { toast } = useToast();

  const pendingSwaps = swaps.filter((s) => s.status === 'PEER_ACCEPTED');
  const pendingExcuses = excuses.filter((e) => e.status === 'PENDING');

  const totalPending = pendingSwaps.length + pendingExcuses.length;

  const handleApproveAllSwaps = () => {
    pendingSwaps.forEach((s) => {
      onUpdateSwapStatus(s.id, 'APPROVED_BY_TL', 'Batch approved by TL', currentUser.id);
    });
    toast({
      type: 'success',
      title: 'Batch Approval Complete',
      message: `${pendingSwaps.length} peer-accepted shift swaps approved and committed to roster.`,
    });
  };

  const handleApproveAllExcuses = () => {
    pendingExcuses.forEach((e) => {
      onUpdateExcuseStatus(e.id, 'APPROVED', 'Batch approved by Supervisor');
    });
    toast({
      type: 'success',
      title: 'Batch Approval Complete',
      message: `${pendingExcuses.length} exception logs approved.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-slate-900 to-indigo-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Supervisor & TL Approvals Queue</h2>
            <p className="text-xs text-slate-400">
              Workforce governance center for roster swap clearance and time exception adjudication
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {totalPending} Tasks Requiring Action
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: Pending Shift Swaps (Stage 2 Review) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Stage 2: Peer-Accepted Shift Swaps ({pendingSwaps.length})
                </h3>
              </div>
              {pendingSwaps.length > 0 && (
                <button
                  onClick={handleApproveAllSwaps}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Approve All
                </button>
              )}
            </div>

            {pendingSwaps.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 italic">
                No shift swaps currently awaiting Team Leader clearance.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingSwaps.map((swap) => (
                  <div
                    key={swap.id}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white">
                          {swap.requesterName} ↔ {swap.targetPeerName}
                        </span>
                        {(swap.requesterShiftCode || swap.targetShiftCode) && (
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30">
                            {swap.requesterShiftCode || swap.requesterShift.type} ↔ {swap.targetShiftCode || swap.targetShift.type}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                        Peer Accepted
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] p-2 rounded-lg bg-slate-900/90 text-slate-300">
                      <div>
                        <span className="text-slate-500 block">From {swap.requesterName.split(' ')[0]}:</span>
                        <span className="font-semibold text-white">
                          {swap.requesterShiftCode ? `Code ${swap.requesterShiftCode}` : swap.requesterShift.type}
                        </span> ({formatDate(swap.requesterShift.shiftDate)})
                      </div>
                      <div>
                        <span className="text-slate-500 block">From {swap.targetPeerName.split(' ')[0]}:</span>
                        <span className="font-semibold text-white">
                          {swap.targetShiftCode ? `Code ${swap.targetShiftCode}` : swap.targetShift.type}
                        </span> ({formatDate(swap.targetShift.shiftDate)})
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">
                      &quot;{swap.swapReason}&quot;
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-850">
                      <button
                        onClick={() =>
                          onUpdateSwapStatus(swap.id, 'REJECTED', 'TL rejected due to coverage shortfall', currentUser.id)
                        }
                        className="px-3 py-1 rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-950/40 text-xs font-medium"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() =>
                          onUpdateSwapStatus(swap.id, 'APPROVED_BY_TL', 'Approved by Team Leader', currentUser.id)
                        }
                        className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve & Commit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Pending Excuses & Exceptions */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pending Exceptions & Excuses ({pendingExcuses.length})
                </h3>
              </div>
              {pendingExcuses.length > 0 && (
                <button
                  onClick={handleApproveAllExcuses}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Approve All
                </button>
              )}
            </div>

            {pendingExcuses.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 italic">
                No time exceptions currently awaiting review.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingExcuses.map((excuse) => (
                  <div
                    key={excuse.id}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white mr-1.5">{excuse.userName}</span>
                        <span className="text-[10px] font-mono text-sky-400">({excuse.agentId})</span>
                        {excuse.shiftGroup && (
                          <span className="ml-1.5 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {excuse.shiftGroup}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {formatDuration(excuse.durationMinutes)}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300">
                      <span className="text-slate-500 block">Sub-Category:</span>
                      <span className="font-semibold text-white">{excuse.subCategory}</span>
                      <span className="text-slate-500 ml-2">({formatDate(excuse.fromTime)})</span>
                    </div>

                    {excuse.remarks && (
                      <div className="text-[11px] text-amber-300 font-semibold bg-amber-950/20 px-2 py-1 rounded border border-amber-500/20">
                        Remarks: {excuse.remarks}
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                      &quot;{excuse.reason}&quot;
                    </p>

                    {excuse.ticketNumber && (
                      <div className="text-[10px] font-mono text-sky-400">
                        Ticket: <strong>{excuse.ticketNumber}</strong>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-850">
                      <button
                        onClick={() =>
                          onUpdateExcuseStatus(excuse.id, 'REJECTED', 'Insufficient evidence provided.')
                        }
                        className="px-3 py-1 rounded-lg border border-rose-500/30 text-rose-300 hover:bg-rose-950/40 text-xs font-medium"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() =>
                          onUpdateExcuseStatus(excuse.id, 'APPROVED', 'Verified by Team Leader')
                        }
                        className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve Exception
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
