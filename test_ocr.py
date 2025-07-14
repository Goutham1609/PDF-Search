from pdf2image import convert_from_path
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

pdf_path = "uploaded_pdfs/Godrej_Agrovet_2023_2024.pdf"

images = convert_from_path(pdf_path, poppler_path=r"C:\poppler\bin")
full_text = ""
for img in images:
    ocr_text = pytesseract.image_to_string(img)
    full_text += ocr_text + "\n"

print("OCR text length:", len(full_text))
print(full_text[:1000])
