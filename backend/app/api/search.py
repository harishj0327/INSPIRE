from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Standard
from app.utils.security import get_current_user

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
def search_standards(
    q: str = Query(..., alias="q"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = f"%{q.lower()}%"
    results = (
        db.query(Standard)
        .filter(
            (Standard.is_number.ilike(query))
            | (Standard.title.ilike(query))
            | (Standard.category.ilike(query))
            | (Standard.product_type.ilike(query))
            | (Standard.application.ilike(query))
            | (Standard.keywords.ilike(query))
        )
        .limit(10)
        .all()
    )
    return [{
        "id": item.id,
        "title": item.title,
        "is_number": item.is_number,
        "category": item.category,
        "application": item.application,
        "source": item.source,
    } for item in results]
