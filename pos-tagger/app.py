from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
import socket

app = Flask(__name__)
CORS(app)

# Load German language model
try:
    nlp = spacy.load("de_core_news_sm")
except OSError:
    print("Downloading German language model...")
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "de_core_news_sm"])
    nlp = spacy.load("de_core_news_sm")

# Mapping from spaCy POS tags to German word types
POS_MAPPING = {
    'NOUN': 'nomen',
    'PROPN': 'nomen',  # Proper nouns are also Nomen
    'VERB': 'verben',
    'AUX': 'verben',  # Auxiliary verbs are also Verben
    'ADJ': 'adjektive',
    'ADV': 'adverbien',
    'DET': 'artikel',  # Determiners include articles
    'PRON': 'pronomen',
    'ADP': 'präpositionen',  # Adpositions are prepositions in German
    'CCONJ': 'konjunktionen',  # Coordinating conjunctions
    'SCONJ': 'konjunktionen',  # Subordinating conjunctions
}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model': 'de_core_news_sm'})

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    sentence = data.get('sentence', '')
    
    if not sentence:
        return jsonify({'error': 'No sentence provided'}), 400
    
    # Process the sentence with spaCy
    doc = nlp(sentence)
    
    # Extract word information
    words = []
    for token in doc:
        # Skip punctuation
        if token.is_punct:
            continue
            
        word_type = POS_MAPPING.get(token.pos_, 'other')
        
        words.append({
            'text': token.text,
            'wordType': word_type,
            'pos': token.pos_,  # Original POS tag for debugging
            'lemma': token.lemma_,
            'position': token.i
        })
    
    return jsonify({
        'sentence': sentence,
        'words': words
    })

@app.route('/batch-analyze', methods=['POST'])
def batch_analyze():
    data = request.json
    sentences = data.get('sentences', [])
    
    if not sentences:
        return jsonify({'error': 'No sentences provided'}), 400
    
    results = []
    for sentence in sentences:
        doc = nlp(sentence)
        
        words = []
        for token in doc:
            if token.is_punct:
                continue
                
            word_type = POS_MAPPING.get(token.pos_, 'other')
            
            words.append({
                'text': token.text,
                'wordType': word_type,
                'pos': token.pos_,
                'lemma': token.lemma_,
                'position': token.i
            })
        
        results.append({
            'sentence': sentence,
            'words': words
        })
    
    return jsonify({'results': results})

def find_free_port(start_port=5000, max_attempts=100):
    """Find a free port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        try:
            # Try to bind to the port
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind(('', port))
            sock.close()
            return port
        except OSError:
            continue
    raise RuntimeError(f"Could not find a free port in range {start_port}-{start_port + max_attempts}")

if __name__ == '__main__':
    import os
    import threading
    import time
    
    port = find_free_port(5000)
    port_file = os.path.join(os.path.dirname(__file__), '.port')
    
    print(f"\n{'='*60}")
    print(f"🚀 POS Tagger Service is starting...")
    print(f"📍 Running on: http://localhost:{port}")
    print(f"📍 Health check: http://localhost:{port}/health")
    print(f"{'='*60}\n")
    
    # Write port file after a short delay to ensure server is ready
    def write_port_file():
        time.sleep(2)  # Wait for Flask to start
        with open(port_file, 'w') as f:
            f.write(str(port))
        print(f"✅ Port {port} saved to {port_file}")
    
    # Start port file writer in background
    port_writer = threading.Thread(target=write_port_file, daemon=True)
    port_writer.start()
    
    try:
        app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)
    finally:
        # Clean up port file on exit
        if os.path.exists(port_file):
            os.remove(port_file)
            print(f"🧹 Cleaned up port file")
