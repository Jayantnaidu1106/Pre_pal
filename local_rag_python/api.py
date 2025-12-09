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
print("Initializing ChatPDF Engine...")
# Note: ChatPDF initializes LLM on start. 
# Ensure this script is run in an environment where rag_app.py works.
rag_engine = ChatPDF() 
print("ChatPDF Engine Ready!")

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
    # Helper to handle both JSON and Form Data
    if request.is_json:
        data = request.json
        num_questions = data.get('num_questions', 5)
        file_path = data.get('file_path')
        custom_subject = data.get('custom_subject', '')
    else:
        # Form Data (from frontend)
        num_questions = int(request.form.get('numQuestions', 5))
        custom_subject = request.form.get('custom_subject', '')
        
        # Handle file upload if included directly (optional, usually file is already uploaded)
        if 'file' in request.files:
            file = request.files['file']
            filename = file.filename
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            file_path = filepath
        else:
             # Fallback if file path wasn't passed but we need it (logic relies on rag_engine having context)
             # In a real scenario we'd track session, but for now assuming file was just uploaded or path known
             # Since frontend uploads file then calls this, we might need to handle the file here directly
             # Current frontend sends File object, so 'file' key exists.
             pass

    if file_path:
        print(f"🔄 Ingesting file for quiz: {file_path}")
        try:
            rag_engine.clear()
            rag_engine.ingest(file_path)
        except Exception as e:
            print(f"Error ingesting file path {file_path}: {e}")
            return jsonify({'error': f"Failed to ingest provided file: {str(e)}"}), 500
    
    # improved Prompt for easier parsing
    subject_directive = ""
    if custom_subject:
        subject_directive = f"Focus specifically on the topic: '{custom_subject}'. Use '{custom_subject}' as the Quiz Title."
    else:
        subject_directive = "Identify the academic Subject and a descriptive Title based on the content."

    prompt = f"""Analyze the document content. {subject_directive}
    Then, generate a quiz with {num_questions} multiple choice questions.
    
    Follow this EXACT format:
    
    Subject: [Subject Name]
    Title: [Quiz Title]
    
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
        # Try RAG Retrieval first
        print("DEBUG: Attempting RAG retrieval...")
        answer_text, _ = rag_engine.ask(prompt)
        
        if "Please ingest a document first" in answer_text:
             raise Exception("RAG reports no document ingested")

    except Exception as rag_error:
        print(f"RAG Retrieval Failed: {rag_error}")
        print("Attempting Direct Use Fallback (Reading PDF directly)...")
        
        try:
            # Fallback: Read first few pages of PDF directly
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            raw_text = ""
            for i, page in enumerate(reader.pages):
                if i >= 3: break # Limit to first 3 pages to fit context
                raw_text += page.extract_text() + "\n"
            
            # Construct a prompt with the raw text embedded
            # Note: We truncate raw_text to avoid token limits (e.g. 3000 chars)
            truncated_text = raw_text[:3000]
            
            fallback_prompt = f"""Analyze the provided document text. {subject_directive}
            Then, generate a quiz with {num_questions} multiple choice questions.

            Document Text:
            {truncated_text}
            
            Follow this EXACT format:
            
            Subject: [Subject Name]
            Title: [Quiz Title]
            
            ###
            Question: [Question Text]
            Option A: [Option Text]
            Option B: [Option Text]
            Option C: [Option Text]
            Option D: [Option Text]
            Correct Answer: [Full Option Text must be one of the above]
            ###
            
            Ensure questions are relevant to the text provided.
            """
            
            print("DEBUG: Sending Fallback Prompt to LLM...")
            # Use the LLM directly, bypassing RAG retrieval logic
            # response = self.llm.generate(prompt, temp=0.1, max_tokens=500)
            # rag_engine.llm is the GPT4All instance
            answer_text = rag_engine.llm.generate(fallback_prompt, temp=0.1, max_tokens=1000)
            print("DEBUG: Fallback LLM Response received.")
            
        except Exception as fallback_error:
            print(f"Fallback Failed: {fallback_error}")
            return jsonify({'error': f"Quiz generation failed: {str(rag_error)} | Fallback error: {str(fallback_error)}"}), 500

    if not answer_text:
        return jsonify({'error': 'LLM returned empty response.'}), 500

    print("DEBUG: Raw LLM Response:")
    print(answer_text)
    print("------------------------")
        
    # Parse the text into structured JSON
    quiz_data = []
    detected_subject = "General" # Default
    detected_title = "Generated Quiz" # Default

    import re
    
    # Extract Subject
    subject_match = re.search(r"Subject:\s*(.+)", answer_text)
    if subject_match:
        detected_subject = subject_match.group(1).strip()
        print(f"DEBUG: Detected Subject: {detected_subject}")

    # Extract Title
    title_match = re.search(r"Title:\s*(.+)", answer_text)
    if title_match:
        detected_title = title_match.group(1).strip()
        print(f"DEBUG: Detected Title: {detected_title}")

    # Split by separator ###
    raw_questions = answer_text.split('###')
    
    for raw_q in raw_questions:
        if "Question:" not in raw_q:
            continue
            
        try:
            # Extract fields
            lines = [l.strip() for l in raw_q.split('\\n') if l.strip()]
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
    
    # Return object with subject, title, and questions
    return jsonify({
        'subject': detected_subject,
        'title': detected_title,
        'questions': quiz_data
    })



if __name__ == '__main__':
    # Run on 0.0.0.0 to be accessible, port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
