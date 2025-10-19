const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage for sessions
const sessions = new Map();
const players = new Map();

// Game configuration
const WORD_TYPES = {
  nomen: { id: 'nomen', label: 'Nomen', color: 'bg-blue-100 text-blue-800' },
  verben: { id: 'verben', label: 'Verben', color: 'bg-green-100 text-green-800' },
  adjektive: { id: 'adjektive', label: 'Adjektive', color: 'bg-yellow-100 text-yellow-800' },
  artikel: { id: 'artikel', label: 'Artikel', color: 'bg-purple-100 text-purple-800' },
  pronomen: { id: 'pronomen', label: 'Pronomen', color: 'bg-pink-100 text-pink-800' },
  adverbien: { id: 'adverbien', label: 'Adverbien', color: 'bg-indigo-100 text-indigo-800' },
  präpositionen: { id: 'präpositionen', label: 'Präpositionen', color: 'bg-red-100 text-red-800' },
  konjunktionen: { id: 'konjunktionen', label: 'Konjunktionen', color: 'bg-orange-100 text-orange-800' },
};

const SAMPLE_SENTENCES = {
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
};

// Helper functions
function generateSessionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function determineWordType(word) {
  const lowerWord = word.toLowerCase();
  
  // Artikel
  if (['der', 'die', 'das', 'ein', 'eine', 'einen', 'einem', 'einer', 'eines'].includes(lowerWord)) {
    return 'artikel';
  }
  
  // Pronomen
  if (['ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie', 'mich', 'dich', 'sich', 'uns', 'euch', 'mein', 'dein', 'sein', 'ihr', 'unser', 'euer'].includes(lowerWord)) {
    return 'pronomen';
  }
  
  // Präpositionen
  if (['in', 'auf', 'unter', 'über', 'neben', 'zwischen', 'durch', 'für', 'gegen', 'ohne', 'mit', 'von', 'zu', 'bei', 'nach', 'vor', 'hinter', 'an', 'um'].includes(lowerWord)) {
    return 'präpositionen';
  }
  
  // Konjunktionen
  if (['und', 'oder', 'aber', 'denn', 'sondern', 'dass', 'weil', 'wenn', 'obwohl', 'damit', 'während', 'bevor', 'nachdem', 'bis', 'seit', 'sobald'].includes(lowerWord)) {
    return 'konjunktionen';
  }
  
  // Adverbien
  if (['sehr', 'nicht', 'auch', 'nur', 'schon', 'noch', 'immer', 'oft', 'manchmal', 'selten', 'nie', 'heute', 'gestern', 'morgen', 'hier', 'dort', 'da', 'so', 'dann', 'jetzt'].includes(lowerWord)) {
    return 'adverbien';
  }
  
  // Verben
  if (lowerWord.endsWith('en') || lowerWord.endsWith('st') || lowerWord.endsWith('t') || lowerWord.endsWith('e')) {
    return 'verben';
  }
  
  // Adjektive
  if (lowerWord.endsWith('ig') || lowerWord.endsWith('lich') || lowerWord.endsWith('isch') || lowerWord.endsWith('bar') || lowerWord.endsWith('sam')) {
    return 'adjektive';
  }
  
  // Nomen (großgeschrieben)
  if (word[0] === word[0].toUpperCase() && word[0] !== word[0].toLowerCase()) {
    return 'nomen';
  }
  
  return 'adjektive';
}

function createTaskFromSentence(sentence, wordTypes, difficulty) {
  const words = sentence.split(' ').map((text, index) => ({
    id: uuidv4(),
    text: text.replace(/[.,!?;:]$/, ''),
    correctWordType: determineWordType(text),
    position: index
  }));

  const correctAnswers = {};
  words.forEach(word => {
    if (wordTypes.includes(word.correctWordType)) {
      correctAnswers[word.id] = word.correctWordType;
    }
  });

  return {
    id: uuidv4(),
    sentence,
    words,
    correctAnswers,
    timeLimit: difficulty === 'easy' ? 30 : difficulty === 'medium' ? 20 : 15
  };
}

function generateTasks(config) {
  const tasks = [];
  const sentences = SAMPLE_SENTENCES[config.difficulty];
  
  for (let i = 0; i < config.taskCount; i++) {
    const sentence = sentences[i % sentences.length];
    const task = createTaskFromSentence(sentence, config.wordTypes, config.difficulty);
    tasks.push(task);
  }

  return tasks;
}

// REST API Routes
app.post('/api/sessions', (req, res) => {
  const { config } = req.body;
  
  if (!config || !config.wordTypes || config.wordTypes.length === 0) {
    return res.status(400).json({ error: 'Invalid configuration' });
  }

  const sessionId = uuidv4();
  const sessionCode = generateSessionCode();
  
  const session = {
    id: sessionId,
    code: sessionCode,
    config,
    players: [],
    currentTask: 0,
    isActive: true,
    isStarted: false,
    isFinished: false,
    tasks: generateTasks(config),
    createdAt: new Date()
  };

  sessions.set(sessionId, session);
  
  res.json({ sessionId, sessionCode, session });
});

app.post('/api/sessions/join', (req, res) => {
  const { code, playerName } = req.body;
  
  const session = Array.from(sessions.values())
    .find(s => s.code === code && s.isActive && !s.isStarted);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found or already started' });
  }

  const playerId = uuidv4();
  const player = {
    id: playerId,
    name: playerName,
    score: 0,
    isReady: false
  };

  session.players.push(player);
  players.set(playerId, { sessionId: session.id, ...player });
  
  res.json({ playerId, session });
});

app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json(session);
});

app.post('/api/sessions/:sessionId/start', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session || session.players.length === 0) {
    return res.status(400).json({ error: 'Session not found or no players' });
  }

  session.isStarted = true;
  
  // Notify all players via socket
  io.emit('gameStarted', { sessionId, session });
  
  res.json(session);
});

app.post('/api/sessions/:sessionId/answer', (req, res) => {
  const { sessionId } = req.params;
  const { playerId, wordId, wordType } = req.body;
  
  const session = sessions.get(sessionId);
  if (!session || !session.isStarted || session.isFinished) {
    return res.status(400).json({ error: 'Invalid session state' });
  }

  const currentTask = session.tasks[session.currentTask];
  if (!currentTask) {
    return res.status(400).json({ error: 'No current task' });
  }

  const isCorrect = currentTask.correctAnswers[wordId] === wordType;
  if (isCorrect) {
    const player = session.players.find(p => p.id === playerId);
    if (player) {
      player.score += 1;
    }
  }

  // Notify all players about the answer
  io.emit('answerSubmitted', { 
    sessionId, 
    playerId, 
    wordId, 
    wordType, 
    isCorrect,
    playerScore: session.players.find(p => p.id === playerId)?.score || 0
  });

  res.json({ isCorrect });
});

app.post('/api/sessions/:sessionId/next-task', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session || !session.isStarted) {
    return res.status(400).json({ error: 'Invalid session state' });
  }

  session.currentTask += 1;
  if (session.currentTask >= session.tasks.length) {
    session.isFinished = true;
  }

  // Notify all players about the next task
  io.emit('nextTask', { 
    sessionId, 
    currentTask: session.currentTask,
    isFinished: session.isFinished,
    task: session.tasks[session.currentTask] || null
  });

  res.json(session);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinSession', (data) => {
    const { sessionId } = data;
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
