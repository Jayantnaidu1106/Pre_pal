import os
import sys

try:
    from langchain_community.document_loaders import PyPDFLoader
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    from langchain_community.embeddings import HuggingFaceEmbeddings
    from langchain_community.vectorstores import Chroma
    from langchain_community.llms import GPT4All
    from langchain_core.prompts import PromptTemplate
    # Standard import for LangChain 0.1.x
    from langchain.chains import RetrievalQA
    IMPORTS_SUCCESS = True
except ImportError as e:
    print(f"[ERROR] Dependency missing: {e}")
    IMPORTS_SUCCESS = False

if IMPORTS_SUCCESS:
    class ChatPDF:
        vector_store = None
        retrieval_chain = None
        
        def __init__(self):
            print("[INFO] Initializing Embeddings...")
            self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
            print("[INFO] Initializing Local LLM (GPT4All)...")
            # Removed invalid n_ctx parameters here as well
            self.llm = GPT4All(
                model="orca-mini-3b-gguf2-q4_0.gguf",
                allow_download=True,
                n_threads=4,
                max_tokens=1024
            )

        def ingest(self, pdf_path):
            print(f"[INFO] Loading {pdf_path}...")
            loader = PyPDFLoader(pdf_path)
            documents = loader.load()

            print(f"[INFO] Splitting text...")
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            texts = text_splitter.split_documents(documents)
            print(f"   -> Created {len(texts)} chunks.")

            print("[INFO] Creating Local Vector Store...")
            self.vector_store = Chroma.from_documents(
                documents=texts,
                embedding=self.embeddings,
                persist_directory="db"
            )
            
            self.retrieval_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=self.vector_store.as_retriever(search_kwargs={"k": 3}),
                return_source_documents=True
            )

        def ask(self, query):
            if not self.retrieval_chain:
                return "Please ingest a document first.", []
            
            response = self.retrieval_chain.invoke(query)
            return response["result"], response["source_documents"]
        
        def clear(self):
            self.vector_store = None
            self.retrieval_chain = None

else:
    class ChatPDF:
        def __init__(self):
            raise ImportError("Required dependencies (langchain) are missing. Check environment.")
            
        def ingest(self, pdf_path):
            raise ImportError("RAG dependencies unavailable")
            
        def ask(self, query):
            raise ImportError("RAG dependencies unavailable")

def main():
    if not IMPORTS_SUCCESS:
        print("[ERROR] Cannot run RAG system due to missing dependencies.")
        return

    chat = ChatPDF()
    
    print("[INFO] Starting Local RAG System...")
    
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
    else:
        pdf_path = input("Enter path to your PDF file: ").strip()
    
    if not os.path.exists(pdf_path):
        print(f"[ERROR] File not found: {pdf_path}")
        return

    chat.ingest(pdf_path)

    print("\n[INFO] System Ready! Ask questions (type 'exit' to quit).")
    
    while True:
        query = input("\nCustomer: ")
        if query.lower() in ["exit", "quit", "q"]:
            break
            
        print("Thinking...", end="", flush=True)
        answer, sources = chat.ask(query)
        
        print("\n\n[AI Answer:]")
        print(answer)
        print("\n[Sources referenced:]")
        for doc in sources:
            print(f"- Page {doc.metadata.get('page', '?')}")

if __name__ == "__main__":
    main()
