from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import AuditLog
from app.utils.security import get_current_user

router = APIRouter(prefix="/audit", tags=["audit"])


def log_action(db: Session, user_id: int, action: str, object_type: str, object_id: int | None, details: str):
    db.add(AuditLog(user_id=user_id, action=action, object_type=object_type, object_id=object_id, details=details))
    db.commit()


@router.get("")
def list_audit(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(AuditLog).filter(AuditLog.user_id == current_user.id).order_by(AuditLog.created_at.desc()).all()
