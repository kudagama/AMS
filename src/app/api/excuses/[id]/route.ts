import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ExcuseLogModel } from '@/models/ExcuseLog';
import { AuditLogModel } from '@/models/AuditLog';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, feedback, approverId, approverName, actorRole } = body;

    await connectToDatabase();

    const excuse = await ExcuseLogModel.findOne({ id });
    if (!excuse) {
      return NextResponse.json({ error: 'Exception log not found' }, { status: 404 });
    }

    const updatedExcuse = await ExcuseLogModel.findOneAndUpdate(
      { id },
      {
        $set: {
          status,
          tlFeedback: feedback || excuse.tlFeedback,
          tlApproverId: approverId,
          tlApproverName: approverName,
          reviewedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { new: true }
    );

    // Append Audit Trail
    await AuditLogModel.create({
      id: `aud-${Date.now().toString().slice(-4)}`,
      actorId: approverId || 'TL-1002',
      actorName: approverName || 'David Kim (Team Leader)',
      actorRole: actorRole || 'TEAM_LEADER',
      action: `EXCUSE_${status}`,
      entity: 'ExcuseLog',
      entityId: id,
      details: { status, feedback },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(updatedExcuse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update excuse status' },
      { status: 500 }
    );
  }
}
