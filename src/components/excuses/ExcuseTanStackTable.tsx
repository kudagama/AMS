'use client';

import React, { useState } from 'react';
import { ExcuseLog, User, ExcuseStatus } from '@/lib/types';
import { 
  Laptop, 
  GraduationCap, 
  Users, 
  Coffee, 
  Clock, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface ExcuseTanStackTableProps {
  data: ExcuseLog[];
  currentUser: User;
  onUpdateExcuseStatus: (excuseId: string, status: ExcuseStatus, feedback?: string) => void;
}

export function ExcuseTanStackTable({
  data,
  currentUser,
  onUpdateExcuseStatus,
}: ExcuseTanStackTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredData = data.filter((item) => {
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesSearch = 
      item.reason.toLowerCase().includes(search.toLowerCase()) ||
      item.subCategory.toLowerCase().includes(search.toLowerCase()) ||
      (item.userName && item.userName.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SYSTEM_FAILURE':
        return <Laptop className="w-4 h-4 text-blue-600" />;
      case 'LEARNING_TRAINING':
        return <GraduationCap className="w-4 h-4 text-emerald-600" />;
      case 'MEETINGS':
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <Coffee className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusBadge = () => {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Logged & Recorded
      </span>
    );
  };

  const CATEGORY_TABS = [
    { id: 'ALL', label: 'All' },
    { id: 'SYSTEM_FAILURE', label: 'System / PC' },
    { id: 'LEARNING_TRAINING', label: 'Training' },
    { id: 'MEETINGS', label: 'Meetings' },
    { id: 'MISCELLANEOUS', label: 'Breaks' },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search reasons or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* Filter Chips by Category */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`py-1 px-3 rounded-lg text-xs font-bold transition-all shrink-0 ${
                categoryFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Timeline / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredData.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">No downtime entries found</p>
            <p className="text-xs text-slate-400">
              {search ? 'Try clearing your search term.' : 'Use "Log Reason / Excuse" to record an absence.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredData.map((excuse) => {
              const formattedDate = excuse.createdAt
                ? new Date(excuse.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Today';

              return (
                <div
                  key={excuse.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-2xl bg-slate-100 border border-slate-200/60 shrink-0 mt-0.5">
                      {getCategoryIcon(excuse.category)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {excuse.subCategory || 'General Issue'}
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          +{excuse.durationMinutes} mins
                        </span>
                        <span className="text-xs text-slate-400">• {formattedDate}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        &quot;{excuse.reason}&quot;
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    {getStatusBadge()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
