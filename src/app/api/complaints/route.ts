import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const pgId = searchParams.get('pgId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (pgId) where.pgId = pgId;
    if (status) where.status = status;

    const complaints = await db.complaint.findMany({
      where,
      include: {
        pg: {
          select: { id: true, name: true },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, pgId, title, description, category, priority } = body;

    if (!userId || !pgId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const complaint = await db.complaint.create({
      data: {
        userId,
        pgId,
        title,
        description,
        category: category || 'GENERAL',
        priority: priority || 'MEDIUM',
      },
      include: {
        pg: { select: { name: true } },
      },
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, assignedTo, resolution } = body;
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (resolution !== undefined) updateData.resolution = resolution;
    const complaint = await db.complaint.update({ where: { id }, data: updateData });
    return NextResponse.json(complaint);
  } catch (error) {
    console.error('Error updating complaint:', error);
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}
