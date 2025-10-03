import { inngest } from '@/inngest/client';
import { events } from '@/inngest/events';
import { AutosaveProjectRequest } from '@/redux/api/project';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const body: AutosaveProjectRequest = await request.json();

    const { projectId, userId, shapesData, viewportData } = body;
    if (!projectId || !userId || !shapesData) {
      return NextResponse.json(
        { error: 'ProjectId, userId and shapes data are required' },
        { status: 400 },
      );
    }

    const eventResult = await inngest.send({
      name: events.autosave.name,
      data: { projectId, userId, shapesData, viewportData },
    });

    return NextResponse.json({
      success: true,
      message: 'Project autosave initiated',
      eventId: eventResult.ids[0],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to autosave project',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
