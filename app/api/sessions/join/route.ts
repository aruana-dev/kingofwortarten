import { NextRequest, NextResponse } from 'next/server'
import { gameEngine } from '@/lib/game-engine'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { code, playerName } = await request.json()
    
    console.log('=== JOIN API CALLED ===')
    console.log(`Code: ${code}`)
    console.log(`Player Name: ${playerName}`)
    
    if (!code || !playerName) {
      return NextResponse.json(
        { error: 'Code and player name are required' },
        { status: 400 }
      )
    }

    const session = gameEngine.joinSession(code, playerName)
    
    if (!session) {
      console.error(`❌ Session with code ${code} not found!`)
      return NextResponse.json(
        { error: 'Session not found or already started' },
        { status: 404 }
      )
    }

    const newPlayer = session.players[session.players.length - 1]
    console.log(`✅ Player joined successfully!`)
    console.log(`   Player ID: ${newPlayer.id}`)
    console.log(`   Player Name: ${newPlayer.name}`)
    console.log(`   Session ID: ${session.id}`)
    console.log(`   Total players: ${session.players.length}`)
    console.log('=== JOIN API END ===')

    return NextResponse.json({
      playerId: newPlayer.id,
      session
    })
  } catch (error) {
    console.error('❌ Error joining session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
