import { NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConnected } from '@/lib/mongodb';
import { ShiftSwapModel } from '@/models/ShiftSwap';
import { ShiftModel } from '@/models/Shift';
import { AuditLogModel } from '@/models/AuditLog';
import { MOCK_SWAPS } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const isConnected = await isDatabaseConnected();
    if (!isConnected) {
      let filtered = [...MOCK_SWAPS];
      if (userId) {
        filtered = filtered.filter(
          (s) => s.requesterId === userId || s.targetPeerId === userId
        );
      }
      if (status) {
        filtered = filtered.filter((s) => s.status === status);
      }
      return NextResponse.json(filtered);
    }

    await connectToDatabase();
    const query: Record<string, unknown> = {};
    if (userId) {
      query.$or = [{ requesterId: userId }, { targetPeerId: userId }];
    }
    if (status) {
      query.status = status;
    }

    let swaps = await ShiftSwapModel.find(query).sort({ createdAt: -1 }).lean();
    if (swaps.length === 0 && !userId && !status) {
      await ShiftSwapModel.insertMany(MOCK_SWAPS);
      swaps = await ShiftSwapModel.find({}).sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json(swaps);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch shift swaps' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const swapId = body.id || `sw-${Date.now().toString().slice(-4)}`;

    const newSwap = await ShiftSwapModel.create({
      id: swapId,
      requesterId: body.requesterId,
      requesterName: body.requesterName,
      requesterAgentId: body.requesterAgentId,
      requesterGroup: body.requesterGroup || 'CO_1',
      requesterShiftCode: body.requesterShiftCode,
      requesterShiftId: body.requesterShiftId,
      requesterShift: body.requesterShift,
      targetPeerId: body.targetPeerId,
      targetPeerName: body.targetPeerName,
      targetPeerAgentId: body.targetPeerAgentId,
      targetGroup: body.targetGroup || 'CO_1',
      targetShiftCode: body.targetShiftCode,
      targetShiftId: body.targetShiftId,
      targetShift: body.targetShift,
      swapReason: body.swapReason,
      status: 'PENDING_PEER',
    });

    // Mark shifts as SWAP_PENDING
    if (body.requesterShiftId) {
      await ShiftModel.findOneAndUpdate(
        { id: body.requesterShiftId },
        { status: 'SWAP_PENDING', allowSwap: false }
      );
    }
    if (body.targetShiftId) {
      await ShiftModel.findOneAndUpdate(
        { id: body.targetShiftId },
        { status: 'SWAP_PENDING', allowSwap: false }
      );
    }

    // Append Audit Trail
    await AuditLogModel.create({
      id: `aud-${Date.now().toString().slice(-4)}`,
      actorId: body.requesterId,
      actorName: body.requesterName,
      actorRole: 'AGENT',
      action: 'SWAP_REQUEST_INITIATED',
      entity: 'ShiftSwap',
      entityId: swapId,
      details: {
        targetPeer: body.targetPeerName,
        offeredShift: body.requesterShift?.type,
        requestedShift: body.targetShift?.type,
      },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(newSwap, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create shift swap' },
      { status: 500 }
    );
  }
}
