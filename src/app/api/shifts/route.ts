import { NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConnected } from '@/lib/mongodb';
import { ShiftModel } from '@/models/Shift';
import { MOCK_SHIFTS } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const shiftDate = searchParams.get('shiftDate');

    const isConnected = await isDatabaseConnected();
    if (!isConnected) {
      let filtered = [...MOCK_SHIFTS];
      if (userId) filtered = filtered.filter((s) => s.userId === userId);
      if (shiftDate) filtered = filtered.filter((s) => s.shiftDate === shiftDate);
      return NextResponse.json(filtered);
    }

    await connectToDatabase();
    const query: Record<string, unknown> = {};
    if (userId) query.userId = userId;
    if (shiftDate) query.shiftDate = shiftDate;

    let shifts = await ShiftModel.find(query).sort({ shiftDate: 1 }).lean();
    if (shifts.length === 0 && !userId && !shiftDate) {
      await ShiftModel.insertMany(MOCK_SHIFTS);
      shifts = await ShiftModel.find({}).sort({ shiftDate: 1 }).lean();
    }

    return NextResponse.json(shifts);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch shifts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const newShift = await ShiftModel.create({
      id: body.id || `sh-${Date.now().toString().slice(-5)}`,
      userId: body.userId,
      userName: body.userName,
      userRole: body.userRole || 'AGENT',
      shiftDate: body.shiftDate,
      startTime: body.startTime,
      endTime: body.endTime,
      type: body.type,
      shiftCode: body.shiftCode || '8',
      status: body.status || 'SCHEDULED',
      location: body.location || 'ON_SITE',
      notes: body.notes,
      allowSwap: body.allowSwap ?? true,
    });

    return NextResponse.json(newShift, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create shift' },
      { status: 500 }
    );
  }
}
