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

    console.log('=== SUBMIT API CALLED ===')
    console.log(`Session ID: ${sessionId}`)
    console.log(`Player ID: ${playerId}`)

    const session = gameEngine.getSession(sessionId)
    if (!session) {
      console.error(`❌ Session ${sessionId} not found!`)
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    console.log(`✅ Session found. Players in session:`)
    session.players.forEach(p => {
      console.log(`   - ${p.name} (ID: ${p.id}) - submitted: ${p.hasSubmittedCurrentTask}`)
    })

    // Mark player as submitted
    const player = session.players.find(p => p.id === playerId)
    if (player) {
      player.hasSubmittedCurrentTask = true
      console.log(`✅ Player "${player.name}" marked as submitted!`)
    } else {
      console.error(`❌ Player with ID ${playerId} NOT FOUND in session!`)
      console.error(`   Available player IDs:`)
      session.players.forEach(p => console.error(`      - ${p.id} (${p.name})`))
    }

    // Check if all players have submitted
    const allSubmitted = session.players.every(p => p.hasSubmittedCurrentTask)
    const submittedCount = session.players.filter(p => p.hasSubmittedCurrentTask).length
    
    console.log(`📊 Final status: ${submittedCount}/${session.players.length} submitted`)
    console.log(`   All submitted: ${allSubmitted}`)
    console.log('=== SUBMIT API END ===')

    return NextResponse.json({ 
      success: true,
      allSubmitted,
      submittedCount,
      totalPlayers: session.players.length
    })
  } catch (error) {
    console.error('❌ Error submitting task:', error)
    return NextResponse.json({ error: 'Failed to submit task' }, { status: 500 })
  }
}

