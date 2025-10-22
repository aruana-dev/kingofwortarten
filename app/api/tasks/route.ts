import { NextRequest, NextResponse } from 'next/server'
import { getJSONBinService } from '@/lib/jsonbin-service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/tasks - Get all saved tasks
 */
export async function GET(request: NextRequest) {
  try {
    // Check if JSONBin is configured
    if (!process.env.JSONBIN_API_KEY) {
      console.log('⚠️ JSONBIN_API_KEY not configured, returning empty tasks')
      return NextResponse.json({
        wortarten: [],
        satzglieder: [],
        fall: [],
        warning: 'JSONBin ist nicht konfiguriert. Bitte JSONBIN_API_KEY in den Environment Variables setzen.'
      })
    }

    const jsonbin = getJSONBinService()
    const tasks = await jsonbin.getTasks()
    
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    // Return empty tasks instead of error to prevent UI crashes
    return NextResponse.json({
      wortarten: [],
      satzglieder: [],
      fall: [],
      error: error instanceof Error ? error.message : 'Fehler beim Laden der Aufgaben'
    })
  }
}

