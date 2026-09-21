from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.ai.extractor import RequirementExtractor
from app.api.audit import log_action
from app.database import get_db
from app.models.models import AuditLog, Project, Recommendation, Requirement, SavedRecommendation, Standard, StandardRelationship
from app.schemas.schemas import RequirementCreate, RequirementOut
from app.services.recommendation_service import get_provider
from app.utils.security import get_current_user

router = APIRouter(prefix="/requirements", tags=["requirements"])


@router.get("", response_model=list[RequirementOut])
def list_requirements(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Requirement).filter(Requirement.user_id == current_user.id).order_by(Requirement.created_at.desc()).all()


@router.post("", response_model=RequirementOut)
def create_requirement(payload: RequirementCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not payload.title or not payload.requirement_text:
        raise HTTPException(status_code=400, detail="Requirement title and description are required")

    req = Requirement(
        title=payload.title,
        requirement_text=payload.requirement_text,
        product=payload.product,
        product_category=payload.product_category,
        application=payload.application,
        industry=payload.industry,
        quantity=payload.quantity,
        technical_requirements=payload.technical_requirements,
        user_id=current_user.id,
        project_id=payload.project_id,
        status="draft",
        extracted_data={},
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    log_action(db, current_user.id, "requirement_created", "requirement", req.id, f"Created requirement: {req.title}")
    return req


@router.get("/saved")
def list_saved_recommendations(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    saved = db.query(SavedRecommendation).filter(SavedRecommendation.user_id == current_user.id).order_by(SavedRecommendation.created_at.desc()).all()
    return [{
        "id": item.id,
        "notes": item.notes,
        "created_at": item.created_at,
        "recommendation": item.recommendation,
        "requirement": item.requirement,
        "standard": item.recommendation.standard if item.recommendation else None,
    } for item in saved]


@router.get("/{requirement_id}", response_model=RequirementOut)
def get_requirement(requirement_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id, Requirement.user_id == current_user.id).first()
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return requirement


@router.post("/{requirement_id}/analyse")
def analyse_requirement(requirement_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id, Requirement.user_id == current_user.id).first()
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")

    provider = get_provider()
    extracted = provider.extract_requirement(requirement.requirement_text)
    requirement.extracted_data = extracted
    requirement.product = extracted.get("product", requirement.product)
    requirement.product_category = extracted.get("product_category", requirement.product_category)
    requirement.application = extracted.get("application", requirement.application)
    requirement.industry = extracted.get("industry", requirement.industry)
    requirement.quantity = extracted.get("quantity", requirement.quantity)
    supplied_terms = [term.strip() for term in (requirement.technical_requirements or "").replace(",", ";").split(";") if term.strip()]
    extracted_terms = extracted.get("technical_characteristics", [])
    requirement.technical_requirements = "; ".join(dict.fromkeys([*supplied_terms, *extracted_terms]))
    requirement.status = "analysed"
    db.commit()

    standards = db.query(Standard).limit(30).all()
    standards_dict = [
        {
            "id": s.id,
            "title": s.title,
            "description": s.description,
            "keywords": s.keywords,
            "technical_parameters": s.technical_parameters,
            "category": s.category,
            "application": s.application,
            "product_type": s.product_type,
            "source": s.source,
            "status": s.status,
            "current_version": s.current_version,
            "review_year": s.review_year,
            "is_number": s.is_number,
        }
        for s in standards
    ]
    ranked = provider.rank_standards(extracted, standards_dict)

    for item in ranked[:5]:
        existing = db.query(Recommendation).filter(Recommendation.requirement_id == requirement.id, Recommendation.standard_id == item["id"]).first()
        if not existing:
            rec = Recommendation(
                requirement_id=requirement.id,
                standard_id=item["id"],
                score=int(item["score"]),
                why_it_matches=provider.explain_standard(extracted, item),
                relevant_elements="; ".join(extracted.get("technical_characteristics", [])[:4]),
                explanation=provider.explain_standard(extracted, item),
            )
            db.add(rec)
    db.commit()
    log_action(db, current_user.id, "requirement_analyzed", "requirement", requirement.id, "Requirement analysed and standards ranked")
    return {"requirement_id": requirement.id, "extracted": extracted, "recommendations": ranked[:5]}


@router.post("/{requirement_id}/recommendations/{recommendation_id}/save")
def save_recommendation(requirement_id: int, recommendation_id: int, payload: dict | None = None, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    recommendation = db.query(Recommendation).join(Requirement).filter(Recommendation.id == recommendation_id, Recommendation.requirement_id == requirement_id, Requirement.user_id == current_user.id).first()
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    saved = db.query(SavedRecommendation).filter(SavedRecommendation.user_id == current_user.id, SavedRecommendation.recommendation_id == recommendation.id).first()
    if not saved:
        saved = SavedRecommendation(user_id=current_user.id, recommendation_id=recommendation.id, requirement_id=requirement_id, project_id=recommendation.requirement.project_id, notes=(payload or {}).get("notes", ""))
        db.add(saved)
    recommendation.is_saved = True
    db.commit()
    db.refresh(saved)
    log_action(db, current_user.id, "recommendation_saved", "recommendation", recommendation.id, "Saved recommendation for later review")
    return {"saved": True, "id": saved.id}


@router.delete("/{requirement_id}/recommendations/{recommendation_id}/save")
def remove_saved_recommendation(requirement_id: int, recommendation_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    saved = db.query(SavedRecommendation).filter(SavedRecommendation.user_id == current_user.id, SavedRecommendation.requirement_id == requirement_id, SavedRecommendation.recommendation_id == recommendation_id).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved recommendation not found")
    recommendation = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
    if recommendation:
        recommendation.is_saved = False
    db.delete(saved)
    db.commit()
    log_action(db, current_user.id, "recommendation_unsaved", "recommendation", recommendation_id, "Removed saved recommendation")
    return {"saved": False}


@router.get("/{requirement_id}/recommendations")
def get_recommendations(requirement_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    requirement = db.query(Requirement).filter(Requirement.id == requirement_id, Requirement.user_id == current_user.id).first()
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")

    recommendations = db.query(Recommendation).filter(Recommendation.requirement_id == requirement.id).all()
    response = []
    for rec in recommendations:
        standard = db.query(Standard).filter(Standard.id == rec.standard_id).first()
        related = db.query(Standard).join(
            StandardRelationship,
            StandardRelationship.related_standard_id == Standard.id,
        ).filter(StandardRelationship.standard_id == rec.standard_id).all()
        response.append({
            "id": rec.id,
            "standard_id": rec.standard_id,
            "score": rec.score,
            "is_saved": rec.is_saved,
            "why_it_matches": rec.why_it_matches,
            "relevant_elements": rec.relevant_elements,
            "explanation": rec.explanation,
            "standard": standard,
            "related_standards": related,
        })
    return response
