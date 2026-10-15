import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SwapStatus, ExcuseStatus, ShiftType } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeRange(startTime: string, endTime: string): string {
  try {
    const formatTime = (t: string) => {
      if (t.includes('T')) {
        const d = new Date(t);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      return t.slice(0, 5);
    };
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  } catch {
    return `${startTime} - ${endTime}`;
  }
}

export function formatRosterShiftTime(shift?: { startTime?: string; endTime?: string; type?: string; shiftCode?: string } | null): string {
  if (!shift) return '1:00 PM – 10:00 PM';
  
  if (shift.shiftCode) {
    if (shift.shiftCode === 'Off' || shift.shiftCode === 'Night Off') return shift.shiftCode;
    if (shift.shiftCode.includes('PM') || shift.shiftCode.includes('AM')) return shift.shiftCode;
  }
  if (shift.type === 'OFF_DAY') return 'Off';

  const s = shift.startTime || '';
  const e = shift.endTime || '';

  const cleanTime = (t: string) => {
    if (!t) return '';
    if (t.includes('T')) {
      const parts = t.split('T')[1];
      return parts.slice(0, 5);
    }
    return t.slice(0, 5);
  };

  const start = cleanTime(s);
  const end = cleanTime(e);

  if ((start === '13:00' && end === '22:00') || (start === '01:00' && end === '10:00')) return '1:00 PM – 10:00 PM';
  if ((start === '07:00' && end === '15:00') || (start === '07:00' && end === '03:00')) return '7:00 AM – 3:00 PM';
  if ((start === '08:00' && end === '16:00') || (start === '08:00' && end === '04:00')) return '8:00 AM – 4:00 PM';
  if ((start === '09:00' && end === '17:00') || (start === '09:00' && end === '05:00')) return '9:00 AM – 5:00 PM';
  if ((start === '16:00' && end === '08:00') || (start === '04:00' && end === '08:00')) return '4:00 PM – 8:00 AM';
  if (start === '06:00' && end === '15:00') return '7:00 AM – 3:00 PM';
  if (start === '00:00' && end === '00:00') return 'Off';

  if (start && end) {
    return `${start} – ${end}`;
  }
  return shift.shiftCode || '1:00 PM – 10:00 PM';
}

export function getRosterBreaksForShift(shiftStr: string): string {
  if (shiftStr.includes('1:00 PM') || shiftStr.includes('13:00')) {
    return 'Tea 1: 17:00 • Tea 2: 19:30 • Dinner: 14:15';
  }
  if (shiftStr.includes('7:00 AM') || shiftStr.includes('07:00')) {
    return 'Tea 1: 08:00 • Tea 2: 10:35 • Lunch: 13:20';
  }
  if (shiftStr.includes('8:00 AM') || shiftStr.includes('08:00')) {
    return 'Tea 1: 08:00 • Tea 2: 10:30 • Lunch: 13:25';
  }
  if (shiftStr.includes('9:00 AM') || shiftStr.includes('09:00')) {
    return 'Tea 1: 10:15 • Tea 2: 15:10 • Lunch: 12:50';
  }
  if (shiftStr.includes('4:00 PM') || shiftStr.includes('16:00')) {
    return 'Tea 1: 18:15 • Night Rest: 02:00 • Dinner: 20:45';
  }
  if (shiftStr === 'Off' || shiftStr === 'Night Off') {
    return 'Scheduled Rest Day';
  }
  return 'Tea 1: 17:00 • Tea 2: 19:30 • Dinner: 14:15';
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  } catch {
    return dateStr;
  }
}

export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

export function getSwapStatusBadge(status: SwapStatus) {
  switch (status) {
    case 'APPROVED_BY_TL':
      return {
        label: 'Approved by TL',
        className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        dotClass: 'bg-emerald-400 animate-pulse',
      };
    case 'PEER_ACCEPTED':
      return {
        label: 'Peer Accepted',
        className: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
        dotClass: 'bg-cyan-400',
      };
    case 'PENDING_PEER':
      return {
        label: 'Pending Peer',
        className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        dotClass: 'bg-amber-400',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        className: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
        dotClass: 'bg-rose-400',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        className: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
        dotClass: 'bg-slate-400',
      };
    default:
      return {
        label: status,
        className: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
        dotClass: 'bg-slate-400',
      };
  }
}

export function getExcuseStatusBadge(status: ExcuseStatus) {
  switch (status) {
    case 'APPROVED':
      return {
        label: 'Approved',
        className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        dotClass: 'bg-emerald-400',
      };
    case 'PENDING':
      return {
        label: 'Pending Review',
        className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        dotClass: 'bg-amber-400 animate-pulse',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        className: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
        dotClass: 'bg-rose-400',
      };
    case 'NEEDS_INFO':
      return {
        label: 'Needs Info',
        className: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
        dotClass: 'bg-blue-400',
      };
    default:
      return {
        label: status,
        className: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
        dotClass: 'bg-slate-400',
      };
  }
}

export function getShiftTypeInfo(type: ShiftType) {
  switch (type) {
    case 'MORNING':
      return { label: 'Morning (06:00 - 15:00)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    case 'AFTERNOON':
      return { label: 'Afternoon (14:00 - 23:00)', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    case 'NIGHT':
      return { label: 'Night (22:00 - 07:00)', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
    case 'OVERTIME':
      return { label: 'Overtime', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    case 'OFF_DAY':
      return { label: 'Scheduled Off', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' };
    case 'ON_CALL':
      return { label: 'On Call Standby', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' };
    case 'TRAINING':
      return { label: 'Training Workshop', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    case 'SPLIT':
      return { label: 'Split Shift', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
    default:
      return { label: type, color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' };
  }
}
