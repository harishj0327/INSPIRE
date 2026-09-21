from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models.models import Recommendation, Requirement, Standard, User
from app.utils.security import hash_password

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_inspire.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def seed_data():
    db = TestingSessionLocal()
    try:
        user = db.query(User).filter(User.email == "admin@example.com").first()
        if not user:
            user = User(email="admin@example.com", full_name="Test User", hashed_password=hash_password("Password123!"), is_active=True)
            db.add(user)
            db.commit()
            db.refresh(user)

        standard = db.query(Standard).filter(Standard.is_number == "IS 2925").first()
        if not standard:
            standard = Standard(
                is_number="IS 2925",
                title="Industrial safety helmets - Specification",
                description="Specification for industrial safety helmets used in construction and industrial work.",
                scope="Covers impact resistance, head protection, retention systems and shell performance.",
                category="Industrial safety",
                industry="Construction",
                product_type="Industrial safety helmet",
                application="Construction / industrial work",
                keywords="helmet, safety, impact protection, head protection, industrial",
                technical_parameters="Impact resistance, shell strength, chin strap, retention system",
            )
            db.add(standard)
            db.commit()
            db.refresh(standard)

        requirement = db.query(Requirement).filter(Requirement.title == "Safety helmet tender requirement").first()
        if not requirement:
            requirement = Requirement(
                title="Safety helmet tender requirement",
                requirement_text="We need 500 industrial safety helmets for construction workers with impact protection and industrial use.",
                product="Industrial safety helmet",
                product_category="Industrial safety",
                application="Construction / industrial work",
                industry="Construction",
                quantity="500",
                technical_requirements="Impact protection; industrial use; head protection",
                user_id=user.id,
                status="draft",
                extracted_data={},
            )
            db.add(requirement)
            db.commit()
            db.refresh(requirement)

        existing = db.query(Recommendation).filter(Recommendation.requirement_id == requirement.id, Recommendation.standard_id == standard.id).first()
        if not existing:
            recommendation = Recommendation(
                requirement_id=requirement.id,
                standard_id=standard.id,
                score=90,
                why_it_matches="Relevant to industrial safety helmet requirements and construction work.",
                relevant_elements="impact protection; head protection",
                explanation="Matches the requirement for industrial helmets used in construction.",
            )
            db.add(recommendation)
            db.commit()
        return user, requirement
    finally:
        db.close()


def test_requirement_analysis_and_saved_flow():
    user, requirement = seed_data()
    login = client.post(
        "/api/v1/auth/login-json",
        json={"email": "admin@example.com", "password": "Password123!"},
    )
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    requirement_response = client.post(
        "/api/v1/requirements",
        json={
            "title": "Safety helmet tender requirement",
            "requirement_text": "We need 500 industrial safety helmets for construction workers with impact protection and industrial use.",
            "product": "Industrial safety helmet",
            "product_category": "Industrial safety",
            "application": "Construction / industrial work",
            "industry": "Construction",
            "quantity": "500",
            "technical_requirements": "Impact protection; industrial use; head protection",
        },
        headers=headers,
    )
    assert requirement_response.status_code == 200, requirement_response.text
    created_id = requirement_response.json()["id"]

    analyse = client.post(f"/api/v1/requirements/{created_id}/analyse", headers=headers)
    assert analyse.status_code == 200, analyse.text
    assert analyse.json()["recommendations"]

    recs = client.get(f"/api/v1/requirements/{created_id}/recommendations", headers=headers)
    assert recs.status_code == 200, recs.text
    recommendation_id = recs.json()[0]["id"]

    save = client.post(f"/api/v1/requirements/{created_id}/recommendations/{recommendation_id}/save", headers=headers)
    assert save.status_code == 200, save.text
    assert save.json()["saved"] is True

    saved = client.get("/api/v1/requirements/saved", headers=headers)
    assert saved.status_code == 200, saved.text
    assert saved.json()

    remove = client.delete(f"/api/v1/requirements/{created_id}/recommendations/{recommendation_id}/save", headers=headers)
    assert remove.status_code == 200, remove.text
    assert not client.get("/api/v1/requirements/saved", headers=headers).json()

    stats = client.get("/api/v1/dashboard/stats", headers=headers)
    assert stats.status_code == 200, stats.text
    assert stats.json()["active_requirements"] >= 1
    assert stats.json()["standards_recommended"] >= 1
    assert stats.json()["saved_standards"] == 0

    report = client.post(f"/api/v1/reports/recommendation/{created_id}", headers=headers)
    assert report.status_code == 200, report.text
    assert report.headers["content-type"].startswith("application/pdf")
    assert len(report.content) > 100


def test_tender_review_extracts_document_text():
    user, requirement = seed_data()
    login = client.post(
        "/api/v1/auth/login-json",
        json={"email": "admin@example.com", "password": "Password123!"},
    )
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    requirement_response = client.post(
        "/api/v1/requirements",
        json={
            "title": "Tender document review",
            "requirement_text": "Tender needs industrial safety helmets with impact protection for construction workers.",
            "product": "Industrial safety helmet",
            "product_category": "Industrial safety",
            "application": "Construction / industrial work",
            "industry": "Construction",
            "quantity": "500",
            "technical_requirements": "Impact protection; head protection; quantum shielding",
        },
        headers=headers,
    )
    req_id = requirement_response.json()["id"]
    analysed = client.post(f"/api/v1/requirements/{req_id}/analyse", headers=headers)
    assert analysed.status_code == 200, analysed.text

    response = client.post(
        f"/api/v1/tender-reviews?requirement_id={req_id}",
        files={"file": ("spec.txt", b"Safety helmets shall meet impact protection and head protection requirements for construction workers. Reference IS 2925:2019. Include quantum shielding.")},
        headers=headers,
    )
    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["summary"]
    assert payload["findings"]
    assert payload["document_name"] == "spec.txt"
    assert payload["extracted_text"]
    assert payload["referenced_standards"][0]["normalised"] == "is 2925"
    assert "quantum shielding" in payload["unresolved_requirements"]
    assert any(item["finding_type"] == "Reference may require verification" for item in payload["findings"])
    assert any(item["finding_type"] == "Unresolved technical requirement" for item in payload["findings"])
