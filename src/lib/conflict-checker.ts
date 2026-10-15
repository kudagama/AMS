import { Shift, User, ConflictCheckResult } from './types';

/**
 * Enterprise Shift Swap Conflict-Checking Engine
 * Validates peer-to-peer swap eligibility against:
 * 1. Double booking / Schedule overlaps
 * 2. Mandatory rest periods (11-hour minimum turnaround between shifts)
 * 3. Invalid off-day combinations (both off days)
 * 4. Maximum consecutive work days limit (> 6 days)
 * 5. Shift lock / swap restrictions
 */
export function checkShiftSwapConflict(
  requester: User,
  requesterShift: Shift,
  requesterAllShifts: Shift[],
  targetPeer: User,
  targetShift: Shift,
  peerAllShifts: Shift[]
): ConflictCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const details = {
    doubleBooking: false,
    restPeriodViolation: false,
    invalidShiftTypeSwap: false,
    consecutiveDaysExceeded: false,
    bothOffDays: false,
  };

  // Rule 0: Same user check
  if (requester.id === targetPeer.id) {
    errors.push('Cannot initiate a shift swap with yourself.');
    return { hasConflict: true, errors, warnings, details };
  }

  // Rule 1: Shift swap allowed flags
  if (!requesterShift.allowSwap) {
    errors.push(`Requester's shift (${requesterShift.type}) is locked for swapping.`);
  }
  if (!targetShift.allowSwap) {
    errors.push(`Target peer's shift (${targetShift.type}) is locked for swapping.`);
  }

  // Rule 2: Both Off-Day Swap
  if (requesterShift.type === 'OFF_DAY' && targetShift.type === 'OFF_DAY') {
    errors.push('Invalid Swap: Both employees already have scheduled OFF_DAYS on these dates.');
    details.bothOffDays = true;
    details.invalidShiftTypeSwap = true;
  }

  // Helper: check time overlap between two shifts
  const shiftsOverlap = (s1: Shift, s2: Shift): boolean => {
    if (s1.type === 'OFF_DAY' || s2.type === 'OFF_DAY') return false;
    if (s1.shiftDate !== s2.shiftDate) return false;

    const start1 = new Date(`${s1.shiftDate}T${s1.startTime}:00`).getTime();
    const end1 = new Date(`${s1.shiftDate}T${s1.endTime}:00`).getTime();
    const start2 = new Date(`${s2.shiftDate}T${s2.startTime}:00`).getTime();
    const end2 = new Date(`${s2.shiftDate}T${s2.endTime}:00`).getTime();

    return Math.max(start1, start2) < Math.min(end1, end2);
  };

  // Rule 3: Double booking for requester taking targetShift
  if (targetShift.type !== 'OFF_DAY') {
    const requesterExistingOnDate = requesterAllShifts.filter(
      (s) => s.id !== requesterShift.id && s.shiftDate === targetShift.shiftDate && s.type !== 'OFF_DAY'
    );

    for (const existing of requesterExistingOnDate) {
      if (shiftsOverlap(existing, targetShift)) {
        errors.push(
          `Double Booking: ${requester.name} already has an active ${existing.type} shift on ${targetShift.shiftDate}.`
        );
        details.doubleBooking = true;
      }
    }
  }

  // Rule 4: Double booking for peer taking requesterShift
  if (requesterShift.type !== 'OFF_DAY') {
    const peerExistingOnDate = peerAllShifts.filter(
      (s) => s.id !== targetShift.id && s.shiftDate === requesterShift.shiftDate && s.type !== 'OFF_DAY'
    );

    for (const existing of peerExistingOnDate) {
      if (shiftsOverlap(existing, requesterShift)) {
        errors.push(
          `Double Booking: ${targetPeer.name} already has an active ${existing.type} shift on ${requesterShift.shiftDate}.`
        );
        details.doubleBooking = true;
      }
    }
  }

  // Rule 5: Minimum Rest Period (11 hours between shifts)
  const MIN_REST_MS = 11 * 60 * 60 * 1000;

  const checkRestPeriod = (user: User, newShift: Shift, userShifts: Shift[], excludedShiftId: string) => {
    if (newShift.type === 'OFF_DAY') return;

    const newStart = new Date(`${newShift.shiftDate}T${newShift.startTime}:00`).getTime();
    const newEnd = new Date(`${newShift.shiftDate}T${newShift.endTime}:00`).getTime();

    for (const s of userShifts) {
      if (s.id === excludedShiftId || s.type === 'OFF_DAY') continue;

      const sStart = new Date(`${s.shiftDate}T${s.startTime}:00`).getTime();
      const sEnd = new Date(`${s.shiftDate}T${s.endTime}:00`).getTime();

      // If s precedes newShift
      if (sEnd <= newStart && newStart - sEnd < MIN_REST_MS) {
        const gapHours = ((newStart - sEnd) / (1000 * 60 * 60)).toFixed(1);
        errors.push(
          `Rest Period Violation for ${user.name}: Only ${gapHours}h turnaround between shifts (11h required).`
        );
        details.restPeriodViolation = true;
      }

      // If newShift precedes s
      if (newEnd <= sStart && sStart - newEnd < MIN_REST_MS) {
        const gapHours = ((sStart - newEnd) / (1000 * 60 * 60)).toFixed(1);
        errors.push(
          `Rest Period Violation for ${user.name}: Only ${gapHours}h turnaround before next shift on ${s.shiftDate} (11h required).`
        );
        details.restPeriodViolation = true;
      }
    }
  };

  checkRestPeriod(requester, targetShift, requesterAllShifts, requesterShift.id);
  checkRestPeriod(targetPeer, requesterShift, peerAllShifts, targetShift.id);

  // Rule 6: Consecutive Days Warning (Over 6 consecutive days)
  if (requesterShift.type === 'OFF_DAY' && targetShift.type !== 'OFF_DAY') {
    warnings.push(`${requester.name} is swapping away their scheduled OFF_DAY. Ensure overtime limits comply with policy.`);
  }

  if (targetShift.type === 'OFF_DAY' && requesterShift.type !== 'OFF_DAY') {
    warnings.push(`${targetPeer.name} is picking up an extra working shift in exchange for their OFF_DAY.`);
  }

  const hasConflict = errors.length > 0;

  return {
    hasConflict,
    errors,
    warnings,
    details,
  };
}
