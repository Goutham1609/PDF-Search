from fastapi import APIRouter, UploadFile, File
from typing import List
import os
from csv_processor import EnhancedCSVProcessor
from embed import EnhancedEmbeddingModel
from pdf_processor import EnhancedPDFProcessor
from vector_db import EnhancedVectorDatabase
from models import SearchRequest
from sentence_transformers.cross_encoder import CrossEncoder

router = APIRouter()

csv_processor = EnhancedCSVProcessor()
pdf_processor = EnhancedPDFProcessor()
embedding_model = EnhancedEmbeddingModel()
vector_db = EnhancedVectorDatabase()
cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

@router.post("/index")
async def index_pdfs(files: List[UploadFile] = File(...)):
    upload_dir = "uploaded_pdfs"
    os.makedirs(upload_dir, exist_ok=True)
    file_paths = []
    for file in files:
        file_path = os.path.join(upload_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        file_paths.append(file_path)

    csv_processor.load_csv()
    pdf_metadata_dict = csv_processor.df.set_index('ATTACHMENT').to_dict(orient='index')

    pdf_metadata = {}

    for file_path in file_paths:
        file_name = os.path.basename(file_path)

        matched_meta = None
        for k, v in pdf_metadata_dict.items():
            csv_filename = os.path.basename(k)
            if csv_filename == file_name:
                matched_meta = v
                break

        if not matched_meta:
            print(f"No metadata found for: {file_name}")
            continue

        pdf_metadata[file_name] = {
            "company": matched_meta["COMPANY"],
            "from_year": matched_meta["FROM YEAR"],
            "to_year": matched_meta["TO YEAR"],
            "url": k,
            "filepath": file_path,
        }

        print(f"Matched {file_name} with metadata: {matched_meta}")

    chunks = pdf_processor.process_pdfs_with_metadata(pdf_metadata)
    embeddings = embedding_model.encode_with_context(chunks)
    vector_db.upsert_with_metadata(chunks, embeddings)

    return {
        "message": f"Indexed {len(chunks)} chunks from {len(file_paths)} PDFs.",
        "files": list(pdf_metadata.keys())
    }


@router.post("/search")
def search(req: SearchRequest):
    csv_processor.load_csv()
    csv_processor.initialize_company_embeddings(embedding_model)
    companies = []
    if req.company:
        matches = csv_processor.find_best_matching_companies(req.company)
        companies = [m[0] for m in matches]

    query_data = {'text': req.query}
    if companies:
        query_data['company'] = companies[0]
    if req.year:
        query_data['year'] = req.year

    query_embedding = embedding_model.encode_with_context([query_data], is_query=True)[0]
    results = vector_db.index.query(vector=query_embedding, top_k=max(req.top_k*4, 20), include_metadata=True)
    matches = results.get("matches", [])

    pairs = [(req.query, m["metadata"]["text"]) for m in matches]
    if not pairs:
        return {"message": "No relevant results found."}

    scores = cross_encoder.predict(pairs)
    combined = list(zip(matches, scores))
    reranked = sorted(combined, key=lambda x: x[1], reverse=True)

    final_results = []
    for match, score in reranked[:req.top_k]:
        final_results.append({
            "text": match["metadata"]["text"][:500],
            "company": match["metadata"]["company"],
            "from_year": match["metadata"]["from_year"],
            "to_year": match["metadata"]["to_year"],
            "filename": match["metadata"]["filename"],
            "score": float(match["score"]),
            "rerank_score": float(score)
        })
    return final_results

@router.get("/companies")
def list_companies():
    csv_processor.load_csv()
    return {"companies": csv_processor.get_all_companies()}

@router.get("/company-info")
def company_info(name: str):
    csv_processor.load_csv()
    matches = csv_processor.find_best_matching_companies(name)
    if not matches:
        return {"message": "No matching company found."}
    company = matches[0][0]
    years = csv_processor.get_years_for_company(company)