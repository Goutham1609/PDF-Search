from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List
from api import router

app = FastAPI(title="Enhanced BRSR Search API")

# ✅ CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or "*" for all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ In-memory document store
uploaded_documents = []

@app.get("/")
def root():
    return {"message": "Hello! FastAPI server is running."}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    company_name: str = Form(...),
    reporting_year: str = Form(...)
):
    contents = await file.read()
    
    uploaded_documents.append({
        "id": len(uploaded_documents) + 1,
        "name": file.filename,
        "company": company_name,
        "year": reporting_year
    })

    return JSONResponse(content={
        "message": "File uploaded successfully",
        "filename": file.filename
    })

@app.get("/documents")
def get_documents():
    return uploaded_documents

# ✅ Include your search/index routes
app.include_router(router)
