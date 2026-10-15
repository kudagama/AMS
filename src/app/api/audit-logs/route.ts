import { NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConnected } from '@/lib/mongodb';
import { AuditLogModel } from '@/models/AuditLog';
import { MOCK_AUDIT_LOGS } from '@/lib/mock-data';

export async function GET() {
  try {
    const isConnected = await isDatabaseConnected();
    if (!isConnected) {
      return NextResponse.json(MOCK_AUDIT_LOGS);
    }

    await connectToDatabase();
    let logs = await AuditLogModel.find({}).sort({ createdAt: -1 }).lean();
    if (logs.length === 0) {
      await AuditLogModel.insertMany(MOCK_AUDIT_LOGS);
      logs = await AuditLogModel.find({}).sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
