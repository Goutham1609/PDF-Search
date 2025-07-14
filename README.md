# PDF-Search

# Enhanced BRSR Search API

This project provides an API to upload, process, and search Business Responsibility and Sustainability Report (BRSR) PDFs using vector embeddings and OCR.

---

## Features

- Upload BRSR PDFs and automatically split them into searchable chunks.
- Supports OCR for scanned PDFs using Tesseract.
- Vector indexing with Pinecone or local vector DB.
- Semantic search using a cross-encoder for re-ranking.
- Metadata support for company name and reporting years.

---

## Tech Stack

- **FastAPI** — Backend API framework.
- **LangChain** — Text chunking.
- **Sentence Transformers** — Embeddings and cross-encoder.
- **Pinecone** — Vector database (optional).
- **PyPDF2 & pdf2image + pytesseract** — PDF parsing and OCR.
- **CSV** — Metadata storage.

---

## CSV Metadata

All uploaded PDFs have metadata stored in `brsr_metadata.csv`:

