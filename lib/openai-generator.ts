import { GameConfig, GameTask, Word } from '@/types'

export class OpenAIGenerator {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateTasks(config: GameConfig): Promise<GameTask[]> {
    const tasks: GameTask[] = []
    
    for (let i = 0; i < config.taskCount; i++) {
      try {
        const task = await this.generateSingleTask(config)
        tasks.push(task)
      } catch (error) {
        console.error('Error generating task:', error)
        // Fallback to rule-based generation
        const fallbackTask = this.generateFallbackTask(config, i)
        tasks.push(fallbackTask)
      }
    }

    return tasks
  }

  private async generateSingleTask(config: GameConfig): Promise<GameTask> {
    const data = await this.callOpenAI(config)
    const openAITask = await this.parseOpenAIResponse(data, config)
    
    console.log(`📝 OpenAI generated sentence: "${openAITask.sentence}"`)
    console.log(`📊 OpenAI found ${openAITask.words.length} words`)
    
    // FOOL-PROOF: Count actual words in sentence
    const actualWordCount = this.countWordsInSentence(openAITask.sentence)
    console.log(`🔢 Actual words in sentence: ${actualWordCount}`)
    
    // Use POS Tagger to get ALL words in the sentence
    try {
      const improvedTask = await this.improveTaskWithPOSTagger(openAITask, config.wordTypes)
      console.log(`✅ POS Tagger improved task: ${improvedTask.words.length} words total`)
      
      // VALIDATION: Check if word count matches
      if (improvedTask.words.length !== actualWordCount) {
        console.warn(`⚠️ POS Tagger word count mismatch! Expected ${actualWordCount}, got ${improvedTask.words.length}`)
        console.warn(`   Falling back to simple tokenization...`)
        return this.createTaskWithSimpleTokenization(openAITask, config.wordTypes)
      }
      
      return improvedTask
    } catch (error) {
      console.error('❌ POS Tagger failed:', error)
      console.warn('⚠️ Falling back to simple tokenization')
      return this.createTaskWithSimpleTokenization(openAITask, config.wordTypes)
    }
  }
  
  private countWordsInSentence(sentence: string): number {
    // Remove punctuation and split by whitespace
    return sentence
      .replace(/[.,!?;:]/g, '')
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length
  }
  
  private createTaskWithSimpleTokenization(openAITask: GameTask, wordTypes: string[]): GameTask {
    // Simple but RELIABLE: Split sentence by whitespace
    const sentence = openAITask.sentence
    const tokens = sentence
      .replace(/[.,!?;:]/g, '')
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
    
    console.log(`🔧 Simple tokenization: ${tokens.length} words found`)
    console.log(`   Words: ${tokens.join(', ')}`)
    
    // Map OpenAI's word types and explanations to our tokens
    const openAIWordMap = new Map<string, { wordType: string, explanation?: string }>()
    openAITask.words.forEach(word => {
      const cleanText = word.text.toLowerCase().replace(/[.,!?;:]/g, '')
      openAIWordMap.set(cleanText, { 
        wordType: word.correctWordType,
        explanation: word.explanation 
      })
    })
    
    // Create words array with ALL tokens
    const words: Word[] = tokens.map((token, index) => {
      const cleanToken = token.toLowerCase()
      const openAIData = openAIWordMap.get(cleanToken)
      const wordType = openAIData?.wordType || 'andere'
      const explanation = openAIData?.explanation
      
      return {
        id: this.generateId(),
        text: token,
        correctWordType: wordType,
        position: index,
        explanation
      }
    })
    
    // Build correct answers based on selected word types
    const correctAnswers: { [wordId: string]: string } = {}
    words.forEach(word => {
      if (wordTypes.includes(word.correctWordType)) {
        correctAnswers[word.id] = word.correctWordType
      }
    })
    
    console.log(`✅ Task created with ${words.length} words, ${Object.keys(correctAnswers).length} need to be answered`)
    
    return {
      id: openAITask.id,
      sentence,
      words,
      correctAnswers,
      timeLimit: openAITask.timeLimit
    }
  }
  
  private async improveTaskWithPOSTagger(task: GameTask, wordTypes: string[]): Promise<GameTask> {
    // Try to find POS Tagger
    let posTaggerUrl = process.env.POS_TAGGER_URL
    
    console.log(`🔍 Looking for POS Tagger...`)
    console.log(`   ENV POS_TAGGER_URL: ${posTaggerUrl || 'not set'}`)
    
    if (!posTaggerUrl) {
      try {
        const fs = await import('fs')
        const path = await import('path')
        const portFile = path.join(process.cwd(), 'pos-tagger', '.port')
        if (fs.existsSync(portFile)) {
          const port = fs.readFileSync(portFile, 'utf-8').trim()
          posTaggerUrl = `http://localhost:${port}`
          console.log(`   Found .port file: ${posTaggerUrl}`)
        }
      } catch (error) {
        console.log(`   .port file not found`)
      }
    }
    
    if (!posTaggerUrl) {
      console.log(`   Trying default ports...`)
      const defaultPorts = [5006, 5005, 5004, 5003, 5002, 5001, 5000]
      for (const port of defaultPorts) {
        try {
          const testUrl = `http://localhost:${port}/health`
          const testResponse = await fetch(testUrl, { signal: AbortSignal.timeout(500) })
          if (testResponse.ok) {
            posTaggerUrl = `http://localhost:${port}`
            console.log(`   Found POS Tagger on port ${port}`)
            break
          }
        } catch {
          continue
        }
      }
    }
    
    if (!posTaggerUrl) {
      console.error(`❌ POS Tagger not found on any port`)
      throw new Error('POS Tagger not found')
    }
    
    console.log(`✅ Using POS Tagger: ${posTaggerUrl}`)
    
    // Analyze sentence with POS Tagger
    const response = await fetch(`${posTaggerUrl}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence: task.sentence })
    })
    
    if (!response.ok) {
      throw new Error('POS Tagger request failed')
    }
    
    const data = await response.json()
    console.log(`✅ POS Tagger improved OpenAI task: ${data.words.length} words found`)
    
    // Create a map of OpenAI explanations by word text (lowercase)
    const explanationMap = new Map<string, string>()
    task.words.forEach(word => {
      if (word.explanation) {
        explanationMap.set(word.text.toLowerCase(), word.explanation)
      }
    })
    
    // Map POS Tagger words and try to match explanations
    const words: Word[] = data.words.map((w: any) => ({
      id: this.generateId(),
      text: w.text,
      correctWordType: w.wordType,
      position: w.position,
      explanation: explanationMap.get(w.text.toLowerCase()) // Keep explanation from OpenAI if available
    }))
    
    console.log(`📚 Preserved ${words.filter(w => w.explanation).length} explanations from OpenAI`)
    
    // Build correct answers based on selected word types
    const correctAnswers: { [wordId: string]: string } = {}
    words.forEach(word => {
      if (wordTypes.includes(word.correctWordType)) {
        correctAnswers[word.id] = word.correctWordType
      }
    })
    
    return {
      ...task,
      words,
      correctAnswers
    }
  }

  private async callOpenAI(config: GameConfig): Promise<any> {
    const wordTypesList = config.wordTypes.join(', ')
    const difficulty = this.getDifficultyDescription(config.difficulty)
    
    const prompt = `Erstelle einen deutschen Satz für ein Wortarten-Lernspiel.

Anforderungen:
- Schwierigkeitsgrad: ${difficulty}
- Enthaltene Wortarten: ${wordTypesList}
- Satz sollte 5-12 Wörter haben
- Verwende verschiedene Satzstrukturen
- Achte auf korrekte deutsche Grammatik

Für jedes Wort, das zu den ausgewählten Wortarten gehört, gib eine kurze, kinderfreundliche Erklärung:
- Warum gehört dieses Wort zu dieser Wortart?
- Wie kann man das erkennen?
- Tipp für die Zukunft (max 2 Sätze)

Antworte im folgenden JSON-Format:
{
  "sentence": "Der Satz hier",
  "words": [
    {
      "text": "Wort1", 
      "wordType": "nomen",
      "explanation": "Kurze Erklärung warum dies ein Nomen ist"
    },
    {
      "text": "Wort2", 
      "wordType": "verben",
      "explanation": "Kurze Erklärung warum dies ein Verb ist"
    }
  ]
}

Wortarten-IDs: nomen, verben, adjektive, artikel, pronomen, adverbien, präpositionen, konjunktionen
Hinweis: Nur Wörter der ausgewählten Wortarten brauchen eine explanation.`

    // Add timeout to prevent infinite waits
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Du bist ein Experte für deutsche Grammatik und Pädagogik. Erstelle präzise, lehrreiche Sätze für Wortarten-Übungen.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('OpenAI request timeout (30s)')
      }
      throw error
    }
  }

  private async parseOpenAIResponse(data: any, config: GameConfig): Promise<GameTask> {
    const content = data.choices[0].message.content
    
    try {
      // Extract JSON from markdown code blocks if present
      let jsonContent = content.trim()
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      const parsed = JSON.parse(jsonContent)
      return this.createTaskFromOpenAI(parsed, config.wordTypes)
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      console.error('Raw content:', content)
      throw new Error('Invalid response format')
    }
  }

  private createTaskFromOpenAI(data: any, wordTypes: string[]): GameTask {
    const words: Word[] = data.words.map((w: any, index: number) => ({
      id: this.generateId(),
      text: w.text.replace(/[.,!?;:]$/, ''),
      correctWordType: w.wordType,
      position: index,
      explanation: w.explanation || undefined // Include explanation from OpenAI
    }))

    const correctAnswers: { [wordId: string]: string } = {}
    words.forEach(word => {
      if (wordTypes.includes(word.correctWordType)) {
        correctAnswers[word.id] = word.correctWordType
      }
    })

    console.log(`📚 Task with explanations: ${words.filter(w => w.explanation).length}/${words.length} words have explanations`)

    return {
      id: this.generateId(),
      sentence: data.sentence,
      words,
      correctAnswers,
      timeLimit: 20 // Default time limit
    }
  }

  private generateFallbackTask(config: GameConfig, index: number): GameTask {
    // Fallback to rule-based generation
    const sentences = this.getFallbackSentences(config.difficulty)
    const sentence = sentences[index % sentences.length]
    
    return this.createTaskFromSentence(sentence, config.wordTypes, config.difficulty)
  }

  private getDifficultyDescription(difficulty: string): string {
    switch (difficulty) {
      case 'easy':
        return 'Einfach - kurze, einfache Sätze mit Grundwortarten'
      case 'medium':
        return 'Mittel - mittlere Komplexität mit Nebensätzen und erweiterten Strukturen'
      case 'hard':
        return 'Schwer - komplexe Sätze mit mehreren Nebensätzen und schwierigen Grammatikstrukturen'
      default:
        return 'Mittel'
    }
  }

  private getFallbackSentences(difficulty: string): string[] {
    const sentences = {
      easy: [
        "Der große Hund läuft schnell.",
        "Die schöne Blume blüht im Garten.",
        "Ein kleiner Vogel singt laut.",
        "Das alte Buch liegt auf dem Tisch.",
        "Meine liebe Mutter kocht gerne.",
      ],
      medium: [
        "Gestern ging ich mit meinem Freund ins Kino.",
        "Die kluge Lehrerin erklärt den Schülern die Mathematik.",
        "Obwohl es regnet, spielen die Kinder draußen.",
        "Das neue Auto fährt sehr schnell und sicher.",
        "Wenn du kommst, können wir zusammen lernen.",
      ],
      hard: [
        "Trotz des schlechten Wetters entschied sich der mutige Bergsteiger, den Gipfel zu erklimmen.",
        "Während die anderen Schüler bereits nach Hause gegangen waren, blieb der fleißige Student noch in der Bibliothek.",
        "Obwohl er sich sehr angestrengt hatte, konnte er die schwierige Prüfung nicht bestehen.",
        "Die erfahrene Ärztin untersuchte den Patienten gründlich und stellte eine seltene Diagnose.",
        "Nachdem er jahrelang im Ausland gelebt hatte, kehrte er in seine Heimatstadt zurück.",
      ]
    }
    
    return sentences[difficulty as keyof typeof sentences] || sentences.medium
  }

  private createTaskFromSentence(sentence: string, wordTypes: string[], difficulty: string): GameTask {
    const words = sentence.split(' ').map((text, index) => ({
      id: this.generateId(),
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
      id: this.generateId(),
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
    
    // Adverbien
    if (['sehr', 'nicht', 'auch', 'nur', 'schon', 'noch', 'immer', 'oft', 'manchmal', 'selten', 'nie', 'heute', 'gestern', 'morgen', 'hier', 'dort', 'da', 'so', 'dann', 'jetzt'].includes(lowerWord)) {
      return 'adverbien'
    }
    
    // Verben
    if (lowerWord.endsWith('en') || lowerWord.endsWith('st') || lowerWord.endsWith('t') || lowerWord.endsWith('e')) {
      return 'verben'
    }
    
    // Adjektive
    if (lowerWord.endsWith('ig') || lowerWord.endsWith('lich') || lowerWord.endsWith('isch') || lowerWord.endsWith('bar') || lowerWord.endsWith('sam')) {
      return 'adjektive'
    }
    
    // Nomen (großgeschrieben)
    if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
      return 'nomen'
    }
    
    return 'adjektive'
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}
