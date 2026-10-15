'use client';

import React, { useState, useMemo } from 'react';
import { Shift, User } from '@/lib/types';
import { 
  CONTACT_CENTER_ROSTER, 
  ROSTER_DAYS, 
  AgentRosterRecord, 
  DayKey 
} from '@/lib/roster-data';
import { 
  Calendar, 
  Clock, 
  Coffee, 
  Moon, 
  Utensils, 
  Search, 
  ArrowRightLeft, 
  Filter, 
  Printer, 
  Users, 
  Check, 
  Download,
  CalendarDays,
  Sparkles
} from 'lucide-react';

interface ShiftCalendarViewerProps {
  shifts?: Shift[];
  currentUser: User;
  allUsers?: User[];
  onRequestSwapForShift?: (shift: Shift) => void;
  onOpenSwapModal?: () => void;
}

export function ShiftCalendarViewer({
  shifts = [],
  currentUser,
  allUsers = [],
  onRequestSwapForShift,
  onOpenSwapModal,
}: ShiftCalendarViewerProps) {
  // Mode: 'weekly' or 'daily'
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  
  // Daily view selected day
  const [selectedDayKey, setSelectedDayKey] = useState<DayKey>('wed');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCC, setSelectedCC] = useState<string>('ALL');
  const [onlyMySchedule, setOnlyMySchedule] = useState(false);

  // Cost Centers list
  const costCenters = useMemo(() => {
    const set = new Set<string>();
    CONTACT_CENTER_ROSTER.forEach((r) => set.add(r.cc));
    return Array.from(set).sort();
  }, []);

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return CONTACT_CENTER_ROSTER.filter((record) => {
      // CC filter
      if (selectedCC !== 'ALL' && record.cc !== selectedCC) return false;

      // Only my schedule
      const isMe = 
        record.svn === currentUser.agentId || 
        record.svn === currentUser.agentId.replace(/^0+/, '') ||
        record.name.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]);

      if (onlyMySchedule && !isMe) return false;

      // Search term (name or SVN)
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchesName = record.name.toLowerCase().includes(q);
        const matchesSvn = record.svn.toLowerCase().includes(q);
        if (!matchesName && !matchesSvn) return false;
      }

      return true;
    });
  }, [searchTerm, selectedCC, onlyMySchedule, currentUser]);

  // Selected Day info for Daily view
  const currentDayInfo = useMemo(() => {
    return ROSTER_DAYS.find((d) => d.key === selectedDayKey) || ROSTER_DAYS[2];
  }, [selectedDayKey]);

  // Statistics for selected day
  const dayStats = useMemo(() => {
    let onDuty = 0;
    let offDuty = 0;
    filteredRoster.forEach((r) => {
      const shift = r.schedule[selectedDayKey].shift;
      if (shift === 'Off' || shift === 'Night Off') {
        offDuty++;
      } else {
        onDuty++;
      }
    });
    return { onDuty, offDuty };
  }, [filteredRoster, selectedDayKey]);

  // Shift badge styling helper
  const getShiftBadge = (shiftStr: string) => {
    if (shiftStr === 'Off') {
      return (
        <span className="inline-block px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/80">
          Off
        </span>
      );
    }
    if (shiftStr === 'Night Off') {
      return (
        <span className="inline-block px-2 py-1 rounded-lg text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
          Night Off
        </span>
      );
    }
    if (shiftStr.includes('4:00 PM - 8:00 AM')) {
      return (
        <span className="inline-block px-2 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
          4:00 PM - 8:00 AM
        </span>
      );
    }
    if (shiftStr.includes('1:00 PM - 10:00 PM')) {
      return (
        <span className="inline-block px-2 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
          1:00 PM - 10:00 PM
        </span>
      );
    }
    if (shiftStr.includes('7:00 AM - 3:00 PM')) {
      return (
        <span className="inline-block px-2 py-1 rounded-lg text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/80">
          7:00 AM - 3:00 PM
        </span>
      );
    }
    if (shiftStr.includes('8:00 AM - 4:00 PM')) {
      return (
        <span className="inline-block px-2 py-1 rounded-lg text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/80">
          8:00 AM - 4:00 PM
        </span>
      );
    }
    if (shiftStr.includes('9:00 AM - 5:00 PM')) {
      return (
        <span className="inline-block px-2 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
          9:00 AM - 5:00 PM
        </span>
      );
    }

    return (
      <span className="inline-block px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200">
        {shiftStr}
      </span>
    );
  };

  // Break interval badge helper
  const getIntervalBadge = (intervalStr: string, iconType: 'tea1' | 'tea2' | 'meal') => {
    if (!intervalStr || intervalStr.includes('=0:00') || intervalStr === '0:00') {
      return <span className="text-slate-300 font-mono text-xs">-</span>;
    }

    const isNightRest = intervalStr.toLowerCase().includes('night rest');
    const isMorningBreak = intervalStr.toLowerCase().includes('morning break');

    let badgeClass = 'bg-slate-50 text-slate-700 border-slate-200';
    let Icon = Coffee;

    if (isNightRest) {
      badgeClass = 'bg-purple-50 text-purple-700 border-purple-200';
      Icon = Moon;
    } else if (isMorningBreak) {
      badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
      Icon = Coffee;
    } else if (iconType === 'meal') {
      badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      Icon = Utensils;
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono font-medium border ${badgeClass}`}>
        <Icon className="w-3 h-3 shrink-0 opacity-70" />
        <span>{intervalStr}</span>
      </span>
    );
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (viewMode === 'weekly') {
      csvContent += 'NO,SVC NO,Name,CC,Mon (19.10),Tue (20.10),Wed (21.10),Thu (22.10),Fri (23.10),Sat (24.10),Sun (25.10)\n';
      filteredRoster.forEach((r) => {
        const row = [
          r.no,
          r.svn,
          `"${r.name}"`,
          r.cc,
          `"${r.schedule.mon.shift}"`,
          `"${r.schedule.tue.shift}"`,
          `"${r.schedule.wed.shift}"`,
          `"${r.schedule.thu.shift}"`,
          `"${r.schedule.fri.shift}"`,
          `"${r.schedule.sat.shift}"`,
          `"${r.schedule.sun.shift}"`,
        ].join(',');
        csvContent += row + '\n';
      });
    } else {
      csvContent += `NO,SVN,Name,CC,${currentDayInfo.label} (${currentDayInfo.dateStr}),Interval 1,Interval 2,Interval 3 (Lunch/Dinner)\n`;
      filteredRoster.forEach((r) => {
        const sched = r.schedule[selectedDayKey];
        const row = [
          r.no,
          r.svn,
          `"${r.name}"`,
          r.cc,
          `"${sched.shift}"`,
          `"${sched.intervals.interval1}"`,
          `"${sched.intervals.interval2}"`,
          `"${sched.intervals.interval3}"`,
        ].join(',');
        csvContent += row + '\n';
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `contact_center_roster_${viewMode}_${selectedDayKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar with Mode Switcher & Actions */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: View Mode Toggle (Weekly vs Daily) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('weekly')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'weekly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
              <span>Weekly View (Master)</span>
            </button>

            <button
              onClick={() => setViewMode('daily')}
              className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'daily'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Daily View (Break Intervals)</span>
            </button>
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline">•</span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Week: <span className="font-bold text-slate-700">19.10.2026 – 25.10.2026</span>
          </span>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyMySchedule(!onlyMySchedule)}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              onlyMySchedule
                ? 'bg-blue-50 text-blue-700 border-blue-200 ring-2 ring-blue-500/10'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>My Duty Schedule</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="py-1.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* 2. Search, CC Filter & Daily Day Switcher Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name or SVN (e.g. Saveen, 21094)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          {/* CC (Center) Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">Center (CC):</span>
            <select
              value={selectedCC}
              onChange={(e) => setSelectedCC(e.target.value)}
              className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Centers ({CONTACT_CENTER_ROSTER.length} staff)</option>
              {costCenters.map((cc) => (
                <option key={cc} value={cc}>
                  {cc} Center ({CONTACT_CENTER_ROSTER.filter((r) => r.cc === cc).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* In Daily View: Day Selector Tabs (Mon - Sun) */}
        {viewMode === 'daily' && (
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {ROSTER_DAYS.map((day) => {
                const isSelected = selectedDayKey === day.key;
                return (
                  <button
                    key={day.key}
                    onClick={() => setSelectedDayKey(day.key)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    <span>{day.label}</span>
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                      ({day.dateStr.split('.')[0]})
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 font-medium shrink-0">
              <span className="inline-flex items-center gap-1.5 mr-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{dayStats.onDuty} On Duty</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>{dayStats.offDuty} Off / Rest</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Shift Legend Bar */}
      <div className="px-4 py-2 bg-slate-50/70 rounded-xl border border-slate-200/70 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
        <span className="font-bold text-slate-700">Shifts:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
          <span>Morning (07:00 / 08:00)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span>Evening (13:00 - 22:00)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Overnight (16:00 - 08:00)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span>Off</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span>Night Off</span>
        </span>
      </div>

      {/* 4. MAIN TABLE VIEW (WEEKLY OR DAILY) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* VIEW 1: WEEKLY VIEW (Master Matrix Table) */}
        {viewMode === 'weekly' && (
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">NO</th>
                  <th className="py-3 px-3 w-20">SVC NO</th>
                  <th className="py-3 px-4 min-w-[180px]">Name</th>
                  <th className="py-3 px-2 w-12 text-center">CC</th>
                  {ROSTER_DAYS.map((d) => (
                    <th key={d.key} className="py-3 px-3 text-center min-w-[140px]">
                      <div>{d.label}</div>
                      <div className="text-[10px] font-mono font-normal text-slate-400">({d.dateStr})</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoster.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      No agents found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredRoster.map((record) => {
                    const isCurrentUser = 
                      record.svn === currentUser.agentId || 
                      record.svn === currentUser.agentId.replace(/^0+/, '') ||
                      record.name.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]);

                    return (
                      <tr 
                        key={record.no}
                        className={`transition-colors hover:bg-slate-50/70 ${
                          isCurrentUser ? 'bg-blue-50/40 font-semibold' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                          {record.no}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                          {record.svn}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                          <span>{record.name}</span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded-md bg-blue-600 text-white text-[9px] font-bold uppercase">
                              You
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                            {record.cc}
                          </span>
                        </td>
                        {ROSTER_DAYS.map((d) => {
                          const shift = record.schedule[d.key].shift;
                          return (
                            <td key={d.key} className="py-2.5 px-2 text-center">
                              {getShiftBadge(shift)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: DAILY VIEW (With Break Intervals) */}
        {viewMode === 'daily' && (
          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">No</th>
                  <th className="py-3 px-3 w-20">SVN</th>
                  <th className="py-3 px-4 min-w-[200px]">Name</th>
                  <th className="py-3 px-2 w-12 text-center">CC</th>
                  <th className="py-3 px-3 text-center min-w-[150px]">
                    {currentDayInfo.label} ({currentDayInfo.dateStr}) Shift
                  </th>
                  <th className="py-3 px-3 min-w-[130px]">Interval 1 (Tea 1 / Rest)</th>
                  <th className="py-3 px-3 min-w-[130px]">Interval 2 (Tea 2 / Morning)</th>
                  <th className="py-3 px-3 min-w-[150px]">Interval 3 (Lunch / Dinner)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRoster.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No records found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredRoster.map((record) => {
                    const isCurrentUser = 
                      record.svn === currentUser.agentId || 
                      record.svn === currentUser.agentId.replace(/^0+/, '') ||
                      record.name.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]);

                    const daySched = record.schedule[selectedDayKey];

                    return (
                      <tr 
                        key={record.no}
                        className={`transition-colors hover:bg-slate-50/70 ${
                          isCurrentUser ? 'bg-blue-50/40 font-semibold' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                          {record.no}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                          {record.svn}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                          <span>{record.name}</span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded-md bg-blue-600 text-white text-[9px] font-bold uppercase">
                              You
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                            {record.cc}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {getShiftBadge(daySched.shift)}
                        </td>
                        <td className="py-2.5 px-3">
                          {getIntervalBadge(daySched.intervals.interval1, 'tea1')}
                        </td>
                        <td className="py-2.5 px-3">
                          {getIntervalBadge(daySched.intervals.interval2, 'tea2')}
                        </td>
                        <td className="py-2.5 px-3">
                          {getIntervalBadge(daySched.intervals.interval3, 'meal')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info bar */}
        <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{filteredRoster.length}</strong> of{' '}
            <strong className="text-slate-800">{CONTACT_CENTER_ROSTER.length}</strong> Contact Center Staff
          </span>
          {onOpenSwapModal && (
            <button
              onClick={onOpenSwapModal}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Need to trade duty? Request Swap</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
