'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shift, 
  ShiftSwap, 
  ExcuseLog, 
  AuditLog, 
  AppNotification, 
  ExcuseStatus,
  SwapStatus
} from '@/lib/types';
import { 
  MOCK_USERS, 
  MOCK_SHIFTS, 
  MOCK_SWAPS, 
  MOCK_EXCUSES, 
  MOCK_AUDIT_LOGS, 
  MOCK_NOTIFICATIONS 
} from '@/lib/mock-data';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { ShiftSwapModal } from '@/components/shifts/ShiftSwapModal';
import { ExcuseFormModal } from '@/components/excuses/ExcuseFormModal';
import { LoginView } from '@/components/auth/LoginView';
import { AgentPortal } from '@/components/portals/AgentPortal';
import { AdminPortal } from '@/components/portals/AdminPortal';
import { api } from '@/lib/api-client';
import { Bell, X } from 'lucide-react';

function AMSAppContent() {
  const { toast } = useToast();

  // App state
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Domain datasets
  const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS);
  const [swaps, setSwaps] = useState<ShiftSwap[]>(MOCK_SWAPS);
  const [excuses, setExcuses] = useState<ExcuseLog[]>(MOCK_EXCUSES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  // Modals state
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [preselectedShiftForSwap, setPreselectedShiftForSwap] = useState<string | undefined>(undefined);

  // Theme synchronization
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initial load from MongoDB via REST API routes
  useEffect(() => {
    let isMounted = true;
    async function loadDataFromMongo() {
      try {
        const [usersData, shiftsData, swapsData, excusesData, auditData, notifData] =
          await Promise.all([
            api.getUsers().catch(() => MOCK_USERS),
            api.getShifts().catch(() => MOCK_SHIFTS),
            api.getSwaps().catch(() => MOCK_SWAPS),
            api.getExcuses().catch(() => MOCK_EXCUSES),
            api.getAuditLogs().catch(() => MOCK_AUDIT_LOGS),
            api.getNotifications().catch(() => MOCK_NOTIFICATIONS),
          ]);

        if (isMounted) {
          if (usersData && usersData.length > 0) {
            setAllUsers(usersData);
            // Re-bind current user to matched DB record if available
            setCurrentUser((prev) => (prev ? usersData.find((u) => u.id === prev.id) || prev : prev));
          }
          if (shiftsData && shiftsData.length > 0) setShifts(shiftsData);
          if (swapsData && swapsData.length > 0) setSwaps(swapsData);
          if (excusesData && excusesData.length > 0) setExcuses(excusesData);
          if (auditData && auditData.length > 0) setAuditLogs(auditData);
          if (notifData && notifData.length > 0) setNotifications(notifData);
        }
      } catch (err) {
        console.warn('MongoDB API sync fallback to local datasets:', err);
      }
    }

    loadDataFromMongo();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!currentUser) {
    return <LoginView onLogin={(user) => setCurrentUser(user)} availableUsers={allUsers} />;
  }

  const isSupervisor = currentUser.role === 'TEAM_LEADER' || currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  // Handlers
  const handleOpenSwapModal = (shiftId?: string) => {
    setPreselectedShiftForSwap(shiftId);
    setIsSwapModalOpen(true);
  };

  const handleSwapCreated = async (newSwap: ShiftSwap) => {
    // 1. Optimistic local update
    setSwaps((prev) => [newSwap, ...prev]);
    setShifts((prev) =>
      prev.map((s) => {
        if (s.id === newSwap.requesterShiftId || s.id === newSwap.targetShiftId) {
          return { ...s, status: 'SWAP_PENDING', allowSwap: false };
        }
        return s;
      })
    );

    // 2. Persist to MongoDB via API
    try {
      await api.createSwap(newSwap);
    } catch (e) {
      console.warn('Saved locally, API sync note:', e);
    }

    // Append Audit Log
    const audit: AuditLog = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'SWAP_REQUEST_INITIATED',
      entity: 'ShiftSwap',
      entityId: newSwap.id,
      details: {
        targetPeer: newSwap.targetPeerName,
        offeredShift: newSwap.requesterShift.type,
        requestedShift: newSwap.targetShift.type,
      },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const handleUpdateSwapStatus = async (
    swapId: string,
    newStatus: SwapStatus,
    notes?: string,
    approverId?: string
  ) => {
    // 1. Optimistic local update
    setSwaps((prev) =>
      prev.map((sw) => {
        if (sw.id === swapId) {
          return {
            ...sw,
            status: newStatus,
            tlNotes: notes || sw.tlNotes,
            tlApproverId: approverId || sw.tlApproverId,
            tlApproverName: approverId ? currentUser.name : sw.tlApproverName,
            tlReviewedAt: approverId ? new Date().toISOString() : sw.tlReviewedAt,
            updatedAt: new Date().toISOString(),
          };
        }
        return sw;
      })
    );

    // If approved by TL, actually swap assignments on roster!
    if (newStatus === 'APPROVED_BY_TL') {
      const targetSwap = swaps.find((s) => s.id === swapId);
      if (targetSwap) {
        setShifts((prev) =>
          prev.map((s) => {
            if (s.id === targetSwap.requesterShiftId) {
              return {
                ...s,
                userId: targetSwap.targetPeerId,
                userName: targetSwap.targetPeerName,
                status: 'SCHEDULED',
                allowSwap: true,
              };
            }
            if (s.id === targetSwap.targetShiftId) {
              return {
                ...s,
                userId: targetSwap.requesterId,
                userName: targetSwap.requesterName,
                status: 'SCHEDULED',
                allowSwap: true,
              };
            }
            return s;
          })
        );
      }
    }

    // 2. Persist to MongoDB via API
    try {
      await api.updateSwapStatus(
        swapId,
        newStatus,
        notes,
        approverId || currentUser.id,
        currentUser.name,
        currentUser.role
      );
    } catch (e) {
      console.warn('Saved locally, API sync note:', e);
    }

    // Append Audit Log
    const audit: AuditLog = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: `SWAP_${newStatus}`,
      entity: 'ShiftSwap',
      entityId: swapId,
      details: { status: newStatus, notes },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const handleExcuseCreated = async (newExcuse: ExcuseLog) => {
    // 1. Optimistic local update
    setExcuses((prev) => [newExcuse, ...prev]);

    // 2. Persist to MongoDB via API
    try {
      await api.createExcuse(newExcuse);
    } catch (e) {
      console.warn('Saved locally, API sync note:', e);
    }

    // Append Audit Log
    const audit: AuditLog = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: 'EXCUSE_LOGGED',
      entity: 'ExcuseLog',
      entityId: newExcuse.id,
      details: {
        category: newExcuse.category,
        subCategory: newExcuse.subCategory,
        durationMinutes: newExcuse.durationMinutes,
        remarks: newExcuse.remarks,
      },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  const handleUpdateExcuseStatus = async (
    excuseId: string, 
    status: ExcuseStatus, 
    feedback?: string
  ) => {
    // 1. Optimistic local update
    setExcuses((prev) =>
      prev.map((exc) => {
        if (exc.id === excuseId) {
          return {
            ...exc,
            status,
            tlFeedback: feedback || exc.tlFeedback,
            tlApproverId: currentUser.id,
            tlApproverName: currentUser.name,
            reviewedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        return exc;
      })
    );

    // 2. Persist to MongoDB via API
    try {
      await api.updateExcuseStatus(
        excuseId,
        status,
        feedback,
        currentUser.id,
        currentUser.name,
        currentUser.role
      );
    } catch (e) {
      console.warn('Saved locally, API sync note:', e);
    }

    // Append Audit Log
    const audit: AuditLog = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action: `EXCUSE_${status}`,
      entity: 'ExcuseLog',
      entityId: excuseId,
      details: { status, feedback },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [audit, ...prev]);
  };

  return (
    <>
      {isSupervisor ? (
        <AdminPortal
          currentUser={currentUser}
          allUsers={allUsers}
          shifts={shifts}
          swaps={swaps}
          excuses={excuses}
          auditLogs={auditLogs}
          notifications={notifications}
          onSwitchUser={(u) => setCurrentUser(u)}
          onSwitchToAgentPortal={() => {
            const agent = allUsers.find((u) => u.role === 'AGENT') || MOCK_USERS[0];
            setCurrentUser(agent);
            toast({
              type: 'info',
              title: 'Switched to Agent Portal',
              message: `Now viewing as Support Agent ${agent.name} (${agent.agentId})`,
            });
          }}
          onOpenSwapModal={handleOpenSwapModal}
          onOpenExcuseModal={() => setIsExcuseModalOpen(true)}
          onUpdateSwapStatus={handleUpdateSwapStatus}
          onUpdateExcuseStatus={handleUpdateExcuseStatus}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onLogout={() => setCurrentUser(null)}
        />
      ) : (
        <AgentPortal
          currentUser={currentUser}
          allUsers={allUsers}
          shifts={shifts}
          swaps={swaps}
          excuses={excuses}
          notifications={notifications}
          onSwitchUser={(u) => setCurrentUser(u)}
          onSwitchToAdminPortal={() => {
            const tl =
              allUsers.find((u) => u.role === 'TEAM_LEADER') ||
              allUsers.find((u) => u.role === 'ADMIN') ||
              MOCK_USERS[0];
            setCurrentUser(tl);
            toast({
              type: 'success',
              title: 'Switched to Team Leader & Admin Portal',
              message: `Now viewing as Supervisor ${tl.name} (${tl.agentId})`,
            });
          }}
          onOpenSwapModal={handleOpenSwapModal}
          onOpenExcuseModal={() => setIsExcuseModalOpen(true)}
          onUpdateSwapStatus={handleUpdateSwapStatus}
          onUpdateExcuseStatus={handleUpdateExcuseStatus}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onLogout={() => setCurrentUser(null)}
        />
      )}

      {/* Shift Swap Modal */}
      <ShiftSwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        currentUser={currentUser}
        allUsers={allUsers}
        allShifts={shifts}
        initialShiftId={preselectedShiftForSwap}
        onSwapCreated={handleSwapCreated}
      />

      {/* Excuse Submission Modal */}
      <ExcuseFormModal
        isOpen={isExcuseModalOpen}
        onClose={() => setIsExcuseModalOpen(false)}
        currentUser={currentUser}
        onExcuseCreated={handleExcuseCreated}
      />

      {/* Notifications Drawer */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold text-white">Notifications & Alerts</h3>
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)]">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-white">{n.title}</p>
                      <span className="text-[10px] text-slate-500">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                setIsNotificationsOpen(false);
                toast({ type: 'info', title: 'All alerts marked as read' });
              }}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-medium text-slate-300 transition-colors"
            >
              Mark All as Read
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <AMSAppContent />
    </ToastProvider>
  );
}
