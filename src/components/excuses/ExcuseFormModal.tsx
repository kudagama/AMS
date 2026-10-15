'use client';

import React, { useState } from 'react';
import { User, ExcuseLog, ExcuseCategory } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';
import { 
  X, 
  Laptop, 
  GraduationCap, 
  Users, 
  Coffee, 
  Clock, 
  Check, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface ExcuseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onExcuseCreated: (newExcuse: ExcuseLog) => void;
}

const FRIENDLY_CATEGORIES: {
  id: ExcuseCategory;
  label: string;
  icon: typeof Laptop;
  example: string;
  color: string;
}[] = [
  {
    id: 'SYSTEM_FAILURE',
    label: 'System / PC Issue',
    icon: Laptop,
    example: 'PC Slow, CSP error, headset drop, or VPN disconnected',
    color: 'border-blue-200 bg-blue-50/70 text-blue-800 hover:bg-blue-100/70',
  },
  {
    id: 'LEARNING_TRAINING',
    label: 'Training / Exam',
    icon: GraduationCap,
    example: 'Scheduled QA coaching, eExam, or iAuthor training',
    color: 'border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/70',
  },
  {
    id: 'MEETINGS',
    label: 'Meeting',
    icon: Users,
    example: 'Team briefing, standup, or Team Leader 1-on-1',
    color: 'border-purple-200 bg-purple-50/70 text-purple-800 hover:bg-purple-100/70',
  },
  {
    id: 'MISCELLANEOUS',
    label: 'Break Issue',
    icon: Coffee,
    example: 'Cafeteria delay, extended bio break, or clinic visit',
    color: 'border-amber-200 bg-amber-50/70 text-amber-800 hover:bg-amber-100/70',
  },
];

const DURATION_PRESETS = [
  { label: '15 mins', minutes: 15 },
  { label: '30 mins', minutes: 30 },
  { label: '45 mins', minutes: 45 },
  { label: '1 hour', minutes: 60 },
];

export function ExcuseFormModal({
  isOpen,
  onClose,
  currentUser,
  onExcuseCreated,
}: ExcuseFormModalProps) {
  const { toast } = useToast();

  const [category, setCategory] = useState<ExcuseCategory>('SYSTEM_FAILURE');
  const [duration, setDuration] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectPreset = (mins: number) => {
    setDuration(mins);
    setCustomDuration('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomDuration(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setDuration(parsed);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast({
        type: 'error',
        title: 'Please enter a brief note',
        message: 'A short explanation helps your Team Leader approve this quickly.',
      });
      return;
    }

    if (duration <= 0) {
      toast({
        type: 'error',
        title: 'Invalid duration',
        message: 'Please choose or type how many minutes you were away.',
      });
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const fromTime = new Date(now.getTime() - duration * 60000).toISOString();
    const toTime = now.toISOString();

    const categoryObj = FRIENDLY_CATEGORIES.find((c) => c.id === category);

    const newExcuse: ExcuseLog = {
      id: `exc-${Date.now().toString().slice(-4)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      agentId: currentUser.agentId,
      department: currentUser.department || 'Contact Center Operations',
      category,
      subCategory: categoryObj?.label || 'General Issue',
      fromTime,
      toTime,
      durationMinutes: duration,
      reason: reason.trim(),
      remarks: reason.trim(),
      status: 'APPROVED',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    setTimeout(() => {
      onExcuseCreated(newExcuse);
      setIsSubmitting(false);
      toast({
        type: 'success',
        title: 'Downtime Logged Successfully',
        message: `${duration} mins (${categoryObj?.label}) recorded for Team Leader visibility.`,
      });
      setReason('');
      setDuration(30);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              What&apos;s Your Excuse?
            </h2>
            <p className="text-xs text-slate-500">
              Record downtime or temporary absence for Team Leader visibility
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Friendly Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Step 1: 4 Friendly Category Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              1. What happened? Select a reason
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {FRIENDLY_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {cat.label}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                        {cat.example}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Duration Selector Chips */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              2. How long did it take?
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {DURATION_PRESETS.map((preset) => {
                const isSelected = duration === preset.minutes && customDuration === '';
                return (
                  <button
                    key={preset.minutes}
                    type="button"
                    onClick={() => handleSelectPreset(preset.minutes)}
                    className={`py-2 px-3.5 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}

              {/* Custom Minutes Input */}
              <div className="relative flex-1 min-w-[120px]">
                <input
                  type="number"
                  placeholder="Custom mins"
                  value={customDuration}
                  onChange={handleCustomChange}
                  min={1}
                  max={480}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-medium pointer-events-none">
                  min
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Friendly Note / Reason */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Quick details for your Team Leader
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., PC froze during call, had to restart workstation, or 1-on-1 coaching with TL"
              className="w-full p-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Logging...' : 'Submit Excuse / Downtime'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
