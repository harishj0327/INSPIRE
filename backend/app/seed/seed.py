import os
from datetime import datetime

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import get_settings
from app.database import Base
from app.models.models import (
    Amendment,
    AuditLog,
    Certification,
    Project,
    Recommendation,
    Requirement,
    SavedRecommendation,
    Standard,
    StandardRelationship,
    StandardVersion,
    TenderReview,
    TestingRequirement,
    User,
)
from app.utils.security import hash_password

settings = get_settings()
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)


def seed_standards(db):
    standards = [
        {
            "is_number": "IS 2925",
            "title": "Industrial safety helmets - Specification",
            "description": "Specification for industrial safety helmets used in construction and industrial work.",
            "scope": "Covers design, impact resistance, ventilation and protection requirements for industrial helmets.",
            "category": "Industrial safety",
            "industry": "Construction",
            "product_type": "Industrial safety helmet",
            "application": "Construction / industrial work",
            "status": "active",
            "current_version": "2021",
            "year": 2021,
            "review_year": 2026,
            "keywords": "helmet, safety, impact protection, head protection, industrial",
            "technical_parameters": "Impact resistance, shell strength, chin strap, retention system",
            "source": "Demo dataset — verify against official BIS source.",
            "source_url": "https://bis.gov.in",
        },
        {
            "is_number": "IS 1554 (Part 1)",
            "title": "PVC insulated cables for working voltages up to and including 1100 V",
            "description": "Specification for electrical cables used in industrial power distribution.",
            "scope": "Provides insulation, conductor, and mechanical performance requirements for cables.",
            "category": "Electrical",
            "industry": "Electrical",
            "product_type": "Electrical cable",
            "application": "Industrial power distribution",
            "status": "active",
            "current_version": "2018",
            "year": 2018,
            "review_year": 2025,
            "keywords": "cable, electrical, conductor, insulation, power",
            "technical_parameters": "Voltage class, insulation thickness, conductor material, flexibility",
            "source": "Demo dataset — verify against official BIS source.",
            "source_url": "https://bis.gov.in",
        },
        {
            "is_number": "IS 3370",
            "title": "Concrete structures for storage of liquids",
            "description": "Standard for water storage and liquid containment structures.",
            "scope": "Includes concrete water tank design and durability requirements.",
            "category": "Water/storage",
            "industry": "Water infrastructure",
            "product_type": "Water storage tank",
            "application": "Municipal facility",
            "status": "active",
            "current_version": "2021",
            "year": 2021,
            "review_year": 2026,
            "keywords": "water tank, storage, municipal, concrete, durability",
            "technical_parameters": "Leakage resistance, structural integrity, durability, capacity",
            "source": "Demo dataset — verify against official BIS source.",
            "source_url": "https://bis.gov.in",
        },
        {
            "is_number": "IS 15298",
            "title": "Safety footwear — Specification",
            "description": "Specification for protective footwear used in industrial environments.",
            "scope": "Deals with design and performance requirements for industrial safety shoes.",
            "category": "PPE",
            "industry": "Industrial",
            "product_type": "Safety footwear",
            "application": "Industrial operations",
            "status": "active",
            "current_version": "2018",
            "year": 2018,
            "review_year": 2025,
            "keywords": "safety footwear, steel toe, slip resistance, industrial",
            "technical_parameters": "Slip resistance, toe protection, durability, sole performance",
            "source": "Demo dataset — verify against official BIS source.",
            "source_url": "https://bis.gov.in",
        },
    ]

    for standard_data in standards:
        standard = db.query(Standard).filter(Standard.is_number == standard_data['is_number']).first()
        if not standard:
            standard = Standard(**standard_data)
            db.add(standard)
            db.flush()
    db.commit()

    for standard in db.query(Standard).all():
        if not db.query(StandardVersion).filter_by(standard_id=standard.id, version=standard.current_version).first():
            db.add(StandardVersion(standard_id=standard.id, version=standard.current_version, year=standard.year, details='Prototype dataset for demo review'))
        if not db.query(Amendment).filter_by(standard_id=standard.id, amendment_number='Amd. 1').first():
            db.add(Amendment(standard_id=standard.id, amendment_number='Amd. 1', description='Information not available in the current knowledge base.', year=standard.year))
        if not db.query(TestingRequirement).filter_by(standard_id=standard.id, test_name='Mechanical performance test').first():
            db.add(TestingRequirement(standard_id=standard.id, test_name='Mechanical performance test', method='As per informed procurement review', description='Information not available in the current knowledge base.'))
        if not db.query(Certification).filter_by(standard_id=standard.id, cert_name='BIS conformity review').first():
            db.add(Certification(standard_id=standard.id, cert_name='BIS conformity review', requirement='Information not available in the current knowledge base.'))

    db.commit()

    standards_by_number = {s.is_number: s for s in db.query(Standard).all()}
    rels = [
        (standards_by_number['IS 2925'], standards_by_number['IS 15298'], 'SAFETY', 'Safety footwear and helmet requirements share protective head and body protection context.'),
        (standards_by_number['IS 1554 (Part 1)'], standards_by_number['IS 3370'], 'INSTALLATION', 'Cable and water infrastructure standards are often reviewed together in industrial projects.'),
    ]
    for source, target, rel_type, desc in rels:
        existing = db.query(StandardRelationship).filter_by(
            standard_id=source.id,
            related_standard_id=target.id,
            relationship_type=rel_type,
        ).first()
        if not existing:
            db.add(StandardRelationship(standard_id=source.id, related_standard_id=target.id, relationship_type=rel_type, description=desc))
    db.commit()


def seed_users(db):
    user = db.query(User).filter(User.email == 'admin@inspire.local').first()
    if not user:
        user = User(
            email='admin@inspire.local',
            full_name='Procurement Administrator',
            hashed_password=hash_password('Inspire123!'),
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def seed_requirements(db, user_id):
    reqs = [
        {
            'title': '500 industrial safety helmets for construction workers',
            'requirement_text': 'We need 500 industrial safety helmets for construction workers with impact protection for industrial use.',
            'product': 'Industrial safety helmet',
            'product_category': 'Industrial safety',
            'application': 'Construction / industrial work',
            'industry': 'Construction',
            'quantity': '500',
            'technical_requirements': 'Impact protection; industrial use; head protection',
            'status': 'analysed',
            'extracted_data': {'product': 'Industrial safety helmet', 'application': 'Construction / industrial work', 'safety_requirements': ['impact protection'], 'quantity': '500'},
        },
        {
            'title': 'Electrical cables for an industrial power distribution project',
            'requirement_text': 'We require electrical cables suitable for industrial power distribution with insulation and mechanical performance requirements.',
            'product': 'Electrical cable',
            'product_category': 'Electrical',
            'application': 'Industrial power distribution',
            'industry': 'Electrical',
            'quantity': 'Not specified',
            'technical_requirements': 'Electrical insulation; mechanical performance; working voltage',
            'status': 'draft',
            'extracted_data': {'product': 'Electrical cable', 'application': 'Industrial power distribution'},
        },
    ]
    for data in reqs:
        existing = db.query(Requirement).filter(Requirement.title == data['title']).first()
        if not existing:
            db.add(Requirement(user_id=user_id, **data))
    db.commit()


def seed_audit_logs(db, user_id):
    logs = [
        ('requirement_created', 'requirement', 'Created requirement for industrial safety helmet procurement'),
        ('requirement_analyzed', 'requirement', 'Requirement analysed and standards ranked'),
        ('recommendation_verified', 'recommendation', 'Recommendation reviewed against retrieved records'),
    ]
    for action, object_type, details in logs:
        existing = db.query(AuditLog).filter_by(
            user_id=user_id,
            action=action,
            object_type=object_type,
            details=details,
        ).first()
        if not existing:
            db.add(AuditLog(user_id=user_id, action=action, object_type=object_type, details=details))
    db.commit()


def run_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_users(db)
        seed_standards(db)
        user = db.query(User).filter(User.email == 'admin@inspire.local').first()
        if user:
            seed_requirements(db, user.id)
            seed_audit_logs(db, user.id)
    finally:
        db.close()


if __name__ == '__main__':
    run_seed()
    print('INSPIRE seed data loaded successfully.')
