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
    const { playerId } = await request.json()

    const session = gameEngine.getSession(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Mark player as submitted
    const player = session.players.find(p => p.id === playerId)
    if (player) {
      player.hasSubmittedCurrentTask = true
      console.log(`Player ${player.name} submitted task. hasSubmittedCurrentTask = true`)
    } else {
      console.log(`Player with id ${playerId} not found!`)
    }

    // Check if all players have submitted
    const allSubmitted = session.players.every(p => p.hasSubmittedCurrentTask)
    console.log(`Submit status: ${session.players.filter(p => p.hasSubmittedCurrentTask).length}/${session.players.length} submitted. All submitted: ${allSubmitted}`)
    console.log('Players:', session.players.map(p => ({ name: p.name, submitted: p.hasSubmittedCurrentTask })))

    return NextResponse.json({ 
      success: true,
      allSubmitted,
      submittedCount: session.players.filter(p => p.hasSubmittedCurrentTask).length,
      totalPlayers: session.players.length
    })
  } catch (error) {
    console.error('Error submitting task:', error)
    return NextResponse.json({ error: 'Failed to submit task' }, { status: 500 })
  }
}

