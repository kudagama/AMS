import { NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConnected } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { MOCK_USERS } from '@/lib/mock-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const group = searchParams.get('group');

    const isConnected = await isDatabaseConnected();
    if (!isConnected) {
      let filtered = [...MOCK_USERS];
      if (role) filtered = filtered.filter((u) => u.role === role);
      if (group) filtered = filtered.filter((u) => u.shiftGroup.includes(group));
      return NextResponse.json(filtered);
    }

    await connectToDatabase();
    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (group) query.shiftGroup = { $regex: group, $options: 'i' };

    let users = await UserModel.find(query).lean();
    if (users.length === 0 && !role && !group) {
      // Auto-seed if empty
      await UserModel.insertMany(MOCK_USERS);
      users = await UserModel.find({}).lean();
    }

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const newUser = await UserModel.create({
      id: body.id || `u-${Date.now().toString().slice(-4)}`,
      agentId: body.agentId,
      name: body.name,
      email: body.email,
      role: body.role || 'AGENT',
      department: body.department || 'Tier 2 Technical Support',
      shiftGroup: body.shiftGroup || 'CO_1',
      avatarUrl: body.avatarUrl,
      isActive: true,
      currentShiftStatus: body.currentShiftStatus || 'OFF_SHIFT',
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    );
  }
}
