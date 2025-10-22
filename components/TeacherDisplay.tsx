'use client'

import { GameTask, WORD_TYPES, SATZGLIEDER, FÄLLE, GameMode } from '@/types'

interface TeacherDisplayProps {
  task: GameTask
  timeLimit?: number
  allowedWordTypes: string[]
  currentTaskNumber: number
  totalTasks: number
  players: Array<{id: string, name: string, score: number}>
  showSolutions?: boolean
  gameMode?: GameMode
}

export default function TeacherDisplay({ 
  task, 
  timeLimit,
  allowedWordTypes,
  currentTaskNumber,
  totalTasks,
  players,
  showSolutions = false,
  gameMode = 'wortarten'
}: TeacherDisplayProps) {
  // Get the correct type system based on game mode
  const getTypeSystem = () => {
    switch (gameMode) {
      case 'satzglieder':
        return SATZGLIEDER
      case 'fall':
        return FÄLLE
      default:
        return WORD_TYPES
    }
  }
  
  const TYPE_SYSTEM = getTypeSystem()
  
  const getWordTypeLabel = (wordType: string) => {
    if (!wordType || !TYPE_SYSTEM) return wordType
    return (TYPE_SYSTEM as any)[wordType]?.label || wordType
  }
  
  const getWordTypeColor = (wordType: string) => {
    if (!wordType || !TYPE_SYSTEM) return 'bg-gray-500 text-white'
    return (TYPE_SYSTEM as any)[wordType]?.color || 'bg-gray-500 text-white'
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Progress */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Aufgabe {currentTaskNumber} von {totalTasks}
        </h2>
        {timeLimit && (
          <p className="text-gray-600">Zeit pro Aufgabe: {timeLimit} Sekunden</p>
        )}
      </div>

      {/* Sentence Display */}
      <div className="card mb-8">
        <h3 className="text-xl font-semibold mb-4 text-center text-primary-600">
          Aktuelle Aufgabe für die Schüler:
        </h3>
        <div className="text-3xl text-center leading-relaxed font-medium text-gray-800 py-6">
          {task.sentence}
        </div>
      </div>

      {/* Words to identify */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">
          {showSolutions ? 'Lösungen:' : 'Wörter in diesem Satz:'}
        </h3>
        <div className="flex flex-wrap gap-3 justify-center">
          {task.words.map((word) => {
            const correctType = task.correctAnswers[word.id]
            const isRelevant = correctType && allowedWordTypes.includes(correctType)
            const isOtherType = !correctType || !allowedWordTypes.includes(correctType)
            
            const wordTypeInfo = correctType ? (TYPE_SYSTEM as any)[correctType] : null
            
            return (
              <div
                key={word.id}
                className={`
                  px-4 py-3 rounded-lg border-2 text-lg font-semibold transition-all shadow-sm
                  ${showSolutions && isRelevant && wordTypeInfo
                    ? `${wordTypeInfo.color} ${wordTypeInfo.borderColor}` 
                    : showSolutions && isOtherType
                      ? 'bg-gray-500 text-white border-gray-500'
                      : 'bg-gray-100 text-gray-700 border-gray-300'
                  }
                  ${word.isUncertain && showSolutions ? 'ring-2 ring-orange-400' : ''}
                `}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span>{word.text}</span>
                    {word.isUncertain && showSolutions && (
                      <span className="text-orange-500 text-sm" title="Unsichere Klassifizierung">⚠️</span>
                    )}
                  </div>
                  {showSolutions && isRelevant && correctType && (
                    <div className="text-xs mt-1 font-normal opacity-90">
                      {getWordTypeLabel(correctType)}
                      {word.isUncertain && word.alternativeWordType && (
                        <span className="block text-orange-200 mt-0.5">
                          (OpenAI: {getWordTypeLabel(word.alternativeWordType)})
                        </span>
                      )}
                    </div>
                  )}
                  {showSolutions && isOtherType && (
                    <div className="text-xs mt-1 font-normal opacity-90">
                      Andere{gameMode === 'fall' ? 'r Fall' : gameMode === 'satzglieder' ? 's Satzglied' : ' Wortart'}
                      {word.isUncertain && word.alternativeWordType && (
                        <span className="block text-orange-200 mt-0.5">
                          (OpenAI: {getWordTypeLabel(word.alternativeWordType)})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {!showSolutions && (
          <p className="text-sm text-gray-600 text-center mt-4">
            ⏳ Warte, bis alle Schüler geantwortet haben, um die Lösungen zu sehen
          </p>
        )}
      </div>

      {/* Available word types */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Verfügbare Wortarten für Schüler:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.values(WORD_TYPES)
            .filter(wordType => wordType.id === 'andere' || allowedWordTypes.includes(wordType.id))
            .map((wordType) => (
              <div
                key={wordType.id}
                className={`p-4 rounded-lg border-2 text-center font-semibold shadow-sm ${wordType.color} ${wordType.borderColor}`}
              >
                {wordType.label}
              </div>
            ))
          }
        </div>
        <p className="text-sm text-gray-600 mt-3">
          💡 Schüler können Wörter, die zu keiner der ausgewählten Wortarten gehören, als "Andere Wortart" markieren
        </p>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 text-center">
          <strong>Hinweis:</strong> Dies ist die Lehrer-Ansicht. Die Schüler sehen diese Aufgabe und können die Wörter den Wortarten zuordnen.
        </p>
      </div>
    </div>
  )
}
