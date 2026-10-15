'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shift, 
  ShiftSwap, 
  ExcuseLog, 
  AuditLog,
  SwapStatus, 
  ExcuseStatus,
  AppNotification
} from '@/lib/types';
import { SwapWorkflowTracker } from '@/components/shifts/SwapWorkflowTracker';
import { ExcuseTanStackTable } from '@/components/excuses/ExcuseTanStackTable';
import { ShiftCalendarViewer } from '@/components/shifts/ShiftCalendarViewer';
import { CO1TeamDirectory } from '@/components/dashboard/CO1TeamDirectory';
import { AuditLogViewer } from '@/components/audit/AuditLogViewer';
import { formatRosterShiftTime } from '@/lib/utils';
import { 
  Clock, 
  ShieldCheck, 
  Check, 
  X, 
  Users, 
  ArrowRightLeft, 
  FileText, 
  Calendar, 
  Bell, 
  LogOut, 
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface AdminPortalProps {
  currentUser: User;
  allUsers: User[];
  shifts: Shift[];
  swaps: ShiftSwap[];
  excuses: ExcuseLog[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  onSwitchUser: (user: User) => void;
  onSwitchToAgentPortal: () => void;
  onOpenSwapModal: (shiftId?: string) => void;
  onOpenExcuseModal: () => void;
  onUpdateSwapStatus: (swapId: string, status: SwapStatus, notes?: string, approverId?: string) => void;
  onUpdateExcuseStatus: (excuseId: string, status: ExcuseStatus, feedback?: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
}

export function AdminPortal({
  currentUser,
  allUsers,
  shifts,
  swaps,
  excuses,
  auditLogs,
  notifications,
  onSwitchUser,
  onSwitchToAgentPortal,
  onOpenSwapModal,
  onOpenExcuseModal,
  onUpdateSwapStatus,
  onUpdateExcuseStatus,
  isDarkMode,
  onToggleTheme,
  onOpenNotifications,
  onLogout,
}: AdminPortalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'approvals' | 'team' | 'swaps' | 'excuses' | 'roster' | 'audit'>('approvals');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingSwaps = swaps.filter((s) => s.status === 'PEER_ACCEPTED');
  const totalPending = pendingSwaps.length;

  const co1Agents = allUsers.filter((u) => u.shiftGroup.includes('CO_1') && u.role === 'AGENT');
  const onShiftCount = co1Agents.filter((a) => a.currentShiftStatus === 'ON_SHIFT').length;

  const handleApproveSwap = (swapId: string) => {
    onUpdateSwapStatus(swapId, 'APPROVED_BY_TL', 'Approved by Team Leader David Kim', currentUser.id);
    toast({ type: 'success', title: 'Shift Swap Approved', message: 'Roster updated successfully.' });
  };

  const handleRejectSwap = (swapId: string) => {
    onUpdateSwapStatus(swapId, 'REJECTED', 'Declined by Team Leader', currentUser.id);
    toast({ type: 'info', title: 'Shift Swap Declined' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans antialiased">
      
      {/* Top Bar for Team Leader */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Identity */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-100"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-amber-500 ring-2 ring-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Team Leader • Contact Center
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                CO_1 Supervisory Management
              </p>
            </div>
          </div>

          {/* Actions & Time */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-semibold text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime || '03:45 PM'}</span>
            </div>

            <button
              onClick={onOpenNotifications}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
              >
                <span>Options</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400">Team Leader • CO_1</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSwitchToAgentPortal();
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Agent Workspace</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TL Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-1 border-t border-slate-100 py-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'approvals'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Clearance Queue</span>
            {totalPending > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {totalPending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'team'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Team Live Radar ({onShiftCount} Active)
          </button>

          <button
            onClick={() => setActiveTab('swaps')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'swaps'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Shift Swaps
          </button>

          <button
            onClick={() => setActiveTab('excuses')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'excuses'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            What&apos;s Your Excuse? Logs
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'roster'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            CO_1 Master Roster
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'audit'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Audit Log
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">

        {/* Tab 1: Clearance Queue */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Shift Swap Clearance Queue</h2>
              <p className="text-xs text-slate-500">
                1-click sign-off for peer-accepted shift swaps before roster updates
              </p>
            </div>

            {/* Pending Shift Swaps Queue */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Peer-Accepted Shift Swaps ({pendingSwaps.length})
                </h3>
              </div>

              {pendingSwaps.length === 0 ? (
                <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-1">
                  <p className="text-sm font-bold text-slate-800">Clearance Queue Empty</p>
                  <p className="text-xs text-slate-400">No shift swaps currently awaiting Team Leader sign-off.</p>
                </div>
              ) : (
                pendingSwaps.map((swap) => (
                  <div
                    key={swap.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900">
                        {swap.requesterName} &harr; {swap.targetPeerName}
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Swap Reason: <span className="text-slate-700 font-medium">&quot;{swap.swapReason}&quot;</span>
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Date: {swap.requesterShift?.shiftDate} • {formatRosterShiftTime(swap.requesterShift)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleApproveSwap(swap.id)}
                        className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Swap</span>
                      </button>
                      <button
                        onClick={() => handleRejectSwap(swap.id)}
                        className="py-2 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Team Live Radar */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            <CO1TeamDirectory
              users={allUsers}
              shifts={shifts}
              swaps={swaps}
              excuses={excuses}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          </div>
        )}

        {/* Tab 3: Shift Swaps */}
        {activeTab === 'swaps' && (
          <div className="space-y-4">
            <SwapWorkflowTracker
              swaps={swaps}
              currentUser={currentUser}
              onUpdateSwapStatus={onUpdateSwapStatus}
            />
          </div>
        )}

        {/* Tab 4: Excuses */}
        {activeTab === 'excuses' && (
          <div className="space-y-4">
            <ExcuseTanStackTable
              data={excuses}
              currentUser={currentUser}
              onUpdateExcuseStatus={onUpdateExcuseStatus}
            />
          </div>
        )}

        {/* Tab 5: Master Roster */}
        {activeTab === 'roster' && (
          <div className="space-y-4">
            <ShiftCalendarViewer
              shifts={shifts}
              currentUser={currentUser}
              allUsers={allUsers}
              onRequestSwapForShift={(shift) => onOpenSwapModal(shift.id)}
              onOpenSwapModal={() => onOpenSwapModal()}
            />
          </div>
        )}

        {/* Tab 6: Audit Log */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <AuditLogViewer logs={auditLogs} />
          </div>
        )}
      </main>
    </div>
  );
}
