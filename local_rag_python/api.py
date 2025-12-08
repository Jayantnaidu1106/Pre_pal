from flask import Flask, request, jsonify
from flask_cors import CORS
from rag_app import ChatPDF
import os

app = Flask(__name__)
CORS(app)

# Initialize RAG System
print("⏳ Initializing ChatPDF Engine...")
# Note: ChatPDF initializes LLM on start. 
# Ensure this script is run in an environment where rag_app.py works.
rag_engine = ChatPDF() 
print("✅ ChatPDF Engine Ready!")

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)
        
        try:
            rag_engine.clear() # Clear previous context
            rag_engine.ingest(filepath)
            return jsonify({'message': 'File processed and ingested successfully', 'filename': file.filename})
        except Exception as e:
            print(f"Error processing file: {e}")
            return jsonify({'error': str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    if not data or 'query' not in data:
        return jsonify({'error': 'No query provided'}), 400
        
    query = data.get('query')
    
    try:
        answer, sources = rag_engine.ask(query)
        
        # Serialize sources (convert Document objects to dicts)
        source_list = []
        for doc in sources:
            source_list.append({
                'page': doc.metadata.get('page', '?'),
                'content': doc.page_content[:200] + "..." # Snippet
            })
            
        return jsonify({
            'answer': answer,
            'sources': source_list
        })
    except Exception as e:
        print(f"Error generating answer: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run on 0.0.0.0 to be accessible, port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
