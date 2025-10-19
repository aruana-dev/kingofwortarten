import { NextRequest, NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game-engine'

export async function POST(request: NextRequest) {
  try {
    const { code, playerName } = await request.json()
    
    if (!code || !playerName) {
      return NextResponse.json(
        { error: 'Code and player name are required' },
        { status: 400 }
      )
    }

    const session = gameEngine.joinSession(code, playerName)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or already started' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      playerId: session.players[session.players.length - 1].id,
      session
    })
  } catch (error) {
    console.error('Error joining session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
