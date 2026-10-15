import { NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConnected } from '@/lib/mongodb';
import { ExcuseLogModel } from '@/models/ExcuseLog';
import { AuditLogModel } from '@/models/AuditLog';
import { MOCK_EXCUSES } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const isConnected = await isDatabaseConnected();
    if (!isConnected) {
      let filtered = [...MOCK_EXCUSES];
      if (userId) filtered = filtered.filter((e) => e.userId === userId);
      if (status) filtered = filtered.filter((e) => e.status === status);
      if (category) filtered = filtered.filter((e) => e.category === category);
      return NextResponse.json(filtered);
    }

    await connectToDatabase();
    const query: Record<string, unknown> = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;
    if (category) query.category = category;

    let excuses = await ExcuseLogModel.find(query).sort({ fromTime: -1 }).lean();
    if (excuses.length === 0 && !userId && !status && !category) {
      await ExcuseLogModel.insertMany(MOCK_EXCUSES);
      excuses = await ExcuseLogModel.find({}).sort({ fromTime: -1 }).lean();
    }

    return NextResponse.json(excuses);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch excuses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const excuseId = body.id || `exc-${Date.now().toString().slice(-4)}`;

    const newExcuse = await ExcuseLogModel.create({
      id: excuseId,
      userId: body.userId,
      userName: body.userName,
      agentId: body.agentId,
      department: body.department || 'Tier 2 Technical Support',
      shiftGroup: body.shiftGroup || 'CO_1',
      category: body.category,
      subCategory: body.subCategory,
      reason: body.reason,
      remarks: body.remarks || body.reason,
      fromTime: body.fromTime,
      toTime: body.toTime,
      durationMinutes: Number(body.durationMinutes),
      status: 'PENDING',
      ticketNumber: body.ticketNumber,
      attachmentUrl: body.attachmentUrl,
      attachmentName: body.attachmentName,
    });

    // Append Audit Trail
    await AuditLogModel.create({
      id: `aud-${Date.now().toString().slice(-4)}`,
      actorId: body.userId,
      actorName: body.userName,
      actorRole: 'AGENT',
      action: 'EXCUSE_LOGGED',
      entity: 'ExcuseLog',
      entityId: excuseId,
      details: {
        category: body.category,
        subCategory: body.subCategory,
        durationMinutes: body.durationMinutes,
        remarks: body.remarks,
      },
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(newExcuse, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to log exception' },
      { status: 500 }
    );
  }
}
