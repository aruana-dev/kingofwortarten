import { NextRequest, NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game-engine'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { config, useStoredTasks } = await request.json()
    
    if (!config || !config.wordTypes || config.wordTypes.length === 0) {
      return NextResponse.json(
        { error: 'Invalid configuration' },
        { status: 400 }
      )
    }

    console.log(`📝 Creating session with ${useStoredTasks ? 'stored' : 'new'} tasks`)
    const session = await gameEngine.createSession(config, useStoredTasks || false)
    
    return NextResponse.json({
      sessionId: session.id,
      sessionCode: session.code,
      session
    })
  } catch (error) {
    console.error('Error creating session:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
