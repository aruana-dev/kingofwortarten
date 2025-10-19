# POS Tagger Service für KingOfWortarten

Dieser Microservice verwendet spaCy mit dem deutschen Sprachmodell für präzise Wortarten-Erkennung.

## Installation

```bash
cd pos-tagger
pip install -r requirements.txt
python -m spacy download de_core_news_sm
```

## Starten

```bash
python app.py
```

Der Service läuft auf `http://localhost:5000`

## API Endpoints

### POST /analyze
Analysiert einen einzelnen Satz.

```json
{
  "sentence": "Der große Hund läuft schnell."
}
```

Response:
```json
{
  "sentence": "Der große Hund läuft schnell.",
  "words": [
    {"text": "Der", "wordType": "artikel", "pos": "DET"},
    {"text": "große", "wordType": "adjektive", "pos": "ADJ"},
    {"text": "Hund", "wordType": "nomen", "pos": "NOUN"},
    {"text": "läuft", "wordType": "verben", "pos": "VERB"},
    {"text": "schnell", "wordType": "adverbien", "pos": "ADV"}
  ]
}
```

### POST /batch-analyze
Analysiert mehrere Sätze auf einmal.

```json
{
  "sentences": ["Satz 1", "Satz 2"]
}
```

## Deployment auf Railway

1. Erstelle ein neues Projekt auf Railway
2. Verbinde dieses Repository
3. Setze den Root-Pfad auf `pos-tagger`
4. Railway erkennt automatisch Python und installiert die Dependencies
