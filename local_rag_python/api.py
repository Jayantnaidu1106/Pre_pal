from flask import Flask, request, jsonify
# from flask_cors import CORS # Module not found, using manual headers
from rag_app import ChatPDF
import os

app = Flask(__name__)
# CORS(app)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

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

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    num_questions = data.get('num_questions', 5) if data else 5
    topic = data.get('topic', 'the document content') if data else 'the document content'
    file_path = data.get('file_path')

    if file_path:
        print(f"🔄 Ingesting file for quiz: {file_path}")
        try:
            rag_engine.clear()
            rag_engine.ingest(file_path)
        except Exception as e:
            print(f"Error ingesting file path {file_path}: {e}")
            return jsonify({'error': f"Failed to ingest provided file: {str(e)}"}), 500
    
    # improved Prompt for easier parsing
    prompt = f"""Generate a quiz with {num_questions} multiple choice questions based on {topic}. 
    Follow this EXACT format for each question:
    
    ###
    Question: [Question Text]
    Option A: [Option Text]
    Option B: [Option Text]
    Option C: [Option Text]
    Option D: [Option Text]
    Correct Answer: [Full Option Text must be one of the above]
    ###
    
    Ensure questions are relevant to the context.
    """
    
    try:
        answer_text, _ = rag_engine.ask(prompt)
        
        if "Please ingest a document first" in answer_text:
            return jsonify({'error': 'No document ingested. Please upload a PDF first.'}), 400

        print("DEBUG: Raw LLM Response:")
        print(answer_text)
        print("------------------------")
        
        # Parse the text into structured JSON
        quiz_data = []
        import re
        
        # Split by separator ###
        raw_questions = answer_text.split('###')
        
        for raw_q in raw_questions:
            if "Question:" not in raw_q:
                continue
                
            try:
                # Extract fields
                lines = [l.strip() for l in raw_q.split('\n') if l.strip()]
                question = ""
                options = []
                correct_answer = ""
                
                current_options = {}
                
                for line in lines:
                    if line.startswith("Question:"):
                        question = line.replace("Question:", "").strip()
                    elif line.startswith("Option A:"):
                        opt = line.replace("Option A:", "").strip()
                        options.append(opt)
                        current_options['A'] = opt
                    elif line.startswith("Option B:"):
                        opt = line.replace("Option B:", "").strip()
                        options.append(opt)
                        current_options['B'] = opt
                    elif line.startswith("Option C:"):
                        opt = line.replace("Option C:", "").strip()
                        options.append(opt)
                        current_options['C'] = opt
                    elif line.startswith("Option D:"):
                        opt = line.replace("Option D:", "").strip()
                        options.append(opt)
                        current_options['D'] = opt
                    elif line.startswith("Correct Answer:"):
                        clean_ans = line.replace("Correct Answer:", "").strip()
                        # If the model output "Option A" instead of text, map it
                        if clean_ans in ["Option A", "Option B", "Option C", "Option D"]:
                             pass
                        
                        # Ideally we want the text. If it gave "A" or "Option A", we should try to resolve it if we have the map
                        # Simple Heuristic:
                        if clean_ans.upper() in ["A", "B", "C", "D"] and clean_ans.upper() in current_options:
                             correct_answer = current_options[clean_ans.upper()]
                        elif clean_ans.startswith("Option ") and clean_ans[-1] in current_options:
                             correct_answer = current_options[clean_ans[-1]]
                        else:
                             correct_answer = clean_ans

                if question and len(options) >= 4 and correct_answer:
                    quiz_data.append({
                        "question": question,
                        "options": options,
                        "answer": correct_answer
                    })
            except Exception as e:
                print(f"Error parsing question chunk: {e}")
                continue

        print(f"DEBUG: Parsed {len(quiz_data)} questions.")
        
        # If parsing failed completely, fallback or return empty (which frontend handles)
        return jsonify(quiz_data)

    except Exception as e:
        print(f"Error generating quiz: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run on 0.0.0.0 to be accessible, port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
