import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

// GET /api/activity-log?ownerId=xxx
// List activity logs for an owner, newest first, capped at 50
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');

    if (!ownerId) {
      return NextResponse.json(
        { error: 'ownerId query parameter is required' },
        { status: 400 }
      );
    }

    const logs = await db.activityLog.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        action: true,
        description: true,
        metadata: true,
        createdAt: true,
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

// POST /api/activity-log
// Create a new activity log entry
export async function POST(request: NextRequest) {
  try {
    // Auth guard
    const authError = requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { ownerId, action, description, metadata } = body;

    if (!ownerId || !action) {
      return NextResponse.json(
        { error: 'ownerId and action are required' },
        { status: 400 }
      );
    }

    const log = await db.activityLog.create({
      data: {
        ownerId,
        action,
        description: description ?? null,
        metadata: metadata ?? null,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error creating activity log:', error);
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    );
  }
}
