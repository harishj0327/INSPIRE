from fastapi import APIRouter, Depends
from sqlalchemy import distinct, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import AuditLog, Recommendation, Requirement, SavedRecommendation, TenderReview
from app.utils.security import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
def dashboard_stats(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    active_requirements = db.query(func.count(Requirement.id)).filter(Requirement.user_id == current_user.id, Requirement.status != "archived").scalar() or 0
    recommended_standards = (
        db.query(func.count(distinct(Recommendation.standard_id)))
        .join(Requirement, Recommendation.requirement_id == Requirement.id)
        .filter(Requirement.user_id == current_user.id)
        .scalar() or 0
    )
    tender_reviews = (
        db.query(func.count(TenderReview.id))
        .join(Requirement, TenderReview.requirement_id == Requirement.id)
        .filter(Requirement.user_id == current_user.id)
        .scalar() or 0
    )
    saved_standards = db.query(func.count(SavedRecommendation.id)).filter(SavedRecommendation.user_id == current_user.id).scalar() or 0
    recent_activity = db.query(AuditLog).filter(AuditLog.user_id == current_user.id).order_by(AuditLog.created_at.desc()).limit(10).all()
    return {
        "active_requirements": active_requirements,
        "standards_recommended": recommended_standards,
        "tender_reviews": tender_reviews,
        "saved_standards": saved_standards,
        "recent_activity": recent_activity,
    }
