
import os
import sys

# Add your specific modifications if needed
try:
    import torch
    torch_lib_path = os.path.join(os.path.dirname(torch.__file__), 'lib')
    if os.path.exists(torch_lib_path):
        os.environ['PATH'] = torch_lib_path + os.pathsep + os.environ['PATH']
except:
    pass

from sentence_transformers import SentenceTransformer
import traceback

print("Initializing SentenceTransformer...")
try:
    model = SentenceTransformer("all-MiniLM-L6-v2", device='cpu')
    print("Model loaded.")
except Exception as e:
    print(f"Failed to load model: {e}")
    sys.exit(1)

# Construct a prompt similar to api.py
subject_directive = "Identify the academic Subject and a descriptive Title based on the content."
num_questions = 5
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

print(f"Prompt length: {len(prompt)}")
print("Attempting to encode prompt...")

try:
    embeddings = model.encode([prompt])
    print(f"Success! Embedding shape: {embeddings.shape}")
except Exception as e:
    print("❌ CRASHED during encoding:")
    traceback.print_exc()

# ---------------------------------------------------------
# NEW: Test ChromaDB Query
# ---------------------------------------------------------
print("\nTesting ChromaDB Query from existing DB...")
try:
    import chromadb
    from chromadb.config import Settings
    
    # Mocking appropriate embedding function wrapper for Chroma
    class MockEmbeddingFunction:
        def __call__(self, input):
            if isinstance(input, str): input = [input]
            return model.encode(input).tolist()
            
    client = chromadb.PersistentClient(path="db")
    print(f"Collections: {[c.name for c in client.list_collections()]}")
    
    coll = client.get_collection("pdf_docs", embedding_function=MockEmbeddingFunction())
    print(f"Collection count: {coll.count()}")
    
    query = prompt
    print(f"Querying with text length: {len(query)}")
    
    results = coll.query(
        query_texts=[query],
        n_results=3
    )
    print("Query keys:", results.keys())
    print("Documents:", results['documents'])

except Exception as e:
    print("❌ CRASHED during ChromaDB Query:")
    traceback.print_exc()

