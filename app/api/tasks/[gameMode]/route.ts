import { NextRequest, NextResponse } from 'next/server'
import { getJSONBinService } from '@/lib/jsonbin-service'
import { GameMode } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/tasks/[gameMode] - Get tasks for a specific game mode
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameMode: string }> }
) {
  try {
    const { gameMode } = await params
    
    // Validate game mode
    if (!['wortarten', 'satzglieder', 'fall'].includes(gameMode)) {
      return NextResponse.json(
        { error: 'Invalid game mode' },
        { status: 400 }
      )
    }
    
    const jsonbin = getJSONBinService()
    const tasks = await jsonbin.getTasksForMode(gameMode as GameMode)
    
    return NextResponse.json({ tasks, count: tasks.length })
  } catch (error) {
    console.error('Error fetching tasks for mode:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

