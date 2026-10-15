'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shift, 
  ShiftSwap, 
  ExcuseLog, 
  SwapStatus, 
  ExcuseStatus,
  AppNotification
} from '@/lib/types';
import { SwapWorkflowTracker } from '@/components/shifts/SwapWorkflowTracker';
import { ExcuseTanStackTable } from '@/components/excuses/ExcuseTanStackTable';
import { ShiftCalendarViewer } from '@/components/shifts/ShiftCalendarViewer';
import { formatRosterShiftTime, getRosterBreaksForShift } from '@/lib/utils';
import { 
  Plus, 
  ArrowRightLeft, 
  Clock, 
  Calendar, 
  UserCheck, 
  Coffee, 
  Bell, 
  LogOut, 
  ChevronRight, 
  CheckCircle2, 
  Laptop, 
  HelpCircle,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface AgentPortalProps {
  currentUser: User;
  allUsers: User[];
  shifts: Shift[];
  swaps: ShiftSwap[];
  excuses: ExcuseLog[];
  notifications: AppNotification[];
  onSwitchUser: (user: User) => void;
  onSwitchToAdminPortal: () => void;
  onOpenSwapModal: (shiftId?: string) => void;
  onOpenExcuseModal: () => void;
  onUpdateSwapStatus: (swapId: string, status: SwapStatus, notes?: string, approverId?: string) => void;
  onUpdateExcuseStatus: (excuseId: string, status: ExcuseStatus, feedback?: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
}

export function AgentPortal({
  currentUser,
  allUsers,
  shifts,
  swaps,
  excuses,
  notifications,
  onSwitchUser,
  onSwitchToAdminPortal,
  onOpenSwapModal,
  onOpenExcuseModal,
  onUpdateSwapStatus,
  onUpdateExcuseStatus,
  isDarkMode,
  onToggleTheme,
  onOpenNotifications,
  onLogout,
}: AgentPortalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'swaps' | 'excuses' | 'roster'>('overview');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Live clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter agent data
  const mySwaps = swaps.filter(
    (s) => s.requesterId === currentUser.id || s.targetPeerId === currentUser.id
  );
  const myExcuses = excuses.filter((e) => e.userId === currentUser.id);

  // Incoming action items
  const incomingRequests = mySwaps.filter(
    (s) => s.targetPeerId === currentUser.id && s.status === 'PENDING_PEER'
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Assigned Shift timings for Today (using Roster Time Structure)
  const myShift = shifts.find((s) => s.userId === currentUser.id);
  const shiftTimes = formatRosterShiftTime(myShift || { startTime: '13:00', endTime: '22:00', shiftCode: '1:00 PM - 10:00 PM' });
  const shiftTitle = shiftTimes.includes('1:00 PM') ? 'Evening Shift' :
                     shiftTimes.includes('7:00 AM') || shiftTimes.includes('8:00 AM') ? 'Morning Shift' :
                     shiftTimes.includes('4:00 PM') ? 'Overnight Shift' :
                     shiftTimes.includes('Off') ? 'Scheduled Rest Day' : 'Duty Shift';
  const shiftBreaks = getRosterBreaksForShift(shiftTimes);

  // Team Leader on duty
  const teamLeader = allUsers.find((u) => u.role === 'TEAM_LEADER') || { name: 'David Kim' };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans antialiased">
      
      {/* 1. TOP BAR / AGENT HEADER (Clean & Minimal) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Contact Center Identity & Shift Status */}
          <div className="flex items-center gap-3">
            {/* Agent Profile Photo */}
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                  {currentUser.name}
                </h1>
                {/* Current Shift Status Pill */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  On Shift: {shiftTimes}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Contact Center • CO_1 Team
              </p>
            </div>
          </div>

          {/* Right: Current Time, Notifications & Simple Profile */}
          <div className="flex items-center gap-3">
            {/* Current Time */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-semibold text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime || '03:45 PM'}</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Menu Dropdown */}
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
                    <p className="text-[11px] text-slate-400">Agent ID: {currentUser.agentId}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onSwitchToAdminPortal();
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Team Leader Portal</span>
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

        {/* Navigation Tabs (Notion / Linear Style) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-1 border-t border-slate-100 py-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('swaps')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'swaps'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Shift Swap Hub</span>
            {incomingRequests.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('excuses')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'excuses'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>What&apos;s Your Excuse?</span>
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'roster'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Contact Center Roster
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">

        {/* TODAY'S SHIFT CARD (Simple & Clear) */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Today&apos;s Duty Schedule
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {shiftTitle}: {shiftTimes}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active On Shift
              </span>
            </div>
          </div>

          {/* Details Grid: Remaining Hours, TL on Duty, Breaks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
              <span className="text-xs font-medium text-slate-400">Remaining Duty</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                4h 15m remaining
              </p>
            </div>

            <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
              <span className="text-xs font-medium text-slate-400">Team Leader On Duty</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-amber-600" />
                {teamLeader.name}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
              <span className="text-xs font-medium text-slate-400">Break Allocation</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-emerald-600" />
                {shiftBreaks}
              </p>
            </div>
          </div>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Summary Cards (4 Cards) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div 
                onClick={() => setActiveTab('swaps')}
                className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <span className="text-xs font-medium text-slate-400">Incoming Swaps</span>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {incomingRequests.length}
                </p>
                <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">
                  View incoming &rarr;
                </span>
              </div>

              <div 
                onClick={() => setActiveTab('excuses')}
                className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <span className="text-xs font-medium text-slate-400">Logged Excuses</span>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {myExcuses.length}
                </p>
                <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">
                  Recorded for TL ✓
                </span>
              </div>

              <div 
                onClick={() => setActiveTab('swaps')}
                className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <span className="text-xs font-medium text-slate-400">My Requests</span>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {mySwaps.filter((s) => s.requesterId === currentUser.id).length}
                </p>
                <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-block">
                  Track status &rarr;
                </span>
              </div>

              <div 
                onClick={() => setActiveTab('roster')}
                className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <span className="text-xs font-medium text-slate-400">Total Downtime</span>
                <p className="text-xl font-extrabold text-slate-900 mt-1">
                  {myExcuses.reduce((sum, e) => sum + e.durationMinutes, 0)} <span className="text-xs font-normal text-slate-400">mins</span>
                </p>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                  Within allowance ✓
                </span>
              </div>
            </div>

            {/* Split Views: Recent Excuses & Swaps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Recent Excuses & Downtime</h3>
                <button
                  onClick={() => setActiveTab('excuses')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View All &rarr;
                </button>
              </div>
              <ExcuseTanStackTable
                data={myExcuses.slice(0, 3)}
                currentUser={currentUser}
                onUpdateExcuseStatus={onUpdateExcuseStatus}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Shift Swap Hub */}
        {activeTab === 'swaps' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Shift Swap Hub</h2>
                <p className="text-xs text-slate-500">Available peer requests & your submitted requests</p>
              </div>
              <button
                onClick={() => onOpenSwapModal()}
                className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                + New Swap Request
              </button>
            </div>
            <SwapWorkflowTracker
              swaps={mySwaps}
              currentUser={currentUser}
              onUpdateSwapStatus={onUpdateSwapStatus}
            />
          </div>
        )}

        {/* Tab 3: What's Your Excuse? */}
        {activeTab === 'excuses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">What&apos;s Your Excuse?</h2>
                <p className="text-xs text-slate-500">Your logged downtime, system issues, and meeting exceptions</p>
              </div>
              <button
                onClick={onOpenExcuseModal}
                className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Log Reason / Excuse</span>
              </button>
            </div>
            <ExcuseTanStackTable
              data={myExcuses}
              currentUser={currentUser}
              onUpdateExcuseStatus={onUpdateExcuseStatus}
            />
          </div>
        )}

        {/* Tab 4: Contact Center Roster */}
        {activeTab === 'roster' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Contact Center Shift Roster</h2>
                <p className="text-xs text-slate-500">Assigned shift rotations for the CO_1 team</p>
              </div>
              <button
                onClick={() => onOpenSwapModal()}
                className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Request Swap</span>
              </button>
            </div>
            <ShiftCalendarViewer
              shifts={shifts}
              currentUser={currentUser}
              allUsers={allUsers}
              onRequestSwapForShift={(shift) => onOpenSwapModal(shift.id)}
              onOpenSwapModal={() => onOpenSwapModal()}
            />
          </div>
        )}
      </main>
    </div>
  );
}
