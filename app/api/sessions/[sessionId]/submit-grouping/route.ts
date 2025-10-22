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
    const { playerId, groupings } = await request.json()
    
    console.log('=== SUBMIT GROUPING API ===')
    console.log('Session ID:', sessionId)
    console.log('Player ID:', playerId)
    console.log('Groupings:', JSON.stringify(groupings, null, 2))
    
    if (!playerId || !groupings) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = gameEngine.submitGroupings(sessionId, playerId, groupings)
    
    console.log('✅ Grouping result:', result)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Error submitting grouping:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

