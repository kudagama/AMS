'use client';

import React, { useState } from 'react';
import { AuditLog } from '@/lib/types';
import { Shield, Clock, Search, Terminal, ArrowRight, User } from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export function AuditLogViewer({ logs }: AuditLogViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(logs[0] || null);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actorName.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/15 text-sky-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Enterprise Compliance & Audit Trail</h3>
            <p className="text-xs text-slate-400">Immutable chronological records of shift swaps, exceptions & supervisor adjudications</p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, actor, entity..."
            className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Log List */}
        <div className="lg:col-span-2 space-y-2">
          {filteredLogs.map((log) => {
            const isSelected = selectedLog?.id === log.id;
            return (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-sky-500/50 bg-slate-900 shadow-md ring-1 ring-sky-500/30'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-sky-400 border border-slate-700">
                      {log.action}
                    </span>
                    <span className="text-xs font-semibold text-white">{log.actorName}</span>
                    <span className="text-[10px] text-slate-400">({log.actorRole})</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {log.createdAt}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Target: <strong className="text-slate-300">{log.entity}</strong> ({log.entityId})</span>
                  {log.ipAddress && <span className="font-mono text-[10px] text-slate-500">IP: {log.ipAddress}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Log Inspector Payload */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Audit Payload Inspector
            </h4>
          </div>

          {selectedLog ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block">Event Action:</span>
                <span className="font-mono font-semibold text-sky-400">{selectedLog.action}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Actor Identity:</span>
                <span className="text-white font-medium">{selectedLog.actorName}</span>{' '}
                <span className="text-slate-400 font-mono text-[11px]">({selectedLog.actorId})</span>
              </div>

              <div>
                <span className="text-slate-500 block">Entity Reference:</span>
                <span className="font-mono text-slate-300">{selectedLog.entity}#{selectedLog.entityId}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">State Snapshot (JSON):</span>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                Log UUID: {selectedLog.id}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Select a log record from the list to inspect payload.</p>
          )}
        </div>
      </div>
    </div>
  );
}
