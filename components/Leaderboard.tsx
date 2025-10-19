'use client'

import { Trophy, Medal, Award } from 'lucide-react'
import { Player } from '@/types'

interface LeaderboardProps {
  players: Player[]
  currentTask: number
  totalTasks: number
  isGameFinished: boolean
}

export default function Leaderboard({ 
  players, 
  currentTask, 
  totalTasks, 
  isGameFinished 
}: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">
          {index + 1}
        </span>
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300'
      case 1:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300'
      case 2:
        return 'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300'
      default:
        return 'bg-white border-gray-200'
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isGameFinished ? 'Endergebnis' : 'Rangliste'}
          </h2>
          {!isGameFinished && (
            <p className="text-gray-600">
              Aufgabe {currentTask + 1} von {totalTasks}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`
                flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200
                ${getRankColor(index)}
                ${index < 3 ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}
              `}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getRankIcon(index)}
                </div>
                <div>
                  <h3 className={`font-semibold ${index < 3 ? 'text-lg' : 'text-base'}`}>
                    {player.name}
                  </h3>
                  {isGameFinished && (
                    <p className="text-sm text-gray-600">
                      {player.score} von {totalTasks} Punkten
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-2xl font-bold ${index < 3 ? 'text-gray-800' : 'text-gray-600'}`}>
                  {player.score}
                </div>
                {isGameFinished && (
                  <div className="text-sm text-gray-600">
                    {Math.round((player.score / totalTasks) * 100)}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {isGameFinished && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🎉 Herzlichen Glückwunsch! 🎉
              </h3>
              <p className="text-gray-600">
                {sortedPlayers[0]?.name} hat mit {sortedPlayers[0]?.score} Punkten gewonnen!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
