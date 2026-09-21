from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.requirements import router as requirement_router
from app.api.standards import router as standards_router
from app.api.tender import router as tender_router
from app.api.projects import router as projects_router
from app.api.audit import router as audit_router
from app.api.dashboard import router as dashboard_router
from app.api.reports import router as reports_router
from app.api.search import router as search_router
from app.config import get_settings
from app.database import Base, engine, migrate_local_schema

settings = get_settings()

app = FastAPI(
    title="INSPIRE",
    description="Indian Standards Procurement Intelligence & Recommendation Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.backend_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(requirement_router, prefix="/api/v1")
app.include_router(standards_router, prefix="/api/v1")
app.include_router(tender_router, prefix="/api/v1")
app.include_router(projects_router, prefix="/api/v1")
app.include_router(audit_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")
app.include_router(search_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "INSPIRE API is running", "app": "INSPIRE"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    migrate_local_schema()
