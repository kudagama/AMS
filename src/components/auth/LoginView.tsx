'use client';

import React, { useState } from 'react';
import { User } from '@/lib/types';
import { MOCK_USERS } from '@/lib/mock-data';
import { 
  Headphones, 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff 
} from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
  availableUsers?: User[];
}

export function LoginView({ onLogin, availableUsers = MOCK_USERS }: LoginViewProps) {
  const [roleMode, setRoleMode] = useState<'AGENT' | 'ADMIN'>('AGENT');
  const [email, setEmail] = useState('saveen.kudagama@contactcenter-ams.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agents = availableUsers.filter((u) => u.role === 'AGENT');
  const supervisors = availableUsers.filter((u) => u.role === 'TEAM_LEADER' || u.role === 'ADMIN');

  const handleSelectRole = (mode: 'AGENT' | 'ADMIN') => {
    setRoleMode(mode);
    if (mode === 'AGENT') {
      setEmail('saveen.kudagama@contactcenter-ams.com');
    } else {
      setEmail('david.kim@enterprise-ams.com');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const found = availableUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || 
        (roleMode === 'ADMIN' ? supervisors[0] : agents[0]);
      onLogin(found);
      setIsSubmitting(false);
    }, 250);
  };

  const handleQuickLogin = (user: User) => {
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex items-center justify-center p-4 sm:p-6 font-sans antialiased">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-600/20">
            <Headphones className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Contact Center AMS
          </h1>
          <p className="text-xs text-slate-500">
            Shift Swaps & Exception Governance • CO_1 Team
          </p>
        </div>

        {/* Clean White Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
          
          {/* Role Switcher Tabs */}
          <div className="p-1 rounded-2xl bg-slate-100 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => handleSelectRole('AGENT')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                roleMode === 'AGENT'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Headphones className="w-4 h-4 text-blue-600" />
              <span>Agent Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRole('ADMIN')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                roleMode === 'ADMIN'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Team Leader</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@enterprise-ams.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>{isSubmitting ? 'Signing In...' : `Sign In to ${roleMode === 'AGENT' ? 'Agent Portal' : 'Team Leader Hub'}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Click Sign In for Fast Access */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick One-Click Sign In
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin(agents[0])}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all"
              >
                <p className="text-xs font-bold text-slate-800">Alex Vance</p>
                <p className="text-[10px] text-slate-400">Agent (CO_1)</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(supervisors[0])}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-left transition-all"
              >
                <p className="text-xs font-bold text-slate-800">David Kim</p>
                <p className="text-[10px] text-amber-600">Team Leader</p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          Internal Contact Center Workforce Management System
        </p>
      </div>
    </div>
  );
}
