import { NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConnected } from '@/lib/mongodb';
import { ShiftSwapModel } from '@/models/ShiftSwap';
import { ShiftModel } from '@/models/Shift';
import { AuditLogModel } from '@/models/AuditLog';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, notes, approverId, approverName, actorRole } = body;

    await connectToDatabase();

    const swap = await ShiftSwapModel.findOne({ id });
    if (!swap) {
      return NextResponse.json({ error: 'Shift swap not found' }, { status: 404 });
    }

    const updateFields: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'PEER_ACCEPTED') {
      updateFields.peerAcceptedAt = new Date().toISOString();
    }

    if (status === 'APPROVED_BY_TL' || (status === 'REJECTED' && actorRole === 'TEAM_LEADER')) {
      updateFields.tlApproverId = approverId;
      updateFields.tlApproverName = approverName;
      updateFields.tlReviewedAt = new Date().toISOString();
      updateFields.tlNotes = notes || swap.tlNotes;
    }

    const updatedSwap = await ShiftSwapModel.findOneAndUpdate(
      { id },
      { $set: updateFields },
      { new: true }
    );

    // If approved by TL, actually swap assignments on roster!
    if (status === 'APPROVED_BY_TL') {
      // 1. Update requester shift to be assigned to target peer
      await ShiftModel.findOneAndUpdate(
        { id: swap.requesterShiftId },
        {
          userId: swap.targetPeerId,
          userName: swap.targetPeerName,
          status: 'SCHEDULED',
          allowSwap: true,
        }
      );

      // 2. Update target shift to be assigned to requester
      await ShiftModel.findOneAndUpdate(
        { id: swap.targetShiftId },
        {
          userId: swap.requesterId,
          userName: swap.requesterName,
          status: 'SCHEDULED',
          allowSwap: true,
        }
      );
    } else if (status === 'REJECTED' || status === 'CANCELLED') {
      // Revert shifts to SCHEDULED and allow swap
      await ShiftModel.findOneAndUpdate(
        { id: swap.requesterShiftId },
        { status: 'SCHEDULED', allowSwap: true }
      );
      await ShiftModel.findOneAndUpdate(
        { id: swap.targetShiftId },
        { status: 'SCHEDULED', allowSwap: true }
      );
    }

    // Append Audit Log
    await AuditLogModel.create({
      id: `aud-${Date.now().toString().slice(-4)}`,
      actorId: approverId || swap.targetPeerId,
      actorName: approverName || swap.targetPeerName,
      actorRole: actorRole || 'AGENT',
      action: `SWAP_${status}`,
      entity: 'ShiftSwap',
      entityId: id,
      details: { status, notes },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(updatedSwap);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update swap status' },
      { status: 500 }
    );
  }
}
