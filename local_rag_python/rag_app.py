import os
import sys

# Patch 'pwd' module for using older LangChain on Windows
if os.name == 'nt':
    try:
        import pwd
    except ImportError:
        import types
        sys.modules['pwd'] = types.ModuleType('pwd')


# Legacy imports for Langchain 0.0.350
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.llms import GPT4All
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

class ChatPDF:
    vector_store = None
    retrieval_chain = None

    def __init__(self):
        print("🧠 Initializing Embeddings...")
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        print("🤖 Initializing Local LLM (GPT4All)...")
        self.llm = GPT4All(
            model="orca-mini-3b-gguf2-q4_0.gguf",
            allow_download=True
        )

    def ingest(self, pdf_path):
        print(f"📄 Loading {pdf_path}...")
        loader = PyPDFLoader(pdf_path)
        documents = loader.load()

        print(f"✂️  Splitting text...")
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        texts = text_splitter.split_documents(documents)
        print(f"   -> Created {len(texts)} chunks.")

        print("💾 Creating Local Vector Store...")
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
        
        response = self.retrieval_chain.run(query) # .run() was common in 0.0.x, or invoke/call
        # Actually in 0.0.350 invoke() existed but run() was primary for strings. 
        # But we used return_source_documents=True, so logic implies we need the dict result.
        # In 0.0.x, result = chain({"query": query})
        
        # Let's check 0.0.350 usage:
        # qa = RetrievalQA.from_chain_type(...)
        # result = qa(query) or qa({"query": query})
        
        # To be safe for 0.0.350:
        response = self.retrieval_chain({"query": query})
        return response["result"], response["source_documents"]
    
    def clear(self):
        self.vector_store = None
        self.retrieval_chain = None

def main():
    chat = ChatPDF()
    
    print("🚀 Starting Local RAG System (Legacy Langchain)...")
    
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
    else:
        pdf_path = input("Enter path to your PDF file: ").strip()
    
    if not os.path.exists(pdf_path):
        print(f"❌ File not found: {pdf_path}")
        return

    chat.ingest(pdf_path)

    print("\n✅ System Ready! Ask questions (type 'exit' to quit).")
    
    while True:
        query = input("\nCustomer: ")
        if query.lower() in ["exit", "quit", "q"]:
            break
            
        print("Thinking...", end="", flush=True)
        answer, sources = chat.ask(query)
        
        print("\n\n🤖 AI Answer:")
        print(answer)
        print("\n[Sources referenced:]")
        for doc in sources:
            print(f"- Page {doc.metadata.get('page', '?')}")

if __name__ == "__main__":
    main()
