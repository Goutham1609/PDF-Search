import PyPDF2
from langchain.text_splitter import RecursiveCharacterTextSplitter
from config import CHUNK_SIZE, CHUNK_OVERLAP
from pdf2image import convert_from_path
import pytesseract

class EnhancedPDFProcessor:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def process_pdfs_with_metadata(self, pdf_metadata):
        all_chunks = []
        for filename, metadata in pdf_metadata.items():
            with open(metadata['filepath'], 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                full_text = ""
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        full_text += page_text + "\n"

            # If no text extracted, try OCR
            if not full_text.strip():
                print(f"⚠️ No text extracted from {filename} with PyPDF2. Trying OCR...")
                try:
                    images = convert_from_path(metadata['filepath'])
                    for img in images:
                        ocr_text = pytesseract.image_to_string(img)
                        full_text += ocr_text + "\n"
                except Exception as e:
                    print(f"❌ OCR failed for {filename}: {e}")

            print(f"\n--- Extracted text from {filename} ---")
            print(full_text[:500])
            print(f"Total extracted text length for {filename}: {len(full_text)}")
            print("--- End of preview ---\n")

            if not full_text.strip():
                print(f"⚠️ Still no text extracted from {filename} after OCR.")
                continue

            chunks_text = self.text_splitter.split_text(full_text)
            print(f"Splitting into {len(chunks_text)} chunks.")
            for i, chunk_text in enumerate(chunks_text):
                chunk_data = {
                    'text': chunk_text,
                    'chunk_id': f"{metadata['company'].replace(' ', '_')}_{metadata['from_year']}_{metadata['to_year']}_chunk_{i}",
                    'company': metadata['company'],
                    'from_year': metadata['from_year'],
                    'to_year': metadata['to_year'],
                    'filename': filename,
                    'chunk_index': i,
                    'total_chunks': len(chunks_text)
                }
                all_chunks.append(chunk_data)
        return all_chunks