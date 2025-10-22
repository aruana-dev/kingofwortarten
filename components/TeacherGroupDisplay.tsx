'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import { GameTask, SentencePart, SATZGLIEDER, FÄLLE, GameMode } from '@/types'

interface TeacherGroupDisplayProps {
  task: GameTask
  timeLimit?: number
  allowedWordTypes: string[]
  currentTaskNumber: number
  totalTasks: number
  players: Array<{id: string, name: string, score: number}>
  showSolutions?: boolean
  gameMode: GameMode
}

export default function TeacherGroupDisplay({ 
  task, 
  timeLimit,
  allowedWordTypes,
  currentTaskNumber,
  totalTasks,
  players,
  showSolutions = false,
  gameMode
}: TeacherGroupDisplayProps) {
  const TYPE_SYSTEM = gameMode === 'fall' ? FÄLLE : SATZGLIEDER
  
  const getTypeConfig = (typeId: string) => {
    return (TYPE_SYSTEM as any)[typeId] || (TYPE_SYSTEM as any).andere
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Progress */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Aufgabe {currentTaskNumber} von {totalTasks}
        </h2>
        {timeLimit && (
          <p className="text-gray-600">Zeit: {timeLimit} Sekunden</p>
        )}
      </div>

      {/* Sentence */}
      <div className="card mb-6">
        <h3 className="text-xl font-semibold mb-4 text-center">
          {gameMode === 'fall' ? 'Erkenne die Fälle:' : 'Erkenne die Satzglieder:'}
        </h3>
        <p className="text-2xl text-center py-6 leading-relaxed">
          {task.sentence}
        </p>
      </div>

      {/* Solutions - Show sentence parts/groups */}
      {showSolutions && task.sentenceParts && task.sentenceParts.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-xl font-semibold mb-4 text-center text-green-700">
            ✅ Lösungen ({gameMode === 'fall' ? 'Fälle' : 'Satzglieder'}):
          </h3>
          <div className="space-y-3">
            {task.sentenceParts
              .filter(part => allowedWordTypes.includes(part.correctType))
              .map((part) => {
                const typeConfig = getTypeConfig(part.correctType)
                
                return (
                  <div
                    key={part.id}
                    className={`p-4 rounded-lg border-2 ${typeConfig.borderColor} bg-white`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-medium">{part.text}</span>
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                    </div>
                    {part.explanation && (
                      <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r">
                        <p className="text-sm text-blue-900">{part.explanation}</p>
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Waiting for students */}
      {!showSolutions && (
        <div className="card bg-yellow-50 border-2 border-yellow-200 text-center">
          <p className="text-yellow-800 font-medium">
            ⏳ Warte auf Schüler-Antworten...
          </p>
        </div>
      )}

      {/* Player Status */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Schüler-Status:</h3>
        <div className="space-y-2">
          {players.map(player => (
            <div key={player.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="font-medium">{player.name}</span>
              <span className="text-sm text-gray-600">
                Punkte: {player.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

