import { NextRequest, NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game-engine'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { config } = await request.json()
    
    if (!config || !config.wordTypes || config.wordTypes.length === 0) {
      return NextResponse.json(
        { error: 'Invalid configuration' },
        { status: 400 }
      )
    }

    const session = await gameEngine.createSession(config)
    
    return NextResponse.json({
      sessionId: session.id,
      sessionCode: session.code,
      session
    })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
