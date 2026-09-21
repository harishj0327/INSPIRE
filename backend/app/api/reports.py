from __future__ import annotations

from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from sqlalchemy.orm import Session

from app.api.audit import log_action
from app.database import get_db
from app.models.models import Amendment, Certification, Recommendation, Requirement, Standard, StandardRelationship, TenderReview, TestingRequirement
from app.utils.security import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])
DISCLAIMER = "INSPIRE provides decision-support recommendations. Verify applicability and current requirements against authoritative BIS sources before finalizing procurement specifications."


def value(value: object) -> str:
    return str(value) if value not in (None, "") else "Information not available in the current knowledge base."


def paragraph(text: object, styles) -> Paragraph:
    return Paragraph(value(text).replace("&", "&amp;"), styles["BodyText"])


@router.post("/recommendation/{requirement_id}")
def create_recommendation_report(requirement_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id, Requirement.user_id == current_user.id).first()
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")

    recommendations = db.query(Recommendation).filter(Recommendation.requirement_id == requirement.id).order_by(Recommendation.score.desc()).all()
    tender_reviews = db.query(TenderReview).filter(TenderReview.requirement_id == requirement.id).order_by(TenderReview.created_at.desc()).all()
    buffer = BytesIO()
    document = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=0.6 * inch, leftMargin=0.6 * inch, topMargin=0.6 * inch, bottomMargin=0.6 * inch)
    styles = getSampleStyleSheet()
    story = [Paragraph("INSPIRE Recommendation Report", styles["Title"]), Spacer(1, 10)]
    story.extend([
        Paragraph("Requirement", styles["Heading2"]),
        paragraph(requirement.title, styles),
        paragraph(requirement.requirement_text, styles),
        Spacer(1, 6),
    ])

    extracted = requirement.extracted_data or {}
    extracted_rows = [
        ["Product", value(requirement.product or extracted.get("product"))],
        ["Application", value(requirement.application or extracted.get("application"))],
        ["Industry", value(requirement.industry or extracted.get("industry"))],
        ["Quantity", value(requirement.quantity or extracted.get("quantity"))],
        ["Technical requirements", value(requirement.technical_requirements or "; ".join(extracted.get("technical_characteristics", [])))],
    ]
    extracted_table = Table(extracted_rows, colWidths=[1.7 * inch, 5.9 * inch])
    extracted_table.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), 0.4, "#cbd5e1"), ("VALIGN", (0, 0), (-1, -1), "TOP")]))
    story.extend([Paragraph("Extracted Requirement Information", styles["Heading2"]), extracted_table, Spacer(1, 8)])

    story.append(Paragraph("Recommended Indian Standards", styles["Heading2"]))
    if recommendations:
        for recommendation in recommendations:
            standard = db.query(Standard).filter(Standard.id == recommendation.standard_id).first()
            if not standard:
                continue
            story.extend([
                Paragraph(f"{standard.is_number} - {standard.title}", styles["Heading3"]),
                paragraph(f"INSPIRE Match Score: {recommendation.score}%", styles),
                paragraph(f"Why it matches: {recommendation.why_it_matches}", styles),
                paragraph(f"Relevant requirement elements: {recommendation.relevant_elements}", styles),
                paragraph(f"Scope: {standard.scope or standard.description}", styles),
                paragraph(f"Status: {standard.status}; Version/year: {standard.current_version or standard.year}", styles),
                paragraph(f"Review information: review year {standard.review_year}", styles),
                paragraph(f"Source: {standard.source}; {standard.source_url}", styles),
            ])
            amendments = db.query(Amendment).filter(Amendment.standard_id == standard.id).all()
            testing = db.query(TestingRequirement).filter(TestingRequirement.standard_id == standard.id).all()
            certifications = db.query(Certification).filter(Certification.standard_id == standard.id).all()
            related = db.query(Standard).join(StandardRelationship, StandardRelationship.related_standard_id == Standard.id).filter(StandardRelationship.standard_id == standard.id).all()
            story.extend([
                paragraph("Amendments: " + "; ".join(f"{item.amendment_number} {item.description}" for item in amendments), styles),
                paragraph("Testing: " + "; ".join(f"{item.test_name} - {item.method}" for item in testing), styles),
                paragraph("Certification: " + "; ".join(f"{item.cert_name} - {item.requirement}" for item in certifications), styles),
                paragraph("Related standards: " + "; ".join(f"{item.is_number} {item.title}" for item in related), styles),
                Spacer(1, 6),
            ])
    else:
        story.append(paragraph("Information not available in the current knowledge base.", styles))

    story.append(Paragraph("Tender Review Findings", styles["Heading2"]))
    for review in tender_reviews:
        story.append(paragraph(review.summary, styles))
        for finding in review.findings or []:
            story.append(paragraph(f"{finding.get('severity', 'medium').upper()}: {finding.get('title')} - {finding.get('description')}", styles))
    if not tender_reviews:
        story.append(paragraph("Information not available in the current knowledge base.", styles))

    story.extend([Spacer(1, 12), Paragraph(DISCLAIMER, styles["Italic"])])
    document.build(story)
    buffer.seek(0)
    log_action(db, current_user.id, "recommendation_report_generated", "requirement", requirement.id, "Generated database-backed recommendation PDF")
    return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="inspire-recommendation-{requirement.id}.pdf"'})
