from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Standard, StandardRelationship
from app.utils.security import get_current_user

router = APIRouter(prefix="/standards", tags=["standards"])


@router.get("")
def list_standards(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Standard).order_by(Standard.title).all()


@router.get("/{standard_id}")
def get_standard(standard_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    standard = db.query(Standard).filter(Standard.id == standard_id).first()
    if not standard:
        raise HTTPException(status_code=404, detail="Standard not found")
    return standard


@router.get("/{standard_id}/related")
def get_related_standards(standard_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    standard = db.query(Standard).filter(Standard.id == standard_id).first()
    if not standard:
        raise HTTPException(status_code=404, detail="Standard not found")

    relationships = db.query(StandardRelationship).filter(StandardRelationship.standard_id == standard_id).all()
    related = []
    for rel in relationships:
        if rel.related_standard_id:
            related.append({
                "relationship_type": rel.relationship_type,
                "related_standard": db.query(Standard).filter(Standard.id == rel.related_standard_id).first(),
            })
    return {"standard": standard, "related": related}
