import { NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConnected } from '@/lib/mongodb';
import { AppNotificationModel } from '@/models/AppNotification';
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const isConnected = await isDatabaseConnected();
    if (!isConnected) {
      return NextResponse.json(MOCK_NOTIFICATIONS);
    }

    await connectToDatabase();
    const query: Record<string, unknown> = {};
    if (userId) query.userId = userId;

    let notifications = await AppNotificationModel.find(query).sort({ createdAt: -1 }).lean();
    if (notifications.length === 0 && !userId) {
      await AppNotificationModel.insertMany(MOCK_NOTIFICATIONS);
      notifications = await AppNotificationModel.find({}).sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  try {
    const isConnected = await isDatabaseConnected();
    if (isConnected) {
      await connectToDatabase();
      await AppNotificationModel.updateMany({}, { read: true });
    }
    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
