'use client'

import React, { useState } from 'react'
import { Crown, Users, BookOpen } from 'lucide-react'
import GameBoard from '@/components/GameBoard'
import TeacherDisplay from '@/components/TeacherDisplay'
import Leaderboard from '@/components/Leaderboard'
import { GameConfig, Player, GameTask, WORD_TYPES } from '@/types'

export default function Home() {
  const [role, setRole] = useState<'teacher' | 'student' | null>(null)

  if (role === 'teacher') {
    return <TeacherInterface />
  }

  if (role === 'student') {
    return <StudentInterface />
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Crown className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KingOfWortarten</h1>
          <p className="text-gray-600">Lerne deutsche Wortarten spielerisch</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setRole('teacher')}
            className="w-full card hover:shadow-xl transition-shadow duration-200 text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                <BookOpen className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Lehrer</h3>
                <p className="text-sm text-gray-600">Erstelle und leite eine Spielsession</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setRole('student')}
            className="w-full card hover:shadow-xl transition-shadow duration-200 text-left group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-secondary-100 rounded-lg group-hover:bg-secondary-200 transition-colors">
                <Users className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Schüler</h3>
                <p className="text-sm text-gray-600">Tritt einer Spielsession bei</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

function TeacherInterface() {
  const [step, setStep] = useState<'config' | 'session' | 'game' | 'results'>('config')
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    wordTypes: [],
    taskCount: 10,
    difficulty: 'medium',
    timeLimit: null,
  })
  const [sessionCode, setSessionCode] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [currentTask, setCurrentTask] = useState(0)
  const [tasks, setTasks] = useState<GameTask[]>([])
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [isGameFinished, setIsGameFinished] = useState(false)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  const generateSessionCode = async () => {
    setIsCreatingSession(true)
    setError(null)
    
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: gameConfig })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSessionCode(data.sessionCode)
        setSessionId(data.sessionId)
        setTasks(data.session.tasks)
        setPlayers(data.session.players)
        setStep('session')
        
        // Start polling for new players
        startPolling(data.sessionId)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Fehler beim Erstellen der Session')
      }
    } catch (error) {
      console.error('Error creating session:', error)
      setError('Verbindungsfehler. Bitte versuche es erneut.')
    } finally {
      setIsCreatingSession(false)
    }
  }

  const startGame = async () => {
    setIsStartingGame(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}/start`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setIsGameStarted(true)
        setStep('game')
        stopPolling() // Stop polling when game starts
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Fehler beim Starten des Spiels')
      }
    } catch (error) {
      console.error('Error starting game:', error)
      setError('Verbindungsfehler. Bitte versuche es erneut.')
    } finally {
      setIsStartingGame(false)
    }
  }

  const nextTask = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/next-task`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCurrentTask(data.currentTask)
        setIsGameFinished(data.isFinished)
        
        if (data.isFinished) {
          setStep('results')
        }
      }
    } catch (error) {
      console.error('Error moving to next task:', error)
    }
  }

  const startPolling = (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`)
        if (response.ok) {
          const session = await response.json()
          console.log('Teacher polling - players:', session.players.map((p: any) => ({ 
            name: p.name, 
            hasSubmitted: p.hasSubmittedCurrentTask 
          })))
          setPlayers(session.players)
        }
      } catch (error) {
        console.error('Error polling session:', error)
      }
    }, 2000) // Poll every 2 seconds
    
    setPollingInterval(interval)
  }

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
  }

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  const toggleWordType = (wordType: string) => {
    setGameConfig(prev => ({
      ...prev,
      wordTypes: prev.wordTypes.includes(wordType)
        ? prev.wordTypes.filter(wt => wt !== wordType)
        : [...prev.wordTypes, wordType]
    }))
  }

  if (step === 'config') {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Spiel konfigurieren</h1>
            <p className="text-gray-600">Wähle die Einstellungen für deine Spielrunde</p>
          </div>

          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Wortarten auswählen</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(WORD_TYPES)
                .filter(wordType => wordType.id !== 'andere') // Don't show "Andere Wortart" in selection
                .map(wordType => {
                  const isSelected = gameConfig.wordTypes.includes(wordType.id)
                  
                  // Map word type IDs to specific Tailwind classes (must be complete strings for Tailwind to detect them)
                  const getButtonClasses = () => {
                    if (!isSelected) {
                      return 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }
                    
                    switch (wordType.id) {
                      case 'nomen': return 'bg-blue-500 text-white border-blue-500'
                      case 'verben': return 'bg-green-500 text-white border-green-500'
                      case 'adjektive': return 'bg-yellow-500 text-white border-yellow-500'
                      case 'artikel': return 'bg-purple-500 text-white border-purple-500'
                      case 'pronomen': return 'bg-pink-500 text-white border-pink-500'
                      case 'adverbien': return 'bg-indigo-500 text-white border-indigo-500'
                      case 'präpositionen': return 'bg-red-500 text-white border-red-500'
                      case 'konjunktionen': return 'bg-orange-500 text-white border-orange-500'
                      default: return 'bg-gray-500 text-white border-gray-500'
                    }
                  }
                  
                  return (
                    <button
                      key={wordType.id}
                      onClick={() => toggleWordType(wordType.id)}
                      className={`p-3 rounded-lg border-2 transition-all font-semibold ${getButtonClasses()}`}
                    >
                      {wordType.label}
                    </button>
                  )
                })
              }
            </div>
          </div>

          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Spieleinstellungen</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anzahl Aufgaben
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={gameConfig.taskCount}
                  onChange={(e) => setGameConfig(prev => ({ ...prev, taskCount: parseInt(e.target.value) }))}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schwierigkeitsgrad
                </label>
                <select
                  value={gameConfig.difficulty}
                  onChange={(e) => setGameConfig(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="input-field"
                >
                  <option value="easy">Einfach</option>
                  <option value="medium">Mittel</option>
                  <option value="hard">Schwer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zeit pro Aufgabe (Sekunden)
                </label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={gameConfig.timeLimit || ''}
                  onChange={(e) => setGameConfig(prev => ({ 
                    ...prev, 
                    timeLimit: e.target.value ? parseInt(e.target.value) : null 
                  }))}
                  placeholder="Unbegrenzt"
                  className="input-field"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leer lassen für unbegrenzte Zeit
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={generateSessionCode}
            disabled={gameConfig.wordTypes.length === 0 || isCreatingSession}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isCreatingSession ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Erstelle Session...
              </>
            ) : (
              'Session erstellen'
            )}
          </button>
        </div>
      </div>
    )
  }

  if (step === 'session') {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Session gestartet</h1>
            <p className="text-gray-600">Teile den Code mit deinen Schülern</p>
          </div>

          <div className="card text-center mb-6">
            <h3 className="text-lg font-semibold mb-4">Session-Code</h3>
            <div className="text-4xl font-mono font-bold text-primary-600 mb-4">
              {sessionCode}
            </div>
            <p className="text-gray-600">Schüler können diesem Code beitreten</p>
          </div>

          <div className="card mb-6">
            <h3 className="text-lg font-semibold mb-4">Beigetretene Spieler ({players.length})</h3>
            {players.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Noch keine Spieler beigetreten</p>
            ) : (
              <div className="space-y-2">
                {players.map(player => (
                  <div key={player.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{player.name}</span>
                    <span className="text-sm text-gray-500">Bereit</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={startGame}
            disabled={players.length === 0 || isStartingGame}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isStartingGame ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Starte Spiel...
              </>
            ) : (
              `Spiel starten (${players.length} Spieler)`
            )}
          </button>
        </div>
      </div>
    )
  }

  if (step === 'game') {
    const currentTaskData = tasks[currentTask]
    
    // Check if all players have submitted the current task
    const allPlayersSubmitted = players.length > 0 && players.every(p => p.hasSubmittedCurrentTask)
    console.log('Teacher view - allPlayersSubmitted:', allPlayersSubmitted, 'players:', players.map(p => ({ name: p.name, submitted: p.hasSubmittedCurrentTask })))
    
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Teacher Display - nur Anzeige, keine Interaktion */}
            <div className="lg:col-span-2">
              {currentTaskData && (
                <TeacherDisplay
                  task={currentTaskData}
                  timeLimit={gameConfig.timeLimit || undefined}
                  allowedWordTypes={gameConfig.wordTypes}
                  currentTaskNumber={currentTask + 1}
                  totalTasks={tasks.length}
                  players={players}
                  showSolutions={allPlayersSubmitted}
                />
              )}
            </div>
            
            {/* Leaderboard */}
            <div className="lg:col-span-1">
              <Leaderboard
                players={players}
                currentTask={currentTask}
                totalTasks={tasks.length}
                isGameFinished={isGameFinished}
              />
            </div>
          </div>
          
          {/* Submission Status */}
          <div className="mt-6 card">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Abgabe-Status</h3>
              <p className="text-gray-600 mb-4">
                {players.filter(p => p.hasSubmittedCurrentTask).length} von {players.length} Schüler haben abgegeben
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    allPlayersSubmitted ? 'bg-green-600' : 'bg-blue-600'
                  }`}
                  style={{ 
                    width: `${players.length > 0 ? (players.filter(p => p.hasSubmittedCurrentTask).length / players.length) * 100 : 0}%` 
                  }}
                />
              </div>
              {allPlayersSubmitted && (
                <p className="text-green-600 font-semibold mb-2">
                  ✅ Alle Schüler haben abgegeben! Lösungen werden angezeigt.
                </p>
              )}
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="mt-6 text-center">
            {!isGameFinished ? (
              <button
                onClick={nextTask}
                className="btn-primary px-8 py-3 text-lg"
              >
                ➡️ Nächste Aufgabe
              </button>
            ) : (
              <button
                onClick={() => setStep('results')}
                className="btn-primary px-8 py-3 text-lg"
              >
                🏆 Ergebnisse anzeigen
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (step === 'results') {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Spiel beendet!</h1>
            <p className="text-gray-600">Hier sind die Endergebnisse</p>
          </div>
          
          <Leaderboard
            players={players}
            currentTask={currentTask}
            totalTasks={tasks.length}
            isGameFinished={true}
          />
          
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setStep('config')
                setSessionCode('')
                setSessionId('')
                setPlayers([])
                setCurrentTask(0)
                setTasks([])
                setIsGameStarted(false)
                setIsGameFinished(false)
              }}
              className="btn-primary"
            >
              Neues Spiel starten
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

function StudentInterface() {
  const [sessionCode, setSessionCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [step, setStep] = useState<'join' | 'waiting' | 'game' | 'results'>('join')
  const [playerId, setPlayerId] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [currentTask, setCurrentTask] = useState(0)
  const [tasks, setTasks] = useState<GameTask[]>([])
  const [playerAnswers, setPlayerAnswers] = useState<{ [wordId: string]: string }>({})
  const [isGameFinished, setIsGameFinished] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null)
  const [studentPollingInterval, setStudentPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [lastTaskIndex, setLastTaskIndex] = useState<number>(-1)

  const joinSession = async () => {
    if (!sessionCode || !playerName) return

    try {
      const response = await fetch('/api/sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: sessionCode, playerName })
      })
      
      if (response.ok) {
        const data = await response.json()
        setPlayerId(data.playerId)
        setSessionId(data.session.id)
        setTasks(data.session.tasks)
        setPlayers(data.session.players)
        setGameConfig(data.session.config)
        setStep('waiting')
        
        // Start polling for game start
        startStudentPolling(data.session.id)
      } else {
        alert('Session nicht gefunden oder bereits gestartet')
      }
    } catch (error) {
      console.error('Error joining session:', error)
      alert('Fehler beim Beitreten zur Session')
    }
  }

  const startStudentPolling = (sid: string) => {
    console.log('Starting student polling for session:', sid)
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/sessions/${sid}`)
        if (response.ok) {
          const session = await response.json()
          console.log('Polled session:', session.isStarted, session.currentTask)
          
          // Check if game has started
          if (session.isStarted) {
            console.log('Game has started! Moving to game view')
            setStep('game')
            setCurrentTask(session.currentTask)
            setIsGameFinished(session.isFinished)
            setPlayers(session.players)
          }
          
          // Update game state if already playing
          if (session.isStarted) {
            // Check if task changed (compare with last known task index)
            const taskChanged = session.currentTask !== lastTaskIndex && lastTaskIndex !== -1
            
            if (taskChanged) {
              console.log(`🔄 Task changed from ${lastTaskIndex} to ${session.currentTask} - resetting state`)
              // IMPORTANT: Reset these BEFORE updating state
              setHasSubmitted(false) // Reset submission status for new task
              setPlayerAnswers({}) // Clear answers for new task
              setLastTaskIndex(session.currentTask)
              console.log('✅ Reset complete: hasSubmitted=false, playerAnswers={}')
            }
            
            // Always update these
            if (!taskChanged) {
              setLastTaskIndex(session.currentTask)
            }
            setCurrentTask(session.currentTask)
            setIsGameFinished(session.isFinished)
            setPlayers(session.players)
            
            console.log(`📊 Student state: task=${session.currentTask}, lastTask=${lastTaskIndex}, hasSubmitted=${hasSubmitted}, isFinished=${session.isFinished}`)
          }
          
          // Check if game finished
          if (session.isFinished) {
            console.log('Game finished! Moving to results')
            setStep('results')
            stopStudentPolling()
          }
        }
      } catch (error) {
        console.error('Error polling session:', error)
      }
    }, 2000) // Poll every 2 seconds
    
    setStudentPollingInterval(interval)
  }

  const stopStudentPolling = () => {
    if (studentPollingInterval) {
      clearInterval(studentPollingInterval)
      setStudentPollingInterval(null)
    }
  }

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => {
      stopStudentPolling()
    }
  }, [])

  const submitAnswer = async (wordId: string, wordType: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, wordId, wordType })
      })
      
      if (response.ok) {
        const data = await response.json()
        setPlayerAnswers(prev => ({ ...prev, [wordId]: wordType }))
        
        // Update player score locally
        if (data.isCorrect) {
          setPlayers(prev => prev.map(p => 
            p.id === playerId ? { ...p, score: p.score + 1 } : p
          ))
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  const handleSubmitTask = async () => {
    console.log('=== SUBMIT TASK START ===')
    console.log('Player ID:', playerId)
    console.log('Session ID:', sessionId)
    
    // Auto-fill: All unanswered words are automatically set to "andere"
    const currentTaskData = tasks[currentTask]
    if (currentTaskData) {
      const unansweredWords = currentTaskData.words.filter(word => !playerAnswers[word.id])
      
      if (unansweredWords.length > 0) {
        console.log(`Auto-filling ${unansweredWords.length} unanswered words with "andere"`)
        
        // Submit all unanswered words as "andere"
        for (const word of unansweredWords) {
          await submitAnswer(word.id, 'andere')
        }
        
        // Wait a bit for all answers to be processed
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    // Mark as submitted BEFORE calling API
    setHasSubmitted(true)
    
    try {
      console.log('Calling submit API...')
      const response = await fetch(`/api/sessions/${sessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Task submitted! ${data.submittedCount}/${data.totalPlayers} players have submitted.`)
        console.log('All submitted:', data.allSubmitted)
      } else {
        console.error('Submit API failed:', response.status)
      }
    } catch (error) {
      console.error('Error submitting task:', error)
    }
    
    console.log('=== SUBMIT TASK END ===')
  }

  if (step === 'join') {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Session beitreten</h1>
            <p className="text-gray-600">Gib den Code ein, den dein Lehrer dir gegeben hat</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session-Code
              </label>
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="z.B. ABC123"
                className="input-field text-center text-lg font-mono"
                maxLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dein Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="z.B. Max Mustermann"
                className="input-field"
              />
            </div>

            <button
              onClick={joinSession}
              disabled={!sessionCode || !playerName}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Session beitreten
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'waiting') {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Warten auf Start</h1>
            <p className="text-gray-600 mb-8">Du bist der Session beigetreten. Warte, bis der Lehrer das Spiel startet.</p>
            
            <div className="card">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{playerName}</h3>
                <p className="text-sm text-gray-600">Session: {sessionCode}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'game') {
    const currentTaskData = tasks[currentTask]
    
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Game Board */}
            <div className="lg:col-span-2">
              {currentTaskData && gameConfig && (
                <>
                  <GameBoard
                    task={currentTaskData}
                    timeLimit={undefined} // Students don't control time
                    onAnswer={submitAnswer}
                    onTimeUp={() => {}} // Handled by teacher
                    onSubmit={handleSubmitTask}
                    playerAnswers={playerAnswers}
                    isFinished={hasSubmitted} // Disable interaction when submitted
                    showResults={false} // Never show results during gameplay, only at end
                    allowedWordTypes={gameConfig.wordTypes}
                  />
                  {hasSubmitted && !isGameFinished && (
                    <div className="mt-4 card bg-blue-50 border-2 border-blue-200 text-center">
                      <p className="text-blue-800 font-medium">
                        ✓ Aufgabe abgegeben! Warte auf die nächste Aufgabe...
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Leaderboard */}
            <div className="lg:col-span-1">
              <Leaderboard
                players={players}
                currentTask={currentTask}
                totalTasks={tasks.length}
                isGameFinished={isGameFinished}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'results') {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Spiel beendet!</h1>
            <p className="text-gray-600">Hier sind die Endergebnisse</p>
          </div>
          
          <Leaderboard
            players={players}
            currentTask={currentTask}
            totalTasks={tasks.length}
            isGameFinished={true}
          />
          
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setStep('join')
                setSessionCode('')
                setPlayerName('')
                setPlayerId('')
                setSessionId('')
                setCurrentTask(0)
                setTasks([])
                setPlayerAnswers({})
                setIsGameFinished(false)
                setPlayers([])
              }}
              className="btn-primary"
            >
              Neues Spiel beitreten
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
