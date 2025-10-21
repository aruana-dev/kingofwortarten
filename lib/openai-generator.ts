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
    console.log('🔄 Starting double-validation process...')
    
    // First attempt
    console.log('   Attempt 1/2...')
    const data1 = await this.callOpenAI(config)
    const task1 = await this.parseOpenAIResponse(data1, config)
    
    // Second attempt (independent)
    console.log('   Attempt 2/2...')
    const data2 = await this.callOpenAI(config)
    const task2 = await this.parseOpenAIResponse(data2, config)
    
    console.log(`📝 Sentence 1: "${task1.sentence}"`)
    console.log(`📝 Sentence 2: "${task2.sentence}"`)
    
    // Compare the two results
    const discrepancies = this.compareResults(task1, task2)
    
    if (discrepancies.length === 0) {
      console.log('✅ Both attempts match perfectly! Using result.')
      return task1
    }
    
    console.log(`⚠️ Found ${discrepancies.length} discrepancies between attempts:`)
    discrepancies.forEach(d => console.log(`   - ${d}`))
    
    // Third attempt as tiebreaker
    console.log('   Attempt 3/3 (tiebreaker)...')
    const data3 = await this.callOpenAI(config)
    const task3 = await this.parseOpenAIResponse(data3, config)
    
    console.log(`📝 Sentence 3: "${task3.sentence}"`)
    
    // Use majority voting for final result
    const finalTask = this.resolveTiebreaker(task1, task2, task3)
    console.log(`✅ Using tiebreaker result: "${finalTask.sentence}"`)
    
    return finalTask
  }
  
  private compareResults(task1: GameTask, task2: GameTask): string[] {
    const discrepancies: string[] = []
    
    // If sentences are different, they're completely different tasks
    if (task1.sentence !== task2.sentence) {
      discrepancies.push(`Different sentences: "${task1.sentence}" vs "${task2.sentence}"`)
      return discrepancies
    }
    
    // Same sentence, compare word classifications
    if (task1.words.length !== task2.words.length) {
      discrepancies.push(`Different word counts: ${task1.words.length} vs ${task2.words.length}`)
      return discrepancies
    }
    
    // Compare each word's classification
    for (let i = 0; i < task1.words.length; i++) {
      const word1 = task1.words[i]
      const word2 = task2.words[i]
      
      if (word1.text !== word2.text) {
        discrepancies.push(`Word ${i}: "${word1.text}" vs "${word2.text}"`)
      } else if (word1.correctWordType !== word2.correctWordType) {
        discrepancies.push(`Word "${word1.text}": ${word1.correctWordType} vs ${word2.correctWordType}`)
      }
    }
    
    return discrepancies
  }
  
  private resolveTiebreaker(task1: GameTask, task2: GameTask, task3: GameTask): GameTask {
    // If all three sentences are different, use the first one
    if (task1.sentence !== task2.sentence && task2.sentence !== task3.sentence && task1.sentence !== task3.sentence) {
      console.log('   → All three different, using first')
      return task1
    }
    
    // If two sentences match, use that one
    if (task1.sentence === task2.sentence) {
      console.log('   → Sentence 1 & 2 match')
      return this.mergeTasks(task1, task2, task3)
    }
    if (task1.sentence === task3.sentence) {
      console.log('   → Sentence 1 & 3 match')
      return this.mergeTasks(task1, task3, task2)
    }
    if (task2.sentence === task3.sentence) {
      console.log('   → Sentence 2 & 3 match')
      return this.mergeTasks(task2, task3, task1)
    }
    
    // Fallback: use first
    console.log('   → No clear match, using first')
    return task1
  }
  
  private mergeTasks(primary: GameTask, secondary: GameTask, tertiary: GameTask): GameTask {
    // Use primary as base, but resolve word type conflicts with majority voting
    const mergedWords = primary.words.map((word, i) => {
      const secondaryWord = secondary.words[i]
      const tertiaryWord = tertiary.words[i]
      
      // If primary and secondary agree, use that
      if (word.correctWordType === secondaryWord?.correctWordType) {
        return word
      }
      
      // If primary and tertiary agree, use primary
      if (word.correctWordType === tertiaryWord?.correctWordType) {
        return word
      }
      
      // If secondary and tertiary agree, use secondary
      if (secondaryWord?.correctWordType === tertiaryWord?.correctWordType) {
        console.log(`   → Word "${word.text}": majority votes ${secondaryWord.correctWordType} (was ${word.correctWordType})`)
        return { ...word, correctWordType: secondaryWord.correctWordType }
      }
      
      // No agreement, keep primary
      console.log(`   → Word "${word.text}": no majority, keeping ${word.correctWordType}`)
      return word
    })
    
    return {
      ...primary,
      words: mergedWords
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
    console.log(`✅ POS Tagger analyzed sentence: ${data.words.length} words found`)
    
    // Create maps from OpenAI task
    const explanationMap = new Map<string, string>()
    const openAIWordTypeMap = new Map<string, string>()
    
    task.words.forEach(word => {
      const cleanText = word.text.toLowerCase()
      if (word.explanation) {
        explanationMap.set(cleanText, word.explanation)
      }
      openAIWordTypeMap.set(cleanText, word.correctWordType)
    })
    
    // DOUBLE VALIDATION: Compare POS Tagger with OpenAI
    console.log(`🔍 Double validation: Comparing POS Tagger vs OpenAI...`)
    let uncertainCount = 0
    
    const words: Word[] = data.words.map((w: any) => {
      const cleanText = w.text.toLowerCase()
      const posTaggerType = w.wordType
      const openAIType = openAIWordTypeMap.get(cleanText)
      
      // Check if they disagree
      const isUncertain = openAIType && openAIType !== posTaggerType
      
      if (isUncertain) {
        uncertainCount++
        console.log(`   ⚠️ UNCERTAIN: "${w.text}" → POS Tagger: ${posTaggerType}, OpenAI: ${openAIType}`)
      }
      
      return {
        id: this.generateId(),
        text: w.text,
        correctWordType: posTaggerType, // Use POS Tagger as primary
        position: w.position,
        explanation: explanationMap.get(cleanText),
        isUncertain: isUncertain,
        alternativeWordType: isUncertain ? openAIType : undefined
      }
    })
    
    console.log(`📚 Preserved ${words.filter(w => w.explanation).length} explanations from OpenAI`)
    console.log(`⚠️ Found ${uncertainCount} uncertain words (disagreement between systems)`)
    
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
    // GPT-5 (o1) models are optimized for reasoning, NOT for structured JSON output
    // They return reasoning_tokens but no content when using response_format: json_object
    // Therefore, we use gpt-4o which is excellent for structured tasks
    const model = process.env.OPENAI_MODEL || 'gpt-4o'
    const maxTokensEnv = Number(process.env.OPENAI_MAX_COMPLETION_TOKENS || '800')
    
    const prompt = `Create a German sentence for a word type learning game.

REQUIREMENTS:
- Difficulty: ${difficulty}
- Required word types: ${wordTypesList}
- Sentence length: 5-12 words
- Use varied sentence structures
- Grammatically correct German

CRITICAL: WORD TYPE CLASSIFICATION RULES
Use EXACTLY these word type IDs (lowercase, no variations):

1. "nomen" = NOUNS
   - All nouns (people, animals, things, abstract concepts)
   - Proper nouns (names, places)
   - Examples: Hund, Katze, Berlin, Liebe, Auto

2. "verben" = VERBS
   - ALL verb forms (infinitive, conjugated, participles)
   - Auxiliary verbs (sein, haben, werden)
   - Modal verbs (können, müssen, wollen)
   - Examples: laufen, läuft, gelaufen, ist, hatte, wird

3. "adjektive" = ADJECTIVES ONLY
   - Descriptive words that modify nouns
   - Can be declined or undeclined
   - Examples: groß, schön, alt, neue, guten
   - NOT adverbs! (see below)

4. "artikel" = ARTICLES
   - Definite: der, die, das, den, dem, des
   - Indefinite: ein, eine, einen, einem, eines
   - Examples: der, die, das, ein, eine

5. "pronomen" = ALL PRONOUNS (no subcategories!)
   - Personal: ich, du, er, sie, es, wir, ihr, sie
   - Possessive: mein, dein, sein, ihr, unser
   - Demonstrative: dieser, jener, solcher
   - Relative: der, die, das (when relative)
   - Interrogative: wer, was, welcher
   - Indefinite: man, jemand, niemand, etwas
   - Reflexive: mich, dich, sich
   - Examples: ich, mein, dieser, wer, man, sich

6. "adverbien" = ADVERBS
   - Words that modify verbs, adjectives, or other adverbs
   - Answer: how? when? where? why?
   - Examples: schnell, heute, hier, deshalb, sehr, oft
   - NOT adjectives! (adjectives modify nouns)

7. "präpositionen" = PREPOSITIONS
   - Words that show relationships (place, time, direction)
   - Examples: in, auf, unter, mit, nach, zu, von, für

8. "konjunktionen" = CONJUNCTIONS
   - Coordinating: und, oder, aber, denn
   - Subordinating: weil, dass, wenn, obwohl, während
   - Examples: und, aber, weil, dass, wenn

IMPORTANT DISAMBIGUATION:
- "schnell" when describing HOW something happens = adverbien (Der Hund läuft schnell)
- "schnell" when describing a noun = adjektive (Der schnelle Hund)
- "sein/haben/werden" = verben (always, even as auxiliary)
- All pronoun types = pronomen (no subcategories!)

OUTPUT FORMAT (JSON only, no markdown):
CRITICAL RULES:
1. Include ALL words from the sentence in the "words" array, not just the selected word types
2. Do NOT include punctuation (commas, periods, etc.) as separate words
3. Words should be the actual text without punctuation
4. In explanations, put the word itself in quotation marks

For words that match the selected word types (${wordTypesList}), provide:
- "wordType": the correct word type ID
- "explanation": a brief, child-friendly explanation (max 2 sentences) with the word in quotes

For words that DON'T match the selected word types, provide:
- "wordType": the correct word type ID (even if not selected)
- "explanation": omit or leave empty

Example for sentence "Der große Hund läuft schnell." with selected types: nomen, adjektive
{
  "sentence": "Der große Hund läuft schnell.",
  "words": [
    {
      "text": "Der",
      "wordType": "artikel"
    },
    {
      "text": "große",
      "wordType": "adjektive",
      "explanation": "\"Große\" ist ein Adjektiv, weil es das Nomen 'Hund' näher beschreibt. Adjektive beantworten die Frage 'Wie ist etwas?'"
    },
    {
      "text": "Hund",
      "wordType": "nomen",
      "explanation": "\"Hund\" ist ein Nomen, weil es ein Lebewesen bezeichnet. Nomen schreibt man groß und kann oft 'der/die/das' davor setzen."
    },
    {
      "text": "läuft",
      "wordType": "verben"
    },
    {
      "text": "schnell",
      "wordType": "adverbien"
    }
  ]
}

IMPORTANT: 
- The words array MUST contain ALL words from the sentence, in order
- NO punctuation marks as separate words (no commas, periods, etc.)
- Always put the word itself in quotation marks in the explanation

CRITICAL: Respond ONLY with valid JSON. No reasoning text, no explanations, no markdown.
Start your response immediately with the opening brace: {`

    // Add timeout to prevent infinite waits
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    try {
      console.log(`🧠 OpenAI model selected: ${model}`)

      // Build request body for GPT-4o (optimized for structured outputs)
      const requestBody: any = {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a German grammar expert. Respond ONLY with valid JSON. No reasoning, no explanations, no markdown fences. Your entire response must be parseable as JSON and start with { and end with }.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_completion_tokens: maxTokensEnv,
        response_format: { type: 'json_object' }
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        let errText = ''
        try {
          errText = await response.text()
        } catch {}
        throw new Error(`OpenAI API error ${response.status}: ${errText}`)
      }
      
      const data = await response.json()
      
      // LOG: Full GPT Response
      console.log('═══════════════════════════════════════════════════════')
      console.log('🤖 OpenAI RESPONSE:')
      console.log('═══════════════════════════════════════════════════════')
      console.log('Model:', data.model)
      console.log('Usage:', JSON.stringify(data.usage, null, 2))
      console.log('\n📝 Generated Content:')
      console.log(data.choices[0].message.content)
      console.log('═══════════════════════════════════════════════════════\n')
      
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
    const message = data.choices?.[0]?.message
    const content = message?.content ?? ''
    console.log('🔍 Parsing OpenAI response...')
    console.log('   message keys:', message ? Object.keys(message) : 'n/a')

    try {
      // Preferred path: strict JSON (response_format=json_object)
      if ((typeof content === 'string' ? content.trim().length : 0) === 0) {
        // Some models put JSON into tool calls or message annotations (future-proof)
        const toolJson = message?.tool_calls?.[0]?.function?.arguments
        if (toolJson && typeof toolJson === 'string') {
          const parsedTool = JSON.parse(toolJson)
          console.log('✅ Parsed JSON from tool_calls')
          return this.createTaskFromOpenAI(parsedTool, config.wordTypes)
        }

        // Some models put structured object directly on message.parsed
        if (message?.parsed && typeof message.parsed === 'object') {
          console.log('✅ Parsed JSON from message.parsed')
          return this.createTaskFromOpenAI(message.parsed, config.wordTypes)
        }

        // Some models return array content segments
        if (Array.isArray(message?.content)) {
          const textChunks = message.content
            .map((c: any) => (typeof c === 'string' ? c : c?.text || c?.content || ''))
            .join('\n')
            .trim()
          if (textChunks) {
            let cj = textChunks
            if (cj.startsWith('```')) {
              cj = cj.replace(/^```json?\s*/, '').replace(/\s*```$/, '')
            }
            const parsedArr = JSON.parse(cj)
            console.log('✅ Parsed JSON from array content')
            return this.createTaskFromOpenAI(parsedArr, config.wordTypes)
          }
        }
      }

      // Fallback: extract JSON from content (code fence or inline)
      let jsonContent = typeof content === 'string' ? content.trim() : ''
      if (jsonContent.startsWith('```json')) {
        console.log('   Found JSON code block, extracting...')
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (jsonContent.startsWith('```')) {
        console.log('   Found generic code block, extracting...')
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
      } else {
        // Try to locate the first and last curly braces
        const blob = jsonContent || JSON.stringify(message || {})
        const start = blob.indexOf('{')
        const end = blob.lastIndexOf('}')
        if (start !== -1 && end !== -1 && end > start) {
          jsonContent = blob.slice(start, end + 1)
        }
      }

      const parsed = JSON.parse(jsonContent)
      console.log('✅ Successfully parsed JSON from content')
      console.log('   Sentence:', parsed.sentence)
      console.log('   Words:', parsed.words?.length || 0)
      console.log('   Words with explanations:', parsed.words?.filter((w: any) => w.explanation).length || 0)

      return this.createTaskFromOpenAI(parsed, config.wordTypes)
    } catch (parseError) {
      console.error('❌ Error parsing response:', parseError)
      console.error('📄 Raw content:', content)
      throw new Error('Invalid response format')
    }
  }

  private createTaskFromOpenAI(data: any, wordTypes: string[]): GameTask {
    // Filter out punctuation-only words and clean up text
    const filteredWords = data.words.filter((w: any) => {
      const cleanText = w.text.trim()
      // Remove if it's ONLY punctuation
      const isPunctuationOnly = /^[.,!?;:\-–—()«»""\[\]{}]+$/.test(cleanText)
      if (isPunctuationOnly) {
        console.log(`   🚫 Filtered out punctuation-only word: "${cleanText}"`)
        return false
      }
      return true
    })
    
    const words: Word[] = filteredWords.map((w: any, index: number) => {
      // Clean the text: remove trailing punctuation
      const cleanedText = w.text.trim().replace(/[.,!?;:]$/, '')
      
      return {
        id: this.generateId(),
        text: cleanedText,
        correctWordType: w.wordType,
        position: index,
        explanation: w.explanation || undefined,
        // No uncertainty tracking - we trust GPT-4o with clear glossary
        isUncertain: false,
        alternativeWordType: undefined
      }
    })

    const correctAnswers: { [wordId: string]: string } = {}
    words.forEach(word => {
      if (wordTypes.includes(word.correctWordType)) {
        correctAnswers[word.id] = word.correctWordType
      }
    })

    console.log(`📚 GPT-5 Task: ${words.filter(w => w.explanation).length}/${words.length} words have explanations`)
    console.log(`🎯 Confident classification (no POS Tagger comparison)`)

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
