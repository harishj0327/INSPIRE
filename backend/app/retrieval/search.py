from sqlalchemy.orm import Session

from app.models.models import Standard


class StandardsSearch:
    def __init__(self, db: Session):
        self.db = db

    def search(self, query: str, limit: int = 10):
        q = f"%{query.lower()}%"
        return (
            self.db.query(Standard)
            .filter(
                (Standard.is_number.ilike(q))
                | (Standard.title.ilike(q))
                | (Standard.category.ilike(q))
                | (Standard.product_type.ilike(q))
                | (Standard.application.ilike(q))
                | (Standard.keywords.ilike(q))
                | (Standard.description.ilike(q))
            )
            .limit(limit)
            .all()
        )
