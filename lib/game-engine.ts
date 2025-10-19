import { GameSession, GameTask, Word, GameConfig, WORD_TYPES, SAMPLE_SENTENCES } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { OpenAIGenerator } from './openai-generator'

export class GameEngine {
  private sessions: Map<string, GameSession> = new Map()
  private openaiGenerator?: OpenAIGenerator

  constructor(openaiApiKey?: string) {
    if (openaiApiKey) {
      this.openaiGenerator = new OpenAIGenerator(openaiApiKey)
    }
  }

  async createSession(config: GameConfig): Promise<GameSession> {
    const sessionId = uuidv4()
    const sessionCode = this.generateSessionCode()
    
    const tasks = await this.generateTasks(config)
    
    const session: GameSession = {
      id: sessionId,
      code: sessionCode,
      config,
      players: [],
      currentTask: 0,
      isActive: true,
      isStarted: false,
      isFinished: false,
      tasks,
      createdAt: new Date()
    }

    this.sessions.set(sessionId, session)
    return session
  }

  joinSession(sessionCode: string, playerName: string): GameSession | null {
    const session = Array.from(this.sessions.values())
      .find(s => s.code === sessionCode && s.isActive && !s.isStarted)
    
    if (!session) return null

    const playerId = uuidv4()
    const player = {
      id: playerId,
      name: playerName,
      score: 0,
      isReady: false,
      hasSubmittedCurrentTask: false
    }

    session.players.push(player)
    return session
  }

  startSession(sessionId: string): GameSession | null {
    const session = this.sessions.get(sessionId)
    if (!session || session.players.length === 0) return null

    session.isStarted = true
    return session
  }

  getSession(sessionId: string): GameSession | null {
    return this.sessions.get(sessionId) || null
  }

  getSessionByCode(code: string): GameSession | null {
    return Array.from(this.sessions.values())
      .find(s => s.code === code) || null
  }

  submitAnswer(sessionId: string, playerId: string, wordId: string, wordType: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session || !session.isStarted || session.isFinished) return false

    const currentTask = session.tasks[session.currentTask]
    if (!currentTask) return false

    const player = session.players.find(p => p.id === playerId)
    if (!player) return false

    // Check if this word should be answered (is it in the allowed word types?)
    const correctAnswer = currentTask.correctAnswers[wordId]
    
    if (correctAnswer === undefined) {
      // Word doesn't belong to any of the selected word types
      // If player selected "andere", that's correct!
      if (wordType === 'andere') {
        player.score += 1
        return true
      } else {
        // Player selected a specific word type for a word that doesn't belong to selected types
        player.score = Math.max(0, player.score - 1)
        return false
      }
    }

    // Word should be answered - check if correct
    const isCorrect = correctAnswer === wordType
    if (isCorrect) {
      player.score += 1
    } else {
      // Wrong word type -> -1 point (minimum 0)
      player.score = Math.max(0, player.score - 1)
    }

    return isCorrect
  }

  nextTask(sessionId: string): GameSession | null {
    const session = this.sessions.get(sessionId)
    if (!session || !session.isStarted) return null

    session.currentTask += 1
    if (session.currentTask >= session.tasks.length) {
      session.isFinished = true
    }

    // Reset submission status for all players for the new task
    session.players.forEach(player => {
      player.hasSubmittedCurrentTask = false
    })

    return session
  }

  private generateSessionCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private async generateTasks(config: GameConfig): Promise<GameTask[]> {
    // Try OpenAI first if available
    if (this.openaiGenerator) {
      try {
        console.log('Generating tasks with OpenAI...')
        return await this.openaiGenerator.generateTasks(config)
      } catch (error) {
        console.error('OpenAI generation failed, falling back to rule-based:', error)
      }
    }
    
    // Fallback: Use enhanced rule-based generation
    console.log('Using rule-based sentence generation')
    const tasks: GameTask[] = []
    const sentences = this.getEnhancedSentences(config.difficulty, config.wordTypes)
    
    // Shuffle sentences for more variety
    const shuffled = sentences.sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < config.taskCount; i++) {
      const sentence = shuffled[i % shuffled.length]
      const task = await this.createTaskFromSentence(sentence, config.wordTypes, config.difficulty)
      tasks.push(task)
    }

    return tasks
  }

  private getEnhancedSentences(difficulty: string, wordTypes: string[]): string[] {
    const baseSentences = SAMPLE_SENTENCES[difficulty as keyof typeof SAMPLE_SENTENCES]
    
    // Add more variety based on selected word types
    const additionalSentences = {
      easy: [
        "Der kleine Junge spielt gerne Fußball.",
        "Die rote Rose duftet wunderbar.",
        "Ein großer Baum steht im Park.",
        "Das neue Auto fährt sehr schnell.",
        "Meine beste Freundin kommt heute.",
        "Der alte Mann liest ein Buch.",
        "Die junge Frau singt schön.",
        "Ein kleiner Hund bellt laut.",
        "Das große Haus hat viele Zimmer.",
        "Die schöne Musik klingt gut."
      ],
      medium: [
        "Gestern Abend ging ich mit meinen Freunden ins Theater.",
        "Die erfahrene Lehrerin erklärt den Schülern die schwierige Aufgabe.",
        "Obwohl es stark regnet, spielen die Kinder fröhlich im Garten.",
        "Das moderne Auto fährt sehr schnell und verbraucht wenig Benzin.",
        "Wenn du morgen kommst, können wir zusammen das neue Museum besuchen.",
        "Die kluge Studentin lernt fleißig für ihre wichtige Prüfung.",
        "Trotz des schlechten Wetters entschied sich die Familie für einen Spaziergang.",
        "Die junge Ärztin arbeitet sehr hart und hilft vielen Patienten.",
        "Das interessante Buch liegt auf dem großen Tisch in der Bibliothek.",
        "Meine liebe Großmutter backt gerne leckere Kekse für ihre Enkelkinder."
      ],
      hard: [
        "Trotz des anhaltend schlechten Wetters entschied sich der erfahrene Bergsteiger, den gefährlichen Gipfel zu erklimmen.",
        "Während die anderen fleißigen Schüler bereits nach Hause gegangen waren, blieb der ehrgeizige Student noch stundenlang in der ruhigen Bibliothek.",
        "Obwohl er sich sehr angestrengt hatte, konnte der enttäuschte Student die schwierige Prüfung nicht bestehen.",
        "Die erfahrene Ärztin untersuchte den besorgten Patienten gründlich und stellte eine seltene, aber behandelbare Diagnose.",
        "Nachdem er jahrelang im fernen Ausland gelebt hatte, kehrte der wehmütige Mann in seine geliebte Heimatstadt zurück.",
        "Die kluge Lehrerin erklärte den aufmerksamen Schülern geduldig die komplizierte Mathematikaufgabe.",
        "Obwohl das Wetter sehr schlecht war, entschied sich die mutige Familie für einen spontanen Ausflug in die Berge.",
        "Die junge, aber erfahrene Ärztin arbeitet sehr hart und hilft täglich vielen hilfsbedürftigen Patienten.",
        "Das interessante, aber schwierige Buch liegt auf dem großen, alten Tisch in der ruhigen Bibliothek.",
        "Meine liebe, aber strenge Großmutter backt gerne leckere, aber gesunde Kekse für ihre süßen Enkelkinder."
      ]
    }
    
    const additional = additionalSentences[difficulty as keyof typeof additionalSentences] || []
    return [...baseSentences, ...additional]
  }

  private async createTaskFromSentence(sentence: string, wordTypes: string[], difficulty: string): Promise<GameTask> {
    // Try to use POS Tagger API if available
    try {
      // Try to read port from file, fallback to default ports
      let posTaggerUrl = process.env.POS_TAGGER_URL
      
      if (!posTaggerUrl) {
        try {
          const fs = await import('fs')
          const path = await import('path')
          const portFile = path.join(process.cwd(), 'pos-tagger', '.port')
          if (fs.existsSync(portFile)) {
            const port = fs.readFileSync(portFile, 'utf-8').trim()
            posTaggerUrl = `http://localhost:${port}`
            console.log(`Using POS Tagger on port ${port}`)
          }
        } catch (error) {
          // Ignore file reading errors
        }
      }
      
      // Fallback to trying multiple default ports
      if (!posTaggerUrl) {
        const defaultPorts = [5001, 5000, 5002, 5003]
        for (const port of defaultPorts) {
          try {
            const testUrl = `http://localhost:${port}/health`
            const testResponse = await fetch(testUrl, { 
              signal: AbortSignal.timeout(500) 
            })
            if (testResponse.ok) {
              posTaggerUrl = `http://localhost:${port}`
              console.log(`Found POS Tagger on port ${port}`)
              break
            }
          } catch {
            continue
          }
        }
      }
      
      if (!posTaggerUrl) {
        throw new Error('POS Tagger service not found')
      }
      
      const response = await fetch(`${posTaggerUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence })
      })

      if (response.ok) {
        const data = await response.json()
        const words = data.words.map((w: any) => ({
          id: uuidv4(),
          text: w.text,
          correctWordType: w.wordType,
          position: w.position
        }))

        const correctAnswers: { [wordId: string]: string } = {}
        words.forEach((word: Word) => {
          if (wordTypes.includes(word.correctWordType)) {
            correctAnswers[word.id] = word.correctWordType
          }
        })

        return {
          id: uuidv4(),
          sentence,
          words,
          correctAnswers,
          timeLimit: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 20 : 15
        }
      }
    } catch (error) {
      console.error('POS Tagger API not available, using fallback:', error)
    }

    // Fallback to rule-based detection
    const words = sentence.split(' ').map((text, index) => ({
      id: uuidv4(),
      text: text.replace(/[.,!?;:]$/, ''),
      correctWordType: this.determineWordType(text),
      position: index
    }))

    const correctAnswers: { [wordId: string]: string } = {}
    words.forEach(word => {
      if (wordTypes.includes(word.correctWordType)) {
        correctAnswers[word.id] = word.correctWordType
      }
    })

    return {
      id: uuidv4(),
      sentence,
      words,
      correctAnswers,
      timeLimit: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 20 : 15
    }
  }

  private determineWordType(word: string): string {
    const lowerWord = word.toLowerCase()
    
    // Artikel
    if (['der', 'die', 'das', 'ein', 'eine', 'einen', 'einem', 'einer', 'eines'].includes(lowerWord)) {
      return 'artikel'
    }
    
    // Pronomen
    if (['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie', 'mich', 'dich', 'sich', 'uns', 'euch', 'mein', 'dein', 'sein', 'ihr', 'unser', 'euer'].includes(lowerWord)) {
      return 'pronomen'
    }
    
    // Präpositionen
    if (['in', 'auf', 'unter', 'über', 'neben', 'zwischen', 'durch', 'für', 'gegen', 'ohne', 'mit', 'von', 'zu', 'bei', 'nach', 'vor', 'hinter', 'an', 'um'].includes(lowerWord)) {
      return 'präpositionen'
    }
    
    // Konjunktionen
    if (['und', 'oder', 'aber', 'denn', 'sondern', 'dass', 'weil', 'wenn', 'obwohl', 'damit', 'während', 'bevor', 'nachdem', 'bis', 'seit', 'sobald'].includes(lowerWord)) {
      return 'konjunktionen'
    }
    
    // Adverbien (häufige)
    if (['sehr', 'nicht', 'auch', 'nur', 'schon', 'noch', 'immer', 'oft', 'manchmal', 'selten', 'nie', 'heute', 'gestern', 'morgen', 'hier', 'dort', 'da', 'so', 'dann', 'jetzt'].includes(lowerWord)) {
      return 'adverbien'
    }
    
    // Verben (endet oft mit -en, -st, -t, -e)
    if (lowerWord.endsWith('en') || lowerWord.endsWith('st') || lowerWord.endsWith('t') || lowerWord.endsWith('e')) {
      return 'verben'
    }
    
    // Adjektive (endet oft mit -ig, -lich, -isch, -bar, -sam)
    if (lowerWord.endsWith('ig') || lowerWord.endsWith('lich') || lowerWord.endsWith('isch') || lowerWord.endsWith('bar') || lowerWord.endsWith('sam')) {
      return 'adjektive'
    }
    
    // Nomen (großgeschrieben)
    if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
      return 'nomen'
    }
    
    // Fallback: Adjektive
    return 'adjektive'
  }
}

// Singleton instance with OpenAI support
// Use global to prevent Hot Module Reload from creating new instances
const globalForGameEngine = global as unknown as { gameEngine: GameEngine }

export const gameEngine = 
  globalForGameEngine.gameEngine ?? 
  new GameEngine(process.env.OPENAI_API_KEY)

if (process.env.NODE_ENV !== 'production') {
  globalForGameEngine.gameEngine = gameEngine
}
