import os
import sys
import shutil
import chromadb
from chromadb.config import Settings
import torch # Explicit import for path detection

# PATCH: Add torch's bundled CUDA libs to PATH so GPT4All can find them
try:
    torch_lib_path = os.path.join(os.path.dirname(torch.__file__), 'lib')
    if os.path.exists(torch_lib_path):
        print(f"🔧 Adding Torch CUDA libs to PATH: {torch_lib_path}")
        os.environ['PATH'] = torch_lib_path + os.pathsep + os.environ['PATH']
        if hasattr(os, 'add_dll_directory'):
            os.add_dll_directory(torch_lib_path)
except Exception as e:
    print(f"Warning: Could not setup Torch CUDA paths: {e}")

from sentence_transformers import SentenceTransformer
from gpt4all import GPT4All
from pypdf import PdfReader
import uuid

# Custom Embedding Function for ChromaDB
class SentenceTransformerEmbeddingFunction:
    def __init__(self, model_name="all-MiniLM-L6-v2"):
        print(f"🧠 Initializing Embeddings ({model_name})...")
        try:
            self.model = SentenceTransformer(model_name, device='cuda')
            print("   -> Using GPU (CUDA) for Embeddings")
        except Exception as e:
            print(f"   -> GPU failed for Embeddings, falling back to CPU: {e}")
            self.model = SentenceTransformer(model_name, device='cpu')

    def __call__(self, input):
        if isinstance(input, str):
            input = [input]
        embeddings = self.model.encode(input)
        return embeddings.tolist()

    def embed_documents(self, texts):
        return self.__call__(texts)

    def embed_query(self, input):
        return self.__call__([input])[0]
    
    def name(self):
        return "sentence_transformers"

class ChatPDF:
    def __init__(self):
        self.embedding_fn = SentenceTransformerEmbeddingFunction()
        
        print("🤖 Initializing Local LLM (GPT4All)...")
        # device='gpu' will attempt to use the best available GPU (NVIDIA/AMD/Intel)
        # If it fails (missing DLLs leading to 0x7e), it usually warns and falls back or crashes.
        self.llm = GPT4All(
            model_name="orca-mini-3b-gguf2-q4_0.gguf",
            allow_download=True,
            device='gpu' 
        )
        
        print("💾 Connecting to Vector Store...")
        self.chroma_client = chromadb.PersistentClient(path="db")
        self.collection = self.chroma_client.get_or_create_collection(
            name="pdf_docs",
            embedding_function=self.embedding_fn
        )

    def recursive_split(self, text, chunk_size=1000, chunk_overlap=200):
        """Simple recursive-like splitting: sentences -> chunks"""
        # A very basic implementation. For production, regex or nltk is better.
        # Here we just split by arbitrary size overlapping.
        chunks = []
        start = 0
        text_len = len(text)
        
        while start < text_len:
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start += chunk_size - chunk_overlap
            
        return chunks

    def ingest(self, pdf_path):
        print(f"📄 Loading {pdf_path}...")
        reader = PdfReader(pdf_path)
        full_text = ""
        for page in reader.pages:
            full_text += page.extract_text() + "\n"

        print(f"✂️  Splitting text...")
        chunks = self.recursive_split(full_text)
        print(f"   -> Created {len(chunks)} chunks.")

        print("💾 Indexing Documents to Vector Store...")
        
        # Prepare data for Chroma
        ids = [str(uuid.uuid4()) for _ in chunks]
        metadatas = [{"source": pdf_path} for _ in chunks]
        
        self.collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )
        print("✅ Ingestion Complete.")

    def ask(self, query):
        if self.collection.count() == 0:
            return "Please ingest a document first.", []
        
        print("🔍 Retrieving context...")
        results = self.collection.query(
            query_texts=[query],
            n_results=3
        )
        
        # Results are lists of lists (for batched queries)
        retrieved_docs = results['documents'][0]
        # retrieved_metas = results['metadatas'][0] # Not used currently
        
        context_text = "\n\n".join(retrieved_docs)
        
        # Construct Prompt
        prompt = f"""You are a helpful assistant. Answer the question based ONLY on the provided context.
        
Context:
{context_text}

Question: {query}

Answer:"""
        
        print("🤖 Generating Answer...")
        
        # Generate with GPT4All
        # temp=0 for deterministic answers
        response = self.llm.generate(prompt, temp=0.1, max_tokens=500)
        
        # Format "sources" for compatibility
        # We'll recreate simple objects to match previous API expectation
        class SourceDoc:
            def __init__(self, content, meta):
                self.page_content = content
                self.metadata = meta

        sources = []
        for i, doc_text in enumerate(retrieved_docs):
             sources.append(SourceDoc(doc_text, results['metadatas'][0][i]))

        return response.strip(), sources
    
    def clear(self):
        print("🧹 Clearing Vector Store...")
        self.chroma_client.delete_collection("pdf_docs")
        self.collection = self.chroma_client.get_or_create_collection(
            name="pdf_docs",
            embedding_function=self.embedding_fn
        )

def main():
    chat = ChatPDF()
    
    print("🚀 Starting Local RAG System (No LangChain)...")
    
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
    else:
        # Optional: prompt if running interactively
        # pdf_path = input("Enter path to your PDF file: ").strip()
        pass 
    
    # Simple loop for manual testing if needed
    # ... (Logic similar to previous main if desired)
    print("API Mode Ready. Run 'python api.py' to serve.")

if __name__ == "__main__":
    main()
