from io import BytesIO

from docx import Document
from pypdf import PdfReader
from reportlab.pdfgen import canvas

from app.ai.extractor import RequirementExtractor
from app.document_processing.service import extract_document_text


def test_quantity_extraction_ignores_standard_number():
    extractor = RequirementExtractor()
    assert extractor.extract("We need 500 industrial safety helmets for construction workers.")["quantity"] == "500"
    assert extractor.extract("quantity: 500 helmets according to IS 2925")["quantity"] == "500"
    assert extractor.extract("1000 safety shoes")["quantity"] == "1000"
    assert extractor.extract("Helmets according to IS 2925, revised in 2021")["quantity"] == "Not specified"


def test_txt_docx_and_pdf_extraction(tmp_path):
    txt_path = tmp_path / "spec.txt"
    txt_path.write_text("500 helmets according to IS 2925", encoding="utf-8")
    txt_result = extract_document_text("spec.txt", str(txt_path), "text/plain")
    assert txt_result.extracted_text == "500 helmets according to IS 2925"

    docx_path = tmp_path / "spec.docx"
    document = Document()
    document.add_paragraph("500 helmets according to IS 2925")
    document.save(docx_path)
    docx_result = extract_document_text("spec.docx", str(docx_path), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    assert "IS 2925" in docx_result.extracted_text

    pdf_path = tmp_path / "spec.pdf"
    pdf = canvas.Canvas(str(pdf_path))
    pdf.drawString(72, 720, "500 helmets according to IS 2925")
    pdf.save()
    pdf_result = extract_document_text("spec.pdf", str(pdf_path), "application/pdf")
    assert "IS 2925" in pdf_result.extracted_text
