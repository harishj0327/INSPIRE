from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Project
from app.utils.security import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("")
def list_projects(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Project).filter(Project.user_id == current_user.id).order_by(Project.created_at.desc()).all()


@router.post("")
def create_project(payload: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    name = (payload.get("name") or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Project name is required")
    project = Project(name=name, description=payload.get("description", ""), user_id=current_user.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project
