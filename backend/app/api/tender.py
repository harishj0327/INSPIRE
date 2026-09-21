import os
import re
import tempfile

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.audit import log_action
from app.database import get_db
from app.document_processing.service import extract_document_text
from app.ai.extractor import RequirementExtractor
from app.models.models import Recommendation, Requirement, Standard, TenderFinding, TenderReview
from app.utils.security import get_current_user

router = APIRouter(prefix="/tender-reviews", tags=["tender"])


def _normalise_reference(value: str) -> str:
    return re.sub(r"\s+", " ", value.lower().replace("-", " ")).strip()


def extract_references(text: str) -> list[dict]:
    references = []
    pattern = re.compile(r"\bis\s*\d+(?:\s*\([^)]*\))?(?:\s*[:,-]?\s*(20\d{2}))?", re.IGNORECASE)
    for match in pattern.finditer(text):
        reference_without_year = re.sub(r"\s*[:,-]?\s*20\d{2}\s*$", "", match.group(0), flags=re.IGNORECASE)
        references.append({
            "reference": match.group(0).strip(),
            "normalised": _normalise_reference(reference_without_year),
            "year": int(match.group(1)) if match.group(1) else None,
        })
    return references


def _term_matches_standard(term: str, standard_text: str) -> bool:
    words = [word for word in re.findall(r"[a-z0-9]+", term.lower()) if len(word) > 2]
    if not words:
        return True
    matches = sum(word in standard_text for word in words)
    return matches / len(words) >= 0.75


def extract_tender_terms(text: str) -> list[str]:
    terms = []
    for match in re.finditer(r"(?:must|shall|should|include|includes|requires?)\s+(?:provide\s+)?([^.;]+)", text, re.IGNORECASE):
        clause = re.sub(r"\s+", " ", match.group(1)).strip()
        for term in re.split(r",|\band\b", clause, flags=re.IGNORECASE):
            cleaned = term.strip(" :")
            if cleaned and len(cleaned.split()) <= 8:
                terms.append(cleaned)
    return terms


@router.post("")
async def create_tender_review(
    requirement_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id, Requirement.user_id == current_user.id).first()
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")

    contents = await file.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename or "")[1]) as handle:
        handle.write(contents)
        temp_path = handle.name
    try:
        try:
            extraction = extract_document_text(file.filename or "document", temp_path, file.content_type)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        if extraction.is_ocr_required:
            raise HTTPException(status_code=422, detail=extraction.extraction_error or "OCR is required for this document")
        text = extraction.extracted_text.strip()
    finally:
        os.unlink(temp_path)

    if not text:
        raise HTTPException(status_code=422, detail="No text could be extracted from the document")

    recommendations = (
        db.query(Recommendation, Standard)
        .join(Standard, Recommendation.standard_id == Standard.id)
        .filter(Recommendation.requirement_id == requirement.id)
        .all()
    )
    normalized_text = text.lower()
    references = extract_references(text)
    referenced_numbers = {_normalise_reference(item["reference"]) for item in references}
    matched_standards = []
    findings = []
    for recommendation, standard in recommendations:
        number = _normalise_reference(standard.is_number)
        matching_reference = next((item for item in references if item["normalised"] == number), None)
        standard_text = " ".join([
            standard.title or "",
            standard.description or "",
            standard.scope or "",
            standard.keywords or "",
            standard.technical_parameters or "",
        ]).lower()
        matched_standards.append({"is_number": standard.is_number, "title": standard.title})
        if number not in referenced_numbers:
            findings.append({
                "finding_type": "Missing standard reference",
                "severity": "high",
                "title": f"Tender does not reference {standard.is_number}",
                "description": f"The analysed requirement is linked to {standard.is_number} ({standard.title}), but that standard number was not found in the tender text.",
            })
        for term in (standard.technical_parameters or "").split(",")[:4]:
            term = term.strip()
            if term and term.lower() not in normalized_text:
                findings.append({
                    "finding_type": "Missing technical parameter",
                    "severity": "medium",
                    "title": f"Check parameter: {term}",
                    "description": f"The tender text does not explicitly state the parameter recorded for {standard.is_number}: {term}.",
                })
            if matching_reference and matching_reference["year"]:
                current_version = str(standard.current_version or standard.year or "")
                if matching_reference["year"] != standard.year and str(matching_reference["year"]) != current_version:
                    findings.append({
                        "finding_type": "Reference may require verification",
                        "severity": "medium",
                        "title": f"Verify version for {standard.is_number}",
                        "description": f"The tender references year {matching_reference['year']}, while the current database record is {current_version or 'not specified'}. This is a review priority, not a legal conclusion.",
                    })
            elif matching_reference:
                findings.append({
                    "finding_type": "Reference may require verification",
                    "severity": "low",
                    "title": f"Version information unavailable for {standard.is_number}",
                    "description": "Unable to determine whether this reference is outdated from the current knowledge base.",
                })

    extracted_tender = RequirementExtractor().extract(text)
    requirement_terms = list(dict.fromkeys([
        *(requirement.extracted_data or {}).get("technical_characteristics", []),
        *(extracted_tender.get("technical_characteristics") or []),
        *extract_tender_terms(text),
        *[term.strip() for term in (requirement.technical_requirements or "").split(";") if term.strip()],
    ]))
    all_standard_text = " ".join(
        " ".join([
            standard.title or "",
            standard.description or "",
            standard.scope or "",
            standard.keywords or "",
            standard.technical_parameters or "",
        ])
        for _, standard in recommendations
    ).lower()
    unresolved_requirements = []
    for term in requirement_terms:
        if term and not _term_matches_standard(term, all_standard_text):
            unresolved_requirements.append(term)
            findings.append({
                "finding_type": "Unresolved technical requirement",
                "severity": "medium",
                "title": "Technical requirement may require additional standards review",
                "description": f"The extracted requirement '{term}' was not sufficiently matched to the retrieved standards. Potential issue for review.",
            })

    if not recommendations:
        findings.append({
            "finding_type": "No linked standard",
            "severity": "high",
            "title": "Requirement has no analysed standard recommendation",
            "description": "Analyse the requirement before using tender review so the document can be checked against authoritative database records.",
        })
    if not findings:
        findings.append({
            "finding_type": "Review passed",
            "severity": "low",
            "title": "Referenced standards and parameters found",
            "description": "The extracted tender text contains the linked standard references and recorded technical parameters. Confirm applicability against the official BIS publication.",
        })

    high_count = sum(1 for finding in findings if finding["severity"] == "high")
    summary = f"Analysed {len(text.split())} words from {file.filename}. Found {len(findings)} review findings, including {high_count} high-severity issue(s)."

    review = TenderReview(
        requirement_id=requirement.id,
        document_name=file.filename,
        extracted_text=text,
        summary=summary,
        findings=findings,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    for finding in findings:
        db.add(TenderFinding(
            tender_review_id=review.id,
            finding_type=finding["finding_type"],
            severity=finding["severity"],
            title=finding["title"],
            description=finding["description"],
        ))
        log_action(db, current_user.id, "tender_finding_generated", "tender_review", review.id, finding["title"])
    db.commit()
    log_action(db, current_user.id, "tender_review_created", "tender_review", review.id, f"Reviewed tender document: {file.filename}")
    return {
        "id": review.id,
        "document_name": review.document_name,
        "summary": review.summary,
        "extracted_text": text,
        "referenced_standards": references,
        "matched_standards": matched_standards,
        "unresolved_requirements": unresolved_requirements,
        "findings": review.findings,
    }


@router.get("/{review_id}")
def get_tender_review(review_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    review = db.query(TenderReview).join(Requirement).filter(TenderReview.id == review_id, Requirement.user_id == current_user.id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Tender review not found")
    return review
