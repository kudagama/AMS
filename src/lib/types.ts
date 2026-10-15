export type Role = 'AGENT' | 'TEAM_LEADER' | 'ADMIN' | 'SUPER_ADMIN';

export type UserShiftStatus = 'ON_SHIFT' | 'ON_BREAK' | 'OFF_SHIFT' | 'EXCUSED';

export type ShiftType = 
  | 'MORNING'      // 06:00 - 15:00
  | 'AFTERNOON'    // 14:00 - 23:00
  | 'NIGHT'        // 22:00 - 07:00
  | 'SPLIT'        // Flexible split
  | 'OVERTIME'     // Extra shift
  | 'OFF_DAY'      // Scheduled rest day
  | 'ON_CALL'      // Standby
  | 'TRAINING';    // Training / Coaching

export type ShiftStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'SWAP_PENDING' | 'CANCELLED';

export type LocationType = 'ON_SITE' | 'REMOTE' | 'HYBRID';

export type SwapStatus = 
  | 'PENDING_PEER'     // Stage 1: Waiting for peer acceptance
  | 'PEER_ACCEPTED'    // Stage 1 passed: Waiting for TL approval
  | 'APPROVED_BY_TL'   // Stage 2 passed: Roster formally swapped
  | 'REJECTED'         // Rejected by peer or TL
  | 'CANCELLED';       // Cancelled by requester

export type ExcuseCategory = 
  | 'SYSTEM_FAILURE'
  | 'LEARNING_TRAINING'
  | 'MEETINGS'
  | 'MISCELLANEOUS'
  | 'HEALTH_EMERGENCY';

export type ExcuseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_INFO';

export interface User {
  id: string;
  agentId: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  shiftGroup: string;
  avatarUrl?: string;
  isActive: boolean;
  currentShiftStatus: UserShiftStatus;
}

export interface Shift {
  id: string;
  userId: string;
  userName?: string;
  userRole?: Role;
  shiftDate: string; // YYYY-MM-DD
  startTime: string; // ISO string or HH:mm
  endTime: string;   // ISO string or HH:mm
  type: ShiftType;
  shiftCode?: string; // Legacy code: '8', '9', '13', '15', 'Off', 'Night Off'
  status: ShiftStatus;
  location: LocationType;
  notes?: string;
  allowSwap: boolean;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  errors: string[];
  warnings: string[];
  details: {
    doubleBooking: boolean;
    restPeriodViolation: boolean; // < 11h between shifts
    invalidShiftTypeSwap: boolean;
    consecutiveDaysExceeded: boolean; // > 6 days consecutively
    bothOffDays: boolean;
  };
}

export interface ShiftSwap {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterAgentId: string;
  requesterShiftId: string;
  requesterShift: Shift;
  requesterGroup?: string;
  requesterShiftCode?: string;

  targetPeerId: string;
  targetPeerName: string;
  targetPeerAgentId: string;
  targetShiftId: string;
  targetShift: Shift;
  targetGroup?: string;
  targetShiftCode?: string;

  status: SwapStatus;
  swapReason: string;
  peerResponseNotes?: string;
  peerRespondedAt?: string;

  tlApproverId?: string;
  tlApproverName?: string;
  tlNotes?: string;
  tlReviewedAt?: string;

  conflictCheckPassed: boolean;
  conflictDetails?: ConflictCheckResult;
  createdAt: string;
  updatedAt: string;
}

export interface ExcuseLog {
  id: string;
  userId: string;
  userName: string;
  agentId: string;
  department: string;
  shiftGroup?: string;
  shiftId?: string;
  category: ExcuseCategory;
  subCategory: string;
  fromTime: string; // ISO string
  toTime: string;   // ISO string
  durationMinutes: number;
  reason: string;
  remarks?: string;
  ticketNumber?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: ExcuseStatus;
  tlApproverId?: string;
  tlApproverName?: string;
  tlFeedback?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  entity: string;
  entityId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
  linkAction?: string;
}
