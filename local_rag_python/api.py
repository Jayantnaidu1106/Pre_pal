from flask import Flask, request, jsonify
import os
import sys
from rag_app import ChatPDF

app = Flask(__name__)

# Initialize the RAG system
try:
    chat_system = ChatPDF()
except Exception as e:
    print(f"[ERROR] Failed to initialize RAG system (likely OOM): {e}")
    chat_system = None

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "Local RAG API"}), 200

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    try:
        if not chat_system:
            return jsonify({"error": "RAG system not initialized (Check server logs for OOM/Model errors)"}), 503

        data = request.json
        if not data or 'file_path' not in data:
            return jsonify({"error": "Missing 'file_path' in request body"}), 400
        
        file_path = data['file_path']
        item_count = data.get('num_questions', 5) # Default to 5 questions if not specified
        
        if not os.path.exists(file_path):
            return jsonify({"error": f"File not found: {file_path}"}), 404
            
        # Ingest the document
        # Note: In a real production app, we might want to cache vector stores 
        # based on file hash to avoid re-ingesting the same file.
        # For this mini-project, we ingest on every request for simplicity or 
        # we could add a simple check if it's the same file as before.
        chat_system.ingest(file_path)
        
        # Construct the prompt for quiz generation
        prompt = f"""
        Based on the document context, generate {item_count} multiple-choice questions.
        Return ONLY a raw JSON array. No markdown, no explanations.
        Format:
        [
            {{
                "question": "Text...",
                "options": ["A", "B", "C", "D"],
                "answer": "A"
            }}
        ]
        """
        
        # Ask the question
        answer, _ = chat_system.ask(prompt)
        
        # The answer from the LLM might contain markdown code blocks (```json ... ```) 
        # We need to clean it up to ensure it's valid JSON for the response
        cleaned_answer = answer.strip()
        if cleaned_answer.startswith("```json"):
            cleaned_answer = cleaned_answer[7:]
        if cleaned_answer.startswith("```"):
            cleaned_answer = cleaned_answer[3:]
        if cleaned_answer.endswith("```"):
            cleaned_answer = cleaned_answer[:-3]
            
        cleaned_answer = cleaned_answer.strip()
        
        import json
        try:
            quiz_json = json.loads(cleaned_answer)
            return jsonify(quiz_json), 200
        except json.JSONDecodeError:
            # Fallback if the LLM didn't return valid JSON
            return jsonify({
                "error": "Failed to parse LLM response as JSON", 
                "raw_response": answer
            }), 500

    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run slightly different port than typical Flask default if needed, but 5000 is standard
    print("[INFO] Starting Local RAG API Server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=False)
