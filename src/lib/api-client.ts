import { 
  User, 
  Shift, 
  ShiftSwap, 
  ExcuseLog, 
  AuditLog, 
  AppNotification, 
  SwapStatus, 
  ExcuseStatus 
} from '@/lib/types';

export const api = {
  // Database Health
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  // Users
  async getUsers(role?: string): Promise<User[]> {
    const url = role ? `/api/users?role=${role}` : '/api/users';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async createUser(data: Partial<User>): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
  },

  // Shifts
  async getShifts(userId?: string): Promise<Shift[]> {
    const url = userId ? `/api/shifts?userId=${userId}` : '/api/shifts';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch shifts');
    return res.json();
  },

  async createShift(data: Partial<Shift>): Promise<Shift> {
    const res = await fetch('/api/shifts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create shift');
    return res.json();
  },

  // Shift Swaps
  async getSwaps(userId?: string, status?: string): Promise<ShiftSwap[]> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (status) params.append('status', status);
    const url = `/api/swaps?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch shift swaps');
    return res.json();
  },

  async createSwap(data: Partial<ShiftSwap>): Promise<ShiftSwap> {
    const res = await fetch('/api/swaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create shift swap');
    return res.json();
  },

  async updateSwapStatus(
    swapId: string,
    status: SwapStatus,
    notes?: string,
    approverId?: string,
    approverName?: string,
    actorRole?: string
  ): Promise<ShiftSwap> {
    const res = await fetch(`/api/swaps/${swapId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes, approverId, approverName, actorRole }),
    });
    if (!res.ok) throw new Error('Failed to update shift swap');
    return res.json();
  },

  // Exception Logs
  async getExcuses(userId?: string, status?: string, category?: string): Promise<ExcuseLog[]> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    const url = `/api/excuses?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch excuses');
    return res.json();
  },

  async createExcuse(data: Partial<ExcuseLog>): Promise<ExcuseLog> {
    const res = await fetch('/api/excuses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to log excuse');
    return res.json();
  },

  async updateExcuseStatus(
    excuseId: string,
    status: ExcuseStatus,
    feedback?: string,
    approverId?: string,
    approverName?: string,
    actorRole?: string
  ): Promise<ExcuseLog> {
    const res = await fetch(`/api/excuses/${excuseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, feedback, approverId, approverName, actorRole }),
    });
    if (!res.ok) throw new Error('Failed to update excuse status');
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Notifications
  async getNotifications(userId?: string): Promise<AppNotification[]> {
    const url = userId ? `/api/notifications?userId=${userId}` : '/api/notifications';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    const res = await fetch('/api/notifications', { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to update notifications');
    return res.json();
  },
};
