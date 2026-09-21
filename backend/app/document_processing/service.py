from __future__ import annotations

import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from pypdf import PdfReader
from docx import Document


MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
}
ALLOWED_SUFFIXES = {".pdf", ".docx", ".txt"}


@dataclass
class DocumentExtractionResult:
    filename: str
    content_type: str
    extension: str
    size_bytes: int
    secure_filename: str
    extracted_text: str = ""
    is_ocr_required: bool = False
    extraction_error: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


def secure_filename(filename: str) -> str:
    base = os.path.basename(filename or "document")
    cleaned = re.sub(r"[^A-Za-z0-9._-]", "_", base)
    if not cleaned or cleaned in {".", ".."}:
        return "document"
    return cleaned


def validate_document(file_name: str, content_type: str | None, size_bytes: int) -> None:
    ext = Path(file_name or "").suffix.lower()
    if ext not in ALLOWED_SUFFIXES and (content_type or "") not in ALLOWED_MIME_TYPES:
        raise ValueError("Unsupported document type")
    if size_bytes <= 0:
        raise ValueError("Empty file")
    if size_bytes > MAX_FILE_SIZE_BYTES:
        raise ValueError("File too large")


def extract_pdf_text(file_path: str) -> tuple[str, bool, str | None]:
    try:
        reader = PdfReader(file_path)
        text_chunks = []
        for page in reader.pages:
            page_text = page.extract_text() or ""
            text_chunks.append(page_text)
        text = "\n\n".join(text_chunks).strip()
        if text:
            return text, False, None
        return "", True, "Text could not be extracted from this document. OCR is required for scanned content."
    except Exception as exc:
        return "", True, f"Text could not be extracted from this document. OCR is required for scanned content. ({exc})"


def extract_docx_text(file_path: str) -> str:
    doc = Document(file_path)
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]
    return "\n".join(paragraphs)


def extract_txt_text(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8", errors="ignore") as handle:
        return handle.read()


def extract_document_text(file_name: str, file_path: str, content_type: str | None) -> DocumentExtractionResult:
    ext = Path(file_name or "").suffix.lower()
    safe_name = secure_filename(file_name)
    size_bytes = os.path.getsize(file_path)
    validate_document(file_name, content_type, size_bytes)

    metadata: dict[str, Any] = {
        "filename": safe_name,
        "original_filename": file_name,
        "content_type": content_type or "",
        "extension": ext,
        "size_bytes": size_bytes,
    }

    extracted_text = ""
    is_ocr_required = False
    extraction_error = None

    if ext == ".pdf" or (content_type or "") == "application/pdf":
        extracted_text, is_ocr_required, extraction_error = extract_pdf_text(file_path)
    elif ext == ".docx" or (content_type or "") == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        extracted_text = extract_docx_text(file_path)
    elif ext == ".txt" or (content_type or "") == "text/plain":
        extracted_text = extract_txt_text(file_path)
    else:
        raise ValueError("Unsupported document type")

    return DocumentExtractionResult(
        filename=file_name,
        content_type=content_type or "",
        extension=ext,
        size_bytes=size_bytes,
        secure_filename=safe_name,
        extracted_text=extracted_text,
        is_ocr_required=is_ocr_required,
        extraction_error=extraction_error,
        metadata=metadata,
    )
