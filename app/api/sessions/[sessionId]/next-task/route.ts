import { NextRequest, NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game-engine'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const session = gameEngine.nextTask(sessionId)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session state' },
        { status: 400 }
      )
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error moving to next task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
