# KingOfWortarten

Eine interaktive Web-App zum spielerischen Lernen deutscher Wortarten, ähnlich wie Kahoot.

## Features

- **Lehrer-Interface**: Konfiguration von Spielrunden mit auswählbaren Wortarten, Schwierigkeitsgrad und Zeitlimits
- **Schüler-Interface**: Beitritt zu Sessions via Code und interaktives Spielen
- **Echtzeit-Spiel**: Drag & Drop Mechanik für Wortarten-Erkennung
- **Rangliste**: Live-Scoring und Endergebnisse
- **Mobile-First**: Optimiert für Tablets und Smartphones

## Technologie-Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Railway (Node.js, Express, Socket.IO)
- **Deployment**: Vercel (Frontend), Railway (Backend)

## Installation

### Frontend (Next.js)

```bash
cd /path/to/king-of-wortarten
npm install
npm run dev
```

### POS Tagger Service (Python/spaCy)

Für präzise Wortarten-Erkennung:

```bash
cd pos-tagger
pip3 install -r requirements.txt
pip3 install https://github.com/explosion/spacy-models/releases/download/de_core_news_sm-3.7.0/de_core_news_sm-3.7.0-py3-none-any.whl
python3 app.py
```

Der Service findet automatisch einen freien Port (5000-5099) und speichert ihn in `.port`.
Die Next.js App findet den Service automatisch!

### Backend (Railway) - Optional

```bash
cd railway-server
npm install
npm start
```

## Deployment

### Vercel (Frontend)

1. Verbinde dein GitHub Repository mit Vercel
2. Stelle sicher, dass die Build-Konfiguration korrekt ist
3. Deploy automatisch bei Git Push

### Railway (Backend)

1. Erstelle ein neues Projekt auf Railway
2. Verbinde das `railway-server` Verzeichnis
3. Railway erkennt automatisch die Node.js App

## Verwendung

### Als Lehrer

1. Wähle "Lehrer" auf der Startseite
2. Konfiguriere die Spielrunde:
   - Wähle Wortarten aus (Nomen, Verben, Adjektive, etc.)
   - Setze Anzahl der Aufgaben
   - Wähle Schwierigkeitsgrad (Einfach, Mittel, Schwer)
   - Optional: Zeitlimit pro Aufgabe
3. Erstelle eine Session und teile den Code mit den Schülern
4. Starte das Spiel, wenn alle Schüler beigetreten sind
5. Leite die Spielrunde und zeige Ergebnisse

### Als Schüler

1. Wähle "Schüler" auf der Startseite
2. Gib den Session-Code und deinen Namen ein
3. Warte bis der Lehrer das Spiel startet
4. Spiele mit: Klicke auf Wörter und wähle die richtige Wortart
5. Verfolge deine Punkte in der Live-Rangliste

## API Endpoints

### Sessions

- `POST /api/sessions` - Erstelle neue Session
- `GET /api/sessions/[sessionId]` - Hole Session-Details
- `POST /api/sessions/join` - Trete Session bei
- `POST /api/sessions/[sessionId]/start` - Starte Spiel
- `POST /api/sessions/[sessionId]/answer` - Sende Antwort
- `POST /api/sessions/[sessionId]/next-task` - Nächste Aufgabe

## Wortarten

Die App unterstützt folgende deutsche Wortarten:

- **Nomen** (Substantive)
- **Verben** (Tunwörter)
- **Adjektive** (Eigenschaftswörter)
- **Artikel** (Begleiter)
- **Pronomen** (Fürwörter)
- **Adverbien** (Umstandswörter)
- **Präpositionen** (Verhältniswörter)
- **Konjunktionen** (Bindewörter)

## Schwierigkeitsgrade

- **Einfach**: Kurze, einfache Sätze
- **Mittel**: Mittlere Komplexität mit Nebensätzen
- **Schwer**: Komplexe Sätze mit mehreren Nebensätzen

## Entwicklung

### Projektstruktur

```
king-of-wortarten/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── globals.css        # Globale Styles
│   ├── layout.tsx         # Root Layout
│   └── page.tsx           # Hauptseite
├── components/            # React Komponenten
│   ├── GameBoard.tsx      # Spielbrett
│   └── Leaderboard.tsx    # Rangliste
├── lib/                   # Utilities
│   └── game-engine.ts     # Spiellogik
├── types/                 # TypeScript Definitionen
│   └── index.ts
├── railway-server/        # Backend Server
│   ├── server.js          # Express Server
│   ├── package.json       # Dependencies
│   └── Procfile           # Railway Config
└── README.md
```

### Lokale Entwicklung

1. Starte das Backend: `cd railway-server && npm run dev`
2. Starte das Frontend: `npm run dev`
3. Öffne http://localhost:3000

## Lizenz

MIT License
