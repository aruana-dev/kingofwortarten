import { GameTask, GameMode } from '@/types'

interface SavedTasksResponse {
  record: {
    wortarten: GameTask[]
    satzglieder: GameTask[]
    fall: GameTask[]
  }
  metadata: {
    id: string
    createdAt: string
  }
}

export class JSONBinService {
  private apiKey: string
  private binId: string | null = null
  private baseUrl = 'https://api.jsonbin.io/v3'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Save tasks to JSONBin, organized by game mode
   */
  async saveTasks(tasks: GameTask[], gameMode: GameMode): Promise<void> {
    try {
      console.log(`💾 Saving ${tasks.length} tasks for mode: ${gameMode}`)

      // First, try to get existing tasks
      let existingData = {
        wortarten: [] as GameTask[],
        satzglieder: [] as GameTask[],
        fall: [] as GameTask[]
      }

      if (this.binId) {
        try {
          const existing = await this.getTasks()
          existingData = {
            wortarten: existing.wortarten || [],
            satzglieder: existing.satzglieder || [],
            fall: existing.fall || []
          }
        } catch (error) {
          console.log('⚠️ No existing bin found, creating new one')
        }
      }

      // Add new tasks to the appropriate category
      existingData[gameMode] = [...existingData[gameMode], ...tasks]

      // Save to JSONBin
      const url = this.binId 
        ? `${this.baseUrl}/b/${this.binId}`
        : `${this.baseUrl}/b`

      const method = this.binId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': this.apiKey,
          ...(method === 'POST' && { 'X-Bin-Name': 'deutsch-profi-tasks' })
        },
        body: JSON.stringify(existingData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`JSONBin API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      if (method === 'POST') {
        this.binId = data.metadata.id
        console.log(`✅ Created new bin: ${this.binId}`)
      } else {
        console.log(`✅ Updated existing bin: ${this.binId}`)
      }

      console.log(`📊 Total tasks in bin: wortarten=${existingData.wortarten.length}, satzglieder=${existingData.satzglieder.length}, fall=${existingData.fall.length}`)
    } catch (error) {
      console.error('❌ Error saving tasks to JSONBin:', error)
      throw error
    }
  }

  /**
   * Get all saved tasks from JSONBin
   */
  async getTasks(): Promise<{ wortarten: GameTask[], satzglieder: GameTask[], fall: GameTask[] }> {
    try {
      if (!this.binId) {
        // Try to get bin ID from environment variable
        this.binId = process.env.JSONBIN_BIN_ID || null
        if (!this.binId) {
          console.log('⚠️ No bin ID available, returning empty tasks')
          return { wortarten: [], satzglieder: [], fall: [] }
        }
      }

      console.log(`📥 Fetching tasks from bin: ${this.binId}`)

      const response = await fetch(`${this.baseUrl}/b/${this.binId}/latest`, {
        headers: {
          'X-Master-Key': this.apiKey
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.log('⚠️ Bin not found, returning empty tasks')
          return { wortarten: [], satzglieder: [], fall: [] }
        }
        const errorText = await response.text()
        throw new Error(`JSONBin API error: ${response.status} - ${errorText}`)
      }

      const data: SavedTasksResponse = await response.json()
      
      console.log(`✅ Fetched tasks: wortarten=${data.record.wortarten?.length || 0}, satzglieder=${data.record.satzglieder?.length || 0}, fall=${data.record.fall?.length || 0}`)

      return {
        wortarten: data.record.wortarten || [],
        satzglieder: data.record.satzglieder || [],
        fall: data.record.fall || []
      }
    } catch (error) {
      console.error('❌ Error fetching tasks from JSONBin:', error)
      throw error
    }
  }

  /**
   * Get tasks for a specific game mode
   */
  async getTasksForMode(gameMode: GameMode): Promise<GameTask[]> {
    const allTasks = await this.getTasks()
    return allTasks[gameMode] || []
  }

  /**
   * Set the bin ID (useful when loading from environment)
   */
  setBinId(binId: string) {
    this.binId = binId
  }

  /**
   * Get the current bin ID
   */
  getBinId(): string | null {
    return this.binId
  }
}

// Singleton instance
let jsonbinServiceInstance: JSONBinService | null = null

export function getJSONBinService(): JSONBinService {
  if (!jsonbinServiceInstance) {
    const apiKey = process.env.JSONBIN_API_KEY
    if (!apiKey) {
      throw new Error('JSONBIN_API_KEY environment variable is not set')
    }
    jsonbinServiceInstance = new JSONBinService(apiKey)
    
    // Set bin ID from environment if available
    const binId = process.env.JSONBIN_BIN_ID
    if (binId) {
      jsonbinServiceInstance.setBinId(binId)
    }
  }
  return jsonbinServiceInstance
}

