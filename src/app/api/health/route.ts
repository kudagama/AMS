import { NextResponse } from 'next/server';
import { connectToDatabase, isDatabaseConnected } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { ShiftModel } from '@/models/Shift';
import { ShiftSwapModel } from '@/models/ShiftSwap';
import { ExcuseLogModel } from '@/models/ExcuseLog';


export async function GET() {
  try {
    const isConnected = await isDatabaseConnected();
    if (!isConnected) {
      return NextResponse.json({
        status: 'DISCONNECTED',
        database: 'MongoDB',
        message: 'MongoDB is not currently connected. Check MONGODB_URI in .env.local',
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ams_db',
      });
    }

    await connectToDatabase();
    const userCount = await UserModel.countDocuments();
    const shiftCount = await ShiftModel.countDocuments();
    const swapCount = await ShiftSwapModel.countDocuments();
    const excuseCount = await ExcuseLogModel.countDocuments();

    return NextResponse.json({
      status: 'CONNECTED',
      database: 'MongoDB',
      stats: {
        users: userCount,
        shifts: shiftCount,
        swaps: swapCount,
        excuses: excuseCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
