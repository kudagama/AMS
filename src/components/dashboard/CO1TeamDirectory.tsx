'use client';

import React, { useState } from 'react';
import { User, Shift, ShiftSwap, ExcuseLog } from '@/lib/types';
import { 
  Users, 
  Search, 
  Clock, 
  PhoneCall, 
  Mail, 
  ChevronRight,
  Coffee,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface CO1TeamDirectoryProps {
  users: User[];
  shifts: Shift[];
  swaps: ShiftSwap[];
  excuses: ExcuseLog[];
  onSelectAgent?: (agent: User) => void;
  onNavigateTab: (tab: string) => void;
}

export function CO1TeamDirectory({
  users,
  shifts,
  swaps,
  excuses,
  onNavigateTab,
}: CO1TeamDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const co1Agents = users.filter((u) => u.shiftGroup.includes('CO_1') && u.role === 'AGENT');

  const filtered = co1Agents.filter((agent) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      agent.name.toLowerCase().includes(q) ||
      agent.agentId.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || agent.currentShiftStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: User['currentShiftStatus']) => {
    switch (status) {
      case 'ON_SHIFT':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            On Shift
          </span>
        );
      case 'ON_BREAK':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5">
            <Coffee className="w-3 h-3 text-amber-600" />
            On Break
          </span>
        );
      case 'EXCUSED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3 text-purple-600" />
            Excused
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 inline-flex items-center gap-1.5">
            Off Shift
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Contact Center agent name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {['ALL', 'ON_SHIFT', 'ON_BREAK', 'OFF_SHIFT'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`py-1 px-3 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All' : st === 'ON_SHIFT' ? 'On Shift' : st === 'ON_BREAK' ? 'On Break' : 'Off Shift'}
            </button>
          ))}
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-3.5 px-4">Contact Center Agent</th>
              <th className="py-3.5 px-3">Live Duty Status</th>
              <th className="py-3.5 px-3">Assigned Shift</th>
              <th className="py-3.5 px-3">Downtime Logged</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((agent) => {
              const userShift = shifts.find((s) => s.userId === agent.id);
              const shiftTimes = userShift
                ? `${userShift.startTime} – ${userShift.endTime}`
                : '06:00 AM – 03:00 PM';

              const agentExcuses = excuses.filter((e) => e.userId === agent.id);
              const totalExcusedMins = agentExcuses.reduce((sum, e) => sum + e.durationMinutes, 0);

              return (
                <tr key={agent.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={agent.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={agent.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{agent.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{agent.agentId} • {agent.shiftGroup}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    {getStatusBadge(agent.currentShiftStatus)}
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60">
                      {shiftTimes}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-700">
                      {totalExcusedMins} mins
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigateTab('roster')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      View Roster &rarr;
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
