'use client'

import { GameTask, WORD_TYPES } from '@/types'

interface TeacherDisplayProps {
  task: GameTask
  timeLimit?: number
  allowedWordTypes: string[]
  currentTaskNumber: number
  totalTasks: number
  players: Array<{id: string, name: string, score: number}>
  showSolutions?: boolean
}

export default function TeacherDisplay({ 
  task, 
  timeLimit,
  allowedWordTypes,
  currentTaskNumber,
  totalTasks,
  players,
  showSolutions = false
}: TeacherDisplayProps) {
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
            
            return (
              <div
                key={word.id}
                className={`
                  px-4 py-3 rounded-lg border-2 text-lg font-medium transition-all
                  ${showSolutions && isRelevant 
                    ? `${WORD_TYPES[correctType as keyof typeof WORD_TYPES]?.color} border-gray-400` 
                    : showSolutions && isOtherType
                      ? 'bg-gray-200 text-gray-800 border-gray-400'
                      : 'bg-gray-100 text-gray-700 border-gray-300'
                  }
                `}
              >
                <div className="text-center">
                  <div className="font-bold">{word.text}</div>
                  {showSolutions && isRelevant && correctType && (
                    <div className="text-xs mt-1 opacity-75">
                      {WORD_TYPES[correctType as keyof typeof WORD_TYPES]?.label}
                    </div>
                  )}
                  {showSolutions && isOtherType && (
                    <div className="text-xs mt-1 opacity-75">
                      Andere Wortart
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
                className={`p-4 rounded-lg border-2 border-gray-400 text-center font-medium ${wordType.color}`}
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
