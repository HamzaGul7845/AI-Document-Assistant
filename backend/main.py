from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fitz
from sentence_transformers import SentenceTransformer

app = FastAPI()
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

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


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
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
    return {
        "question_received": request.question
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

    return {
        "filename": file.filename,
        "content_type": file.content_type,
        "total_characters": len(text),
        "total_chunks": len(chunks),
        "embedding_dimension": len(embeddings[0]) if embeddings else 0,
        "chunks": chunks,
        "embeddings": embeddings
    }


