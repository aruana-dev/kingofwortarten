'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { GameTask, SentencePart, SATZGLIEDER, FÄLLE, GameMode } from '@/types'

interface SatzgliederBoardProps {
  task: GameTask
  onSubmit: () => void
  playerGroupings: { [groupId: string]: { wordIds: string[], type: string } }
  onGroupingChange: (groupings: { [groupId: string]: { wordIds: string[], type: string } }) => void
  isFinished: boolean
  showResults: boolean
  allowedWordTypes: string[]
  gameMode?: GameMode
}

export default function SatzgliederBoard({
  task,
  onSubmit,
  playerGroupings,
  onGroupingChange,
  isFinished,
  showResults,
  allowedWordTypes,
  gameMode = 'satzglieder'
}: SatzgliederBoardProps) {
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set())
  const [currentGroupType, setCurrentGroupType] = useState<string | null>(null)
  
  // Get the correct type system based on game mode
  const TYPE_SYSTEM = gameMode === 'fall' ? FÄLLE : SATZGLIEDER
  
  // Get available types
  const availableTypes = Object.values(TYPE_SYSTEM).filter(
    type => allowedWordTypes.includes(type.id) && type.id !== 'andere'
  )
  
  // Track which words are already in groups
  const getGroupedWordIds = () => {
    const grouped = new Set<string>()
    Object.values(playerGroupings).forEach(group => {
      group.wordIds.forEach(id => grouped.add(id))
    })
    return grouped
  }
  
  const groupedWordIds = getGroupedWordIds()
  
  // Check if a word is available for selection
  const isWordAvailable = (wordId: string) => {
    return !groupedWordIds.has(wordId)
  }
  
  // Toggle word selection
  const toggleWordSelection = (wordId: string) => {
    if (!isWordAvailable(wordId) || isFinished) return
    
    const newSelected = new Set(selectedWords)
    if (newSelected.has(wordId)) {
      newSelected.delete(wordId)
    } else {
      newSelected.add(wordId)
    }
    setSelectedWords(newSelected)
  }
  
  // Create a sentence part group
  const createGroup = () => {
    if (selectedWords.size === 0 || !currentGroupType) return
    
    const groupId = `group_${Date.now()}`
    const newGroupings = {
      ...playerGroupings,
      [groupId]: {
        wordIds: Array.from(selectedWords).sort((a, b) => {
          const posA = task.words.find(w => w.id === a)?.position || 0
          const posB = task.words.find(w => w.id === b)?.position || 0
          return posA - posB
        }),
        type: currentGroupType
      }
    }
    
    onGroupingChange(newGroupings)
    setSelectedWords(new Set())
    setCurrentGroupType(null)
  }
  
  // Remove a group
  const removeGroup = (groupId: string) => {
    if (isFinished) return
    const newGroupings = { ...playerGroupings }
    delete newGroupings[groupId]
    onGroupingChange(newGroupings)
  }
  
  // Get sentence part type config
  const getTypeConfig = (typeId: string) => {
    return (TYPE_SYSTEM as any)[typeId] || (TYPE_SYSTEM as any).andere
  }
  
  // Calculate progress
  const progress = (Object.keys(playerGroupings).length / (task.sentenceParts?.length || 1)) * 100
  
  // Check if can submit
  const canSubmit = Object.keys(playerGroupings).length > 0 && !isFinished
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Sentence Display */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {gameMode === 'fall' ? 'Erkennst du die Fälle?' : 'Erkennst du die Satzglieder?'}
        </h2>
        <p className="text-2xl text-center py-6 leading-relaxed">{task.sentence}</p>
        
        {!isFinished && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Fortschritt: {Object.keys(playerGroupings).length} von {task.sentenceParts?.length || 0} {gameMode === 'fall' ? 'Fällen' : 'Satzgliedern'}</span>
              <span>{Math.round(progress)}%</span>
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

      {/* Word Selection */}
      {!isFinished && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">1. Wähle Wörter aus, die zusammengehören</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {task.words.map(word => {
              const isAvailable = isWordAvailable(word.id)
              const isSelected = selectedWords.has(word.id)
              
              return (
                <button
                  key={word.id}
                  onClick={() => toggleWordSelection(word.id)}
                  disabled={!isAvailable}
                  className={`p-3 rounded-lg border-2 transition-all font-semibold ${
                    isSelected
                      ? 'bg-primary-500 text-white border-primary-500'
                      : isAvailable
                      ? 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {word.text}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Type Selection and Create Button */}
      {!isFinished && selectedWords.size > 0 && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">2. Wähle {gameMode === 'fall' ? 'den Fall' : 'das Satzglied'}</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {availableTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setCurrentGroupType(type.id)}
                className={`p-3 rounded-lg border-2 transition-all font-semibold ${
                  currentGroupType === type.id
                    ? type.color
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          
          <button
            onClick={createGroup}
            disabled={!currentGroupType}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gameMode === 'fall' ? 'Fall-Gruppe erstellen' : 'Satzglied erstellen'}
          </button>
        </div>
      )}

      {/* Created Groups */}
      {Object.keys(playerGroupings).length > 0 && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Deine {gameMode === 'fall' ? 'Fall-Gruppen' : 'Satzglieder'}:</h3>
          <div className="space-y-3">
            {Object.entries(playerGroupings).map(([groupId, group]) => {
              const typeConfig = getTypeConfig(group.type)
              const groupText = group.wordIds
                .map(id => task.words.find(w => w.id === id)?.text)
                .filter(Boolean)
                .join(' ')
              
              // Check if correct (only if showing results)
              let isCorrect = false
              let correctPart: SentencePart | undefined
              
              if (showResults && task.sentenceParts) {
                correctPart = task.sentenceParts.find(sp => {
                  const sameWords = sp.wordIds.length === group.wordIds.length &&
                    sp.wordIds.every(id => group.wordIds.includes(id))
                  return sameWords && sp.correctType === group.type
                })
                isCorrect = !!correctPart
              }
              
              return (
                <div
                  key={groupId}
                  className={`p-4 rounded-lg border-2 ${
                    showResults
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                        {showResults && (
                          isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )
                        )}
                      </div>
                      <div className="text-lg font-medium">{groupText}</div>
                      
                      {showResults && correctPart?.explanation && (
                        <div className="mt-2 p-3 bg-blue-100 border border-blue-300 rounded-lg text-sm">
                          {correctPart.explanation}
                        </div>
                      )}
                    </div>
                    
                    {!isFinished && (
                      <button
                        onClick={() => removeGroup(groupId)}
                        className="ml-4 px-3 py-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        Entfernen
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {!isFinished && (
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canSubmit ? 'Aufgabe abgeben' : `Erstelle mindestens ${gameMode === 'fall' ? 'eine Fall-Gruppe' : 'ein Satzglied'}`}
        </button>
      )}
    </div>
  )
}

