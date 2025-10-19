export interface GameConfig {
  wordTypes: string[]
  taskCount: number
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit: number | null
}

export interface Player {
  id: string
  name: string
  score: number
  isReady: boolean
  currentAnswer?: string
  hasSubmittedCurrentTask?: boolean
}

export interface GameSession {
  id: string
  code: string
  config: GameConfig
  players: Player[]
  currentTask: number
  isActive: boolean
  isStarted: boolean
  isFinished: boolean
  tasks: GameTask[]
  createdAt: Date
}

export interface GameTask {
  id: string
  sentence: string
  words: Word[]
  correctAnswers: { [wordId: string]: string }
  timeLimit?: number
}

export interface Word {
  id: string
  text: string
  correctWordType: string
  position: number
}

export interface PlayerAnswer {
  playerId: string
  wordId: string
  wordType: string
  timestamp: Date
}

export interface GameResult {
  playerId: string
  playerName: string
  score: number
  totalTasks: number
  correctAnswers: number
  accuracy: number
}

export const WORD_TYPES = {
  nomen: { id: 'nomen', label: 'Nomen', color: 'bg-blue-100 text-blue-800' },
  verben: { id: 'verben', label: 'Verben', color: 'bg-green-100 text-green-800' },
  adjektive: { id: 'adjektive', label: 'Adjektive', color: 'bg-yellow-100 text-yellow-800' },
  artikel: { id: 'artikel', label: 'Artikel', color: 'bg-purple-100 text-purple-800' },
  pronomen: { id: 'pronomen', label: 'Pronomen', color: 'bg-pink-100 text-pink-800' },
  adverbien: { id: 'adverbien', label: 'Adverbien', color: 'bg-indigo-100 text-indigo-800' },
  präpositionen: { id: 'präpositionen', label: 'Präpositionen', color: 'bg-red-100 text-red-800' },
  konjunktionen: { id: 'konjunktionen', label: 'Konjunktionen', color: 'bg-orange-100 text-orange-800' },
  andere: { id: 'andere', label: 'Andere Wortart', color: 'bg-gray-200 text-gray-800' },
} as const

export const SAMPLE_SENTENCES = {
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
} as const
