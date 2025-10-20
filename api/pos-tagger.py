"""
POS Tagger API für Vercel Serverless Functions

⚠️ WICHTIG: Funktioniert möglicherweise NICHT auf Vercel wegen:
1. spaCy Model ist zu groß (>50MB Limit)
2. Cold Start ist sehr langsam (10-30 Sekunden)
3. Memory Limit auf Hobby Plan

Empfehlung: Railway oder Fly.io verwenden!
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy

# Try to load spaCy model
try:
    nlp = spacy.load("de_core_news_sm")
    print("✅ spaCy model loaded successfully")
except Exception as e:
    print(f"❌ Failed to load spaCy model: {e}")
    nlp = None

app = Flask(__name__)
CORS(app)

# POS Tag mapping
POS_MAP = {
    'NOUN': 'nomen',
    'PROPN': 'nomen',
    'VERB': 'verben',
    'AUX': 'verben',
    'ADJ': 'adjektive',
    'DET': 'artikel',
    'PRON': 'pronomen',
    'ADV': 'adverbien',
    'ADP': 'präpositionen',
    'CCONJ': 'konjunktionen',
    'SCONJ': 'konjunktionen',
}

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok' if nlp else 'error',
        'model_loaded': nlp is not None,
        'service': 'POS Tagger (Vercel Serverless)',
        'message': 'Model loaded' if nlp else 'Model not available'
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze sentence and return words with their types"""
    if not nlp:
        return jsonify({
            'error': 'spaCy model not loaded. Please use Railway deployment instead.'
        }), 503
    
    try:
        data = request.get_json()
        sentence = data.get('sentence', '')
        
        if not sentence:
            return jsonify({'error': 'No sentence provided'}), 400
        
        # Process sentence
        doc = nlp(sentence)
        
        # Extract words
        words = []
        for i, token in enumerate(doc):
            # Skip punctuation and spaces
            if token.is_punct or token.is_space:
                continue
            
            # Map POS tag to German word type
            word_type = POS_MAP.get(token.pos_, 'andere')
            
            words.append({
                'text': token.text,
                'wordType': word_type,
                'position': i,
                'pos': token.pos_,
                'lemma': token.lemma_
            })
        
        return jsonify({
            'sentence': sentence,
            'words': words,
            'count': len(words)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Vercel Serverless Function handler
def handler(request):
    """Vercel handler wrapper"""
    with app.test_request_context(
        path=request.path,
        method=request.method,
        headers=request.headers,
        data=request.data
    ):
        return app.full_dispatch_request()

