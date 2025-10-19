# 👑 KingOfWortarten

**Interaktives Lernspiel für deutsche Wortarten** - ähnlich wie Kahoot, speziell für den Deutschunterricht.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12-yellow)](https://www.python.org/)
[![spaCy](https://img.shields.io/badge/spaCy-3.7-green)](https://spacy.io/)

## 🎯 Features

### Für Lehrer
- 🎮 **Session-Erstellung**: Wähle Wortarten, Anzahl Aufgaben, Schwierigkeit und Zeitlimit
- 📊 **Live-Monitoring**: Sehe in Echtzeit, wer beigetreten ist und wer abgegeben hat
- 🎯 **Lösungsanzeige**: Automatische Anzeige der korrekten Antworten, wenn alle Schüler fertig sind
- 📈 **Rangliste**: Live-Punktestand aller Schüler

### Für Schüler
- 🚀 **Einfacher Beitritt**: Mit 6-stelligem Code zur Session beitreten
- 🎨 **Intuitive Bedienung**: Wörter per Klick den Wortarten zuordnen
- 💡 **Lerneffekt**: Bei "Andere Wortart" wird die tatsächliche Wortart angezeigt
- 🏆 **Punktesystem**: +1 für richtig, -1 für falsch (Minimum 0)

### Technische Highlights
- 🤖 **KI-gestützte Wortarten-Erkennung**: Präzise Analyse mit spaCy (de_core_news_sm)
- ⚡ **Echtzeit-Synchronisation**: Polling-basierte Updates für alle Teilnehmer
- 🎨 **Modernes UI**: Responsive Design mit Tailwind CSS
- 🔄 **Automatische Port-Erkennung**: POS Tagger findet automatisch freie Ports

## 🚀 Schnellstart

### Voraussetzungen

- Node.js 18+ und npm
- Python 3.12+
- Git

### Installation

1. **Repository klonen**
```bash
git clone https://github.com/aruana-dev/kingofwortarten.git
cd kingofwortarten
```

2. **Frontend installieren**
```bash
npm install
```

3. **POS Tagger Service installieren**
```bash
cd pos-tagger
pip3 install -r requirements.txt
pip3 install https://github.com/explosion/spacy-models/releases/download/de_core_news_sm-3.7.0/de_core_news_sm-3.7.0-py3-none-any.whl
cd ..
```

### Starten

1. **POS Tagger Service starten** (in einem Terminal)
```bash
cd pos-tagger
python3 app.py
```

Der Service findet automatisch einen freien Port (5000-5099) und speichert ihn in `.port`.

2. **Frontend starten** (in einem anderen Terminal)
```bash
npm run dev
```

Die App läuft auf `http://localhost:3000`

## 📖 Verwendung

### Als Lehrer

1. **Rolle wählen**: Klicke auf "Lehrer"
2. **Spiel konfigurieren**:
   - Wähle Wortarten (z.B. Nomen, Verben, Adjektive)
   - Anzahl der Aufgaben (1-10)
   - Schwierigkeitsgrad (leicht/mittel/schwer)
   - Zeitlimit (optional)
3. **Session erstellen**: Erhalte einen 6-stelligen Code
4. **Warten**: Schüler können jetzt beitreten
5. **Spiel starten**: Wenn alle da sind
6. **Monitoring**: Sehe Abgabe-Status und Lösungen
7. **Nächste Aufgabe**: Klicke "Nächste Aufgabe" für die nächste Runde

### Als Schüler

1. **Rolle wählen**: Klicke auf "Schüler"
2. **Beitreten**: Gib den 6-stelligen Code ein
3. **Nickname**: Wähle einen Gruppennamen
4. **Warten**: Bis der Lehrer das Spiel startet
5. **Spielen**: 
   - Ordne jedes Wort einer Wortart zu
   - Wörter, die nicht zu den ausgewählten Wortarten gehören → "Andere Wortart"
   - Alle Wörter müssen zugeordnet werden (100%)
6. **Abgeben**: Klicke "Aufgabe abgeben"
7. **Ergebnis**: Sehe deine Punktzahl und die richtigen Antworten

## 🎮 Spielmechanik

### Punktesystem

- ✅ **Richtige Wortart**: +1 Punkt
- ✅ **"Andere Wortart" (korrekt)**: +1 Punkt
- ❌ **Falsche Wortart**: -1 Punkt (Minimum 0)
- ❌ **Falsche "Andere Wortart"**: -1 Punkt

### Wortarten-Container

Schüler sehen:
- Die vom Lehrer ausgewählten Wortarten (z.B. Nomen, Verben)
- **"Andere Wortart"** für alle anderen Wörter

### Visuelle Feedback

- 🟢 **Grünes Häkchen**: Richtig zugeordnet
- 🔴 **Rotes X**: Falsch zugeordnet
- 🟡 **Gelbes Fragezeichen**: "Andere Wortart" (korrekt)

### Lerneffekt

Wenn ein Schüler "Andere Wortart" korrekt wählt, wird in der Lösung die tatsächliche Wortart angezeigt:
```
"Gestern" → Andere Wortart ✅ (eigentlich: Adverb)
```

## 🏗️ Architektur

### Frontend (Next.js 14)
- **App Router**: Moderne Next.js Struktur
- **Server Components**: Für optimale Performance
- **API Routes**: RESTful API für Session-Management
- **Polling**: Echtzeit-Updates alle 2 Sekunden

### Backend (In-Memory)
- **Game Engine**: Verwaltet Sessions, Spieler, Aufgaben
- **Global Singleton**: Persistiert State über Hot-Reloads
- **Session Management**: UUID-basierte Sessions mit 6-stelligen Codes

### POS Tagger Service (Python/Flask)
- **spaCy**: Deutsche Sprachmodell (de_core_news_sm)
- **Flask**: REST API für Wortarten-Analyse
- **Auto-Port**: Findet automatisch freien Port
- **CORS**: Aktiviert für Frontend-Zugriff

## 📁 Projektstruktur

```
kingofwortarten/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   └── sessions/         # Session-Management
│   ├── globals.css           # Globale Styles
│   ├── layout.tsx            # Root Layout
│   └── page.tsx              # Hauptseite (Lehrer/Schüler)
├── components/               # React Komponenten
│   ├── GameBoard.tsx         # Schüler-Spielfeld
│   ├── Leaderboard.tsx       # Rangliste
│   └── TeacherDisplay.tsx    # Lehrer-Ansicht
├── lib/                      # Utilities
│   ├── game-engine.ts        # Spiel-Logik
│   └── openai-generator.ts   # OpenAI Integration (optional)
├── pos-tagger/               # POS Tagger Service
│   ├── app.py                # Flask App
│   ├── requirements.txt      # Python Dependencies
│   └── README.md             # Service-Dokumentation
├── types/                    # TypeScript Types
│   └── index.ts              # Shared Types
└── README.md                 # Diese Datei
```

## 🔧 Konfiguration

### Umgebungsvariablen

Erstelle eine `.env.local` Datei:

```bash
# Optional: OpenAI für Task-Generierung (aktuell deaktiviert)
OPENAI_API_KEY=sk-...

# Optional: POS Tagger URL (wird automatisch erkannt)
POS_TAGGER_URL=http://localhost:5002
```

### Wortarten

Verfügbare Wortarten in `types/index.ts`:
- Nomen
- Verben
- Adjektive
- Artikel
- Pronomen
- Adverbien
- Präpositionen
- Konjunktionen
- **Andere Wortart** (automatisch verfügbar)

## 🐛 Debugging

### Console-Logs aktiviert

Die App hat umfangreiche Debug-Logs:

**Server (Terminal)**:
```
Player [Name] submitted task. hasSubmittedCurrentTask = true
Submit status: 1/1 submitted. All submitted: true
```

**Browser (F12 → Console)**:
```
Teacher polling - players: [{ name: "...", hasSubmitted: true }]
Teacher view - allPlayersSubmitted: true
Task changed from 0 to 1 - resetting answers
```

### Häufige Probleme

**POS Tagger läuft nicht**:
```bash
cd pos-tagger
python3 app.py
# Prüfe: http://localhost:5002/health
```

**Port bereits belegt**:
- POS Tagger findet automatisch einen freien Port
- Prüfe `.port` Datei: `cat pos-tagger/.port`

**Session nicht gefunden**:
- Prüfe, ob beide Services laufen
- Lösche `.next` und starte neu: `rm -rf .next && npm run dev`

## 🚀 Deployment

### Frontend (Vercel)

```bash
vercel
```

### POS Tagger (Railway/Heroku)

```bash
cd pos-tagger
# Procfile ist bereits vorhanden
git push railway main
```

## 🤝 Mitwirken

Contributions sind willkommen! Bitte:

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/AmazingFeature`)
3. Commit deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## 📝 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## 👨‍💻 Autor

**Aruana Dev**
- GitHub: [@aruana-dev](https://github.com/aruana-dev)

## 🙏 Danksagungen

- [Next.js](https://nextjs.org/) - React Framework
- [spaCy](https://spacy.io/) - NLP Library
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Lucide Icons](https://lucide.dev/) - Icon Library

---

**Viel Spaß beim Lernen! 🎓👑**
