'use client';

import React from 'react';
import { 
  ArrowRightLeft, 
  HelpCircle, 
  Calendar, 
  CheckSquare, 
  ArrowUpRight, 
  Plus, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  Headphones,
  Users
} from 'lucide-react';
import { Role } from '@/lib/types';

interface OverviewMetricsProps {
  userRole: Role;
  onNavigateTab: (tab: string) => void;
  onOpenExcuseModal: () => void;
  onOpenSwapModal: () => void;
  pendingSwapsCount: number;
  pendingExcusesCount: number;
  myExcuseCount?: number;
  mySwapCount?: number;
  totalExcuseMinutes?: number;
}

export function OverviewMetrics({
  userRole,
  onNavigateTab,
  onOpenExcuseModal,
  onOpenSwapModal,
  pendingSwapsCount,
  pendingExcusesCount,
  myExcuseCount = 0,
  mySwapCount = 0,
  totalExcuseMinutes = 0,
}: OverviewMetricsProps) {
  const isAgent = userRole === 'AGENT';

  return (
    <div className="space-y-4 mb-8">
      {/* Contact Center Operations Banner Label */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Contact Center Section Control Cards
            </h3>
            <p className="text-[11px] text-slate-500">
              Direct access for shift exchanges, exception logging, and roster adherence
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-slate-900 border border-slate-800 text-sky-400 font-bold">
          4 CORE ACTIONS
        </span>
      </div>

      {/* The 4 Prominent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: Shift Swap (Shift මාරු කිරීම) */}
        <div className="group relative overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-b from-sky-950/30 via-slate-900/80 to-slate-950 p-5 shadow-lg hover:border-sky-500/60 transition-all duration-200 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 group-hover:scale-105 transition-transform">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                pendingSwapsCount > 0 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                  : 'bg-sky-500/10 text-sky-300 border-sky-500/20'
              }`}>
                {pendingSwapsCount > 0 ? `${pendingSwapsCount} In Review` : 'Active Exchange'}
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                Shift Swap
              </h4>
              <p className="text-[11px] text-sky-400 font-medium">Shift මාරු කිරීමේ Console</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {isAgent 
                  ? 'Exchange scheduled shifts with CO_1 Contact Center colleagues with automatic 11-hour rest verification.'
                  : 'Review and approve peer-accepted shift swaps before committing to master Contact Center roster.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Swaps:</span>
              <span className="font-mono font-bold text-white">
                {isAgent ? `${mySwapCount} Submitted` : `${pendingSwapsCount} Pending TL`}
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-2">
            {isAgent ? (
              <>
                <button
                  onClick={onOpenSwapModal}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Request Swap</span>
                </button>
                <button
                  onClick={() => onNavigateTab('swaps')}
                  className="p-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  title="View Shift Swaps"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigateTab('approvals')}
                className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Review Swap Requests</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* CARD 2: What's Your Excuse? (Exception & Downtime) */}
        <div className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/30 via-slate-900/80 to-slate-950 p-5 shadow-lg hover:border-amber-500/60 transition-all duration-200 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                pendingExcusesCount > 0 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
              }`}>
                {pendingExcusesCount > 0 ? `${pendingExcusesCount} Awaiting TL` : 'Up to Date'}
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                What&apos;s Your Excuse?
              </h4>
              <p className="text-[11px] text-amber-400 font-medium">Downtime & Exception Logger</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Log Contact Center downtime reasons: PC slow, CSP delay, headset issue, eExam, or team sync with duration.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Downtime:</span>
              <span className="font-mono font-bold text-amber-300">
                {isAgent ? `${totalExcuseMinutes} Mins` : `${pendingExcusesCount} Records`}
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-2">
            {isAgent ? (
              <>
                <button
                  onClick={onOpenExcuseModal}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log An Excuse</span>
                </button>
                <button
                  onClick={() => onNavigateTab('excuses')}
                  className="p-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  title="Open What's Your Excuse Tab"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigateTab('excuses')}
                className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Adjudicate Excuses</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* CARD 3: Contact Center Shift Roster */}
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 via-slate-900/80 to-slate-950 p-5 shadow-lg hover:border-emerald-500/60 transition-all duration-200 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
                CO_1 Active
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white tracking-tight">
                Shift Schedule & Roster
              </h4>
              <p className="text-[11px] text-emerald-400 font-medium">Contact Center Rotation</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Assigned Contact Center shift codes (7, 8, 9, 13, Off) with scheduled start and handoff timings.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Roster Adherence:</span>
              <span className="font-mono font-bold text-emerald-400">98.4% On Time</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => onNavigateTab('shifts')}
              className="w-full py-2 px-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>{isAgent ? 'View My Shift Roster' : 'Manage Master Roster'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD 4: Clearance & Team Governance */}
        <div className="group relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 via-slate-900/80 to-slate-950 p-5 shadow-lg hover:border-indigo-500/60 transition-all duration-200 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
                Governance
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-white tracking-tight">
                {isAgent ? 'Clearance Status' : 'Supervisor Approvals'}
              </h4>
              <p className="text-[11px] text-indigo-400 font-medium">Contact Center Audit</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {isAgent
                  ? 'Track supervisor sign-offs, peer approval timestamps, and attendance adjudication history.'
                  : 'Two-stage supervisory clearance for peer swaps and contact center time exceptions.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Adjudication Pipeline:</span>
              <span className="font-mono font-bold text-indigo-300">
                {isAgent ? 'Audit Verified' : `${pendingSwapsCount + pendingExcusesCount} Items`}
              </span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => onNavigateTab(isAgent ? 'swaps' : 'approvals')}
              className="w-full py-2 px-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>{isAgent ? 'View Clearance Status' : 'Open Approvals Queue'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
