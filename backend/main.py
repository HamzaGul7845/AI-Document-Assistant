from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fitz
from sentence_transformers import SentenceTransformer
import chromadb
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
    )

app = FastAPI()
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

chroma_client = chromadb.PersistentClient(
    path="./chroma_db"
)
collection = chroma_client.get_or_create_collection(
    name="documents"
)

def chunk_text(text, chunk_size=1000, overlap=200):
    chunks = []

    start = 0

    while start < len(text):
        end = start + chunk_size

        chunk = text[start:end]
        chunks.append(chunk)

        start = end - overlap

    return chunks

def create_embeddings(chunks):
    embeddings = embedding_model.encode(chunks)

    return embeddings.tolist()

def store_chunks(chunks, embeddings):
    ids = []

    for index in range(len(chunks)):
        ids.append(f"chunk_{index}")

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings
    )


app.add_middleware(
    CORSMiddleware,
allow_origins=[
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
],    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {"message": "AI Document Assistant API is running"}


@app.post("/ask")
def ask_question(request: QuestionRequest):

    # 1. Convert user's question into an embedding
    query_embedding = embedding_model.encode(
        [request.question]
    ).tolist()

    # 2. Search ChromaDB for relevant chunks
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=3
    )

    # 3. Get retrieved documents
    retrieved_chunks = results["documents"][0]

    # 4. Combine chunks into one context
    context = "\n\n".join(retrieved_chunks)

    # 5. Create prompt for the LLM
    prompt = f"""
You are an AI document assistant.

Answer the user's question using only the information
provided in the context below.

If the answer is not present in the context,
say that you could not find the answer in the document.

Context:
{context}

Question:
{request.question}
"""

    # 6. Send context + question to Groq
    response = client.responses.create(
        model="openai/gpt-oss-20b",
        input=prompt
    )

    # 7. Return the AI answer
    return {
        "question": request.question,
        "answer": response.output_text,
        "sources": retrieved_chunks
    }

@app.post("/ai-test")
def ai_test(request: QuestionRequest):
    response = client.responses.create(
        model="openai/gpt-oss-20b",
        input=request.question
    )

    return {
        "question": request.question,
        "answer": response.output_text
    }




@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    pdf_bytes = await file.read()

    pdf = fitz.open(
        stream=pdf_bytes,
        filetype="pdf"
    )

    text = ""

    for page in pdf:
        text += page.get_text()

    pdf.close()

    chunks = chunk_text(text)

    embeddings = create_embeddings(chunks)
    store_chunks(chunks, embeddings)

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "total_characters": len(text),
        "total_chunks": len(chunks),
        "embedding_dimension": len(embeddings[0]) if embeddings else 0,
        "chunks": chunks,
        "embeddings": embeddings
    }

@app.post("/search")
def search_documents(request: QuestionRequest):

    query_embedding = embedding_model.encode(
        [request.question]
    ).tolist()

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=3
    )

    return {
        "question": request.question,
        "results": results["documents"]
    }


