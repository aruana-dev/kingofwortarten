'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Clock, CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { GameTask, Word, WORD_TYPES } from '@/types'

interface GameBoardProps {
  task: GameTask
  timeLimit?: number
  onAnswer: (wordId: string, wordType: string) => void
  onTimeUp?: () => void
  onSubmit?: () => void
  playerAnswers: { [wordId: string]: string }
  isFinished: boolean
  allowedWordTypes?: string[]
}

export default function GameBoard({ 
  task, 
  timeLimit, 
  onAnswer, 
  onTimeUp,
  onSubmit,
  playerAnswers,
  isFinished,
  allowedWordTypes
}: GameBoardProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit || 0)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)

  useEffect(() => {
    if (!timeLimit || isFinished) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onTimeUp?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLimit, onTimeUp, isFinished])

  const handleWordClick = (word: Word) => {
    if (isFinished) return
    setSelectedWord(selectedWord === word.id ? null : word.id)
  }

  const handleWordTypeClick = (wordType: string) => {
    if (!selectedWord || isFinished) return
    
    onAnswer(selectedWord, wordType)
    setSelectedWord(null)
  }

  const getWordTypeColor = (wordType: string) => {
    return WORD_TYPES[wordType as keyof typeof WORD_TYPES]?.color || 'bg-gray-100 text-gray-800'
  }

  const getAnswerStatus = (wordId: string) => {
    const answer = playerAnswers[wordId]
    if (!answer) return null
    
    const correctAnswer = task.correctAnswers[wordId]
    
    // If player selected "andere" and word doesn't have a correct answer in selected types
    if (answer === 'andere' && !correctAnswer) {
      return 'other' // Yellow question mark
    }
    
    const isCorrect = correctAnswer === answer
    return isCorrect ? 'correct' : 'incorrect'
  }

  // Calculate progress: count all words
  const totalWords = task.words.length
  const answeredWords = task.words.filter(word => 
    playerAnswers[word.id] !== undefined
  )
  const progress = totalWords > 0 
    ? Math.round((answeredWords.length / totalWords) * 100)
    : 0

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Timer */}
      {timeLimit && !isFinished && (
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-2 bg-white rounded-full px-6 py-3 shadow-lg">
            <Clock className="w-5 h-5 text-primary-600" />
            <span className="text-2xl font-bold text-primary-600">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      )}

      {/* Sentence */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold mb-4 text-center">Erkennst du die Wortarten?</h2>
        <div className="text-2xl text-center leading-relaxed mb-4">
          {task.sentence}
        </div>
        
        {/* Progress indicator */}
        {!isFinished && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Fortschritt: {answeredWords.length} von {totalWords} Wörtern</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Words */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Wörter zum Zuordnen:</h3>
        <p className="text-sm text-gray-600 mb-3">
          💡 Tipp: Ordne alle Wörter den richtigen Wortarten zu!
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {task.words.map((word) => {
            const answer = playerAnswers[word.id]
            const status = getAnswerStatus(word.id)
            
            return (
              <button
                key={word.id}
                onClick={() => handleWordClick(word)}
                className={`
                  px-4 py-2 rounded-lg border-2 transition-all duration-200 text-lg font-medium relative
                  ${selectedWord === word.id 
                    ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  ${answer ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
                  ${status === 'correct' ? 'border-green-500 bg-green-50' : ''}
                  ${status === 'incorrect' ? 'border-red-500 bg-red-50' : ''}
                  ${status === 'other' ? 'border-yellow-500 bg-yellow-50' : ''}
                `}
                disabled={!!answer || isFinished}
              >
                <div className="flex items-center space-x-2">
                  <span>{word.text}</span>
                  {status === 'correct' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {status === 'incorrect' && <XCircle className="w-5 h-5 text-red-600" />}
                  {status === 'other' && <HelpCircle className="w-5 h-5 text-yellow-600" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Word Type Containers */}
      {selectedWord && !isFinished && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Wähle die Wortart für "{task.words.find(w => w.id === selectedWord)?.text}"
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(WORD_TYPES)
              .filter(wordType => 
                wordType.id === 'andere' || 
                !allowedWordTypes || 
                allowedWordTypes.includes(wordType.id)
              )
              .map((wordType) => (
                <button
                  key={wordType.id}
                  onClick={() => handleWordTypeClick(wordType.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 font-medium hover:shadow-md ${wordType.color} ${
                    wordType.id === 'andere' ? 'border-gray-400' : ''
                  }`}
                >
                  {wordType.label}
                </button>
              ))
            }
          </div>
          <p className="text-xs text-gray-600 text-center mt-3">
            💡 Tipp: Wenn das Wort zu keiner der angezeigten Wortarten gehört, wähle "Andere Wortart"
          </p>
        </div>
      )}

      {/* Submit Button */}
      {!isFinished && onSubmit && (
        <div className="card bg-gradient-to-r from-primary-50 to-secondary-50 border-2 border-primary-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Bereit zum Abgeben?</h3>
            <p className="text-sm text-gray-600 mb-4">
              {progress === 100 
                ? '✅ Du hast alle Wörter zugeordnet!' 
                : `⚠️ Du hast ${answeredWords.length} von ${totalWords} Wörtern zugeordnet.`
              }
            </p>
            <button
              onClick={onSubmit}
              disabled={progress !== 100}
              className={`
                px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200
                ${progress !== 100
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                }
              `}
            >
              {progress === 100 ? '✓ Aufgabe abgeben' : `→ Noch ${totalWords - answeredWords.length} Wörter übrig`}
            </button>
            {progress !== 100 && (
              <p className="text-xs text-gray-600 mt-2">
                Du musst alle Wörter zuordnen, bevor du abgeben kannst.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {isFinished && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 text-center">Aufgabe beendet!</h3>
          <div className="space-y-2">
            {task.words.map((word) => {
              const answer = playerAnswers[word.id]
              const correctAnswer = task.correctAnswers[word.id]
              const actualWordType = word.correctWordType // The real word type from POS tagger
              
              // Check if answer is correct
              let isCorrect = false
              if (answer === 'andere' && !correctAnswer) {
                // Correctly identified as "other"
                isCorrect = true
              } else if (correctAnswer && answer === correctAnswer) {
                // Correctly identified the specific word type
                isCorrect = true
              }
              
              return (
                <div key={word.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-medium">{word.text}</span>
                  <div className="flex items-center space-x-2">
                    {answer && (
                      <span className={`px-2 py-1 rounded text-sm ${getWordTypeColor(answer)}`}>
                        {WORD_TYPES[answer as keyof typeof WORD_TYPES]?.label}
                      </span>
                    )}
                    {isCorrect ? (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        {answer === 'andere' && actualWordType && (
                          <span className="text-xs text-gray-600">
                            (eigentlich: {WORD_TYPES[actualWordType as keyof typeof WORD_TYPES]?.label || actualWordType})
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-gray-600">
                          {correctAnswer 
                            ? WORD_TYPES[correctAnswer as keyof typeof WORD_TYPES]?.label
                            : `Andere Wortart (${WORD_TYPES[actualWordType as keyof typeof WORD_TYPES]?.label || actualWordType})`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
