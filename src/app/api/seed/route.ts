import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { ShiftModel } from '@/models/Shift';
import { ShiftSwapModel } from '@/models/ShiftSwap';
import { ExcuseLogModel } from '@/models/ExcuseLog';
import { AuditLogModel } from '@/models/AuditLog';
import { AppNotificationModel } from '@/models/AppNotification';
import { 
  MOCK_USERS, 
  MOCK_SHIFTS, 
  MOCK_SWAPS, 
  MOCK_EXCUSES, 
  MOCK_AUDIT_LOGS, 
  MOCK_NOTIFICATIONS 
} from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    const existingUsers = await UserModel.countDocuments();
    if (existingUsers > 0 && !force) {
      return NextResponse.json({
        message: 'Database is already seeded with data. Use ?force=true to re-seed.',
        counts: {
          users: await UserModel.countDocuments(),
          shifts: await ShiftModel.countDocuments(),
          swaps: await ShiftSwapModel.countDocuments(),
          excuses: await ExcuseLogModel.countDocuments(),
        },
      });
    }

    // Clear existing collections if force
    if (force) {
      await UserModel.deleteMany({});
      await ShiftModel.deleteMany({});
      await ShiftSwapModel.deleteMany({});
      await ExcuseLogModel.deleteMany({});
      await AuditLogModel.deleteMany({});
      await AppNotificationModel.deleteMany({});
    }

    // Insert mock seed data
    await UserModel.insertMany(MOCK_USERS);
    await ShiftModel.insertMany(MOCK_SHIFTS);
    await ShiftSwapModel.insertMany(MOCK_SWAPS);
    await ExcuseLogModel.insertMany(MOCK_EXCUSES);
    await AuditLogModel.insertMany(MOCK_AUDIT_LOGS);
    await AppNotificationModel.insertMany(MOCK_NOTIFICATIONS);

    return NextResponse.json({
      success: true,
      message: 'MongoDB database successfully seeded with CO_1 group records!',
      counts: {
        users: MOCK_USERS.length,
        shifts: MOCK_SHIFTS.length,
        swaps: MOCK_SWAPS.length,
        excuses: MOCK_EXCUSES.length,
        auditLogs: MOCK_AUDIT_LOGS.length,
        notifications: MOCK_NOTIFICATIONS.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Database seeding failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST(new Request('http://localhost:3000/api/seed'));
}
