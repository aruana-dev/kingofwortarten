import { NextRequest, NextResponse } from 'next/server'
import { getJSONBinService } from '@/lib/jsonbin-service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/tasks - Get all saved tasks
 */
export async function GET(request: NextRequest) {
  try {
    const jsonbin = getJSONBinService()
    const tasks = await jsonbin.getTasks()
    
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

