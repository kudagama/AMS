'use client';

import React, { useState, useEffect } from 'react';
import { User, Role, UserShiftStatus } from '@/lib/types';
import { 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  Bell, 
  Sun, 
  Moon, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Coffee,
  Building2,
  Users2,
  Activity,
  Database,
  ArrowRightLeft,
  ChevronDown,
  X,
  Search
} from 'lucide-react';

interface UserProfileBannerProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  activeAlertCount: number;
  onOpenNotifications: () => void;
  onQuickAction: (action: string) => void;
}

export function UserProfileBanner({
  currentUser,
  allUsers,
  onSwitchUser,
  isDarkMode,
  onToggleTheme,
  activeAlertCount,
  onOpenNotifications,
  onQuickAction,
}: UserProfileBannerProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Clock ticking effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'System Admin',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />,
          className: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
        };
      case 'TEAM_LEADER':
        return {
          label: 'Team Leader',
          icon: <UserCheck className="w-3.5 h-3.5 text-amber-400" />,
          className: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        };
      default:
        return {
          label: 'Support Agent',
          icon: <Users2 className="w-3.5 h-3.5 text-sky-400" />,
          className: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        };
    }
  };

  const getShiftStatusBadge = (status: UserShiftStatus) => {
    switch (status) {
      case 'ON_SHIFT':
        return {
          label: 'Active on Shift',
          icon: <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block mr-1.5" />,
          className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        };
      case 'ON_BREAK':
        return {
          label: 'Scheduled Break',
          icon: <Coffee className="w-3.5 h-3.5 text-amber-400 mr-1.5" />,
          className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        };
      case 'EXCUSED':
        return {
          label: 'Excused Downtime',
          icon: <AlertCircle className="w-3.5 h-3.5 text-purple-400 mr-1.5" />,
          className: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        };
      default:
        return {
          label: 'Off Shift',
          icon: <Clock className="w-3.5 h-3.5 text-slate-400 mr-1.5" />,
          className: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);
  const shiftInfo = getShiftStatusBadge(currentUser.currentShiftStatus);

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.agentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/85 shadow-xl backdrop-blur-xl mb-6">
        {/* Decorative gradient highlight banner */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          {/* User Identity Details */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-sky-500/30 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono bg-slate-800 text-sky-400 border border-sky-500/20">
                  {currentUser.agentId}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleInfo.className}`}>
                  {roleInfo.icon}
                  {roleInfo.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  Contact Center Section ({currentUser.department})
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  {currentUser.shiftGroup}
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${shiftInfo.className}`}>
                  {shiftInfo.icon}
                  {shiftInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Metrics, Live Clock & Control Suite */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t border-slate-800/80 lg:border-t-0">
            {/* Live Clock & Database Ping */}
            <div className="hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>{currentTime || '15:20:00'}</span>
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <Database className="w-3.5 h-3.5" />
                <span>MongoDB Live</span>
              </div>
            </div>

            {/* Switch Account Button (Clean modal trigger, NOT inline persona spam) */}
            <button
              onClick={() => setIsSwitchModalOpen(true)}
              className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-2 transition-all shadow-sm"
              title="Switch user account profile"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
              <span>Switch Profile</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="System Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              {activeAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                  {activeAlertCount}
                </span>
              )}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
            </button>
          </div>
        </div>

        {/* Live Operational Ribbon */}
        <div className="bg-slate-950/70 border-t border-slate-800/80 px-5 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Real-time Active
            </span>
            <span className="text-slate-300 truncate">
              {currentUser.role === 'TEAM_LEADER' || currentUser.role === 'ADMIN'
                ? '⚡ Contact Center CO_1 Governance: Peer shift swaps and "What\'s Your Excuse?" downtime logs require supervisor clearance.' 
                : '⚡ Contact Center Active Schedule: Record PC slow, CSP delay, or meeting exceptions under "What\'s Your Excuse?".'}
            </span>
          </div>
          <button
            onClick={() => onQuickAction(currentUser.role === 'TEAM_LEADER' || currentUser.role === 'ADMIN' ? 'approvals' : 'swaps')}
            className="text-sky-400 hover:text-sky-300 font-semibold shrink-0 ml-4 hover:underline flex items-center gap-1"
          >
            <span>{currentUser.role === 'TEAM_LEADER' || currentUser.role === 'ADMIN' ? 'Clearance Hub' : 'My Requests'}</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      {/* Corporate Switch Profile Modal */}
      {isSwitchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Switch Active Account</h3>
                  <p className="text-xs text-slate-400">Select user persona from the live organization directory</p>
                </div>
              </div>
              <button
                onClick={() => setIsSwitchModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by name, agent ID, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Users List */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {filteredUsers.map((u) => {
                const isSelected = u.id === currentUser.id;
                const isTL = u.role === 'TEAM_LEADER' || u.role === 'ADMIN';

                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      setIsSwitchModalOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/15'
                        : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={u.name}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                      />
                      <div>
                        <p className="text-xs font-semibold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {u.agentId} • {u.shiftGroup}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                        isTL
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                      }`}>
                        {u.role === 'TEAM_LEADER' ? 'Team Leader' : u.role}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-sky-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
