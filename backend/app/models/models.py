from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    projects = relationship("Project", back_populates="user")
    requirements = relationship("Requirement", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="projects")
    requirements = relationship("Requirement", back_populates="project")


class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    requirement_text = Column(Text, nullable=False)
    product = Column(String(255), default="")
    product_category = Column(String(255), default="")
    application = Column(String(255), default="")
    industry = Column(String(255), default="")
    quantity = Column(String(100), default="")
    technical_requirements = Column(Text, default="")
    status = Column(String(50), default="draft")
    extracted_data = Column(JSON, default={})
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="requirements")
    project = relationship("Project", back_populates="requirements")
    documents = relationship("RequirementDocument", back_populates="requirement")
    recommendations = relationship("Recommendation", back_populates="requirement")
    tender_reviews = relationship("TenderReview", back_populates="requirement")


class RequirementDocument(Base):
    __tablename__ = "requirement_documents"

    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=False)
    storage_path = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    requirement = relationship("Requirement", back_populates="documents")


class Standard(Base):
    __tablename__ = "standards"

    id = Column(Integer, primary_key=True, index=True)
    is_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    scope = Column(Text, default="")
    category = Column(String(100), default="")
    industry = Column(String(100), default="")
    product_type = Column(String(150), default="")
    application = Column(String(150), default="")
    status = Column(String(50), default="active")
    current_version = Column(String(50), default="")
    year = Column(Integer, nullable=True)
    review_year = Column(Integer, nullable=True)
    keywords = Column(Text, default="")
    technical_parameters = Column(Text, default="")
    source = Column(String(255), default="Demo dataset — verify against official BIS source.")
    source_url = Column(String(255), default="")
    last_verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    versions = relationship("StandardVersion", back_populates="standard")
    relationships = relationship(
        "StandardRelationship",
        foreign_keys="StandardRelationship.standard_id",
        back_populates="standard",
    )
    related_from = relationship(
        "StandardRelationship",
        foreign_keys="StandardRelationship.related_standard_id",
        back_populates="related_standard",
    )
    testing_requirements = relationship("TestingRequirement", back_populates="standard")
    certifications = relationship("Certification", back_populates="standard")
    amendments = relationship("Amendment", back_populates="standard")


class StandardVersion(Base):
    __tablename__ = "standard_versions"

    id = Column(Integer, primary_key=True, index=True)
    standard_id = Column(Integer, ForeignKey("standards.id"), nullable=False)
    version = Column(String(50), nullable=False)
    year = Column(Integer, nullable=True)
    details = Column(Text, default="")

    standard = relationship("Standard", back_populates="versions")


class Amendment(Base):
    __tablename__ = "amendments"

    id = Column(Integer, primary_key=True, index=True)
    standard_id = Column(Integer, ForeignKey("standards.id"), nullable=False)
    amendment_number = Column(String(50), default="")
    description = Column(Text, default="")
    year = Column(Integer, nullable=True)

    standard = relationship("Standard", back_populates="amendments")


class StandardRelationship(Base):
    __tablename__ = "standard_relationships"

    id = Column(Integer, primary_key=True, index=True)
    standard_id = Column(Integer, ForeignKey("standards.id"), nullable=False)
    related_standard_id = Column(Integer, ForeignKey("standards.id"), nullable=True)
    relationship_type = Column(String(50), nullable=False)
    description = Column(Text, default="")

    standard = relationship("Standard", foreign_keys=[standard_id], back_populates="relationships")
    related_standard = relationship("Standard", foreign_keys=[related_standard_id], back_populates="related_from")


class TestingRequirement(Base):
    __tablename__ = "testing_requirements"

    id = Column(Integer, primary_key=True, index=True)
    standard_id = Column(Integer, ForeignKey("standards.id"), nullable=False)
    test_name = Column(String(255), nullable=False)
    method = Column(Text, default="")
    description = Column(Text, default="")

    standard = relationship("Standard", back_populates="testing_requirements")


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    standard_id = Column(Integer, ForeignKey("standards.id"), nullable=False)
    cert_name = Column(String(255), nullable=False)
    requirement = Column(Text, default="")

    standard = relationship("Standard", back_populates="certifications")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=False)
    standard_id = Column(Integer, ForeignKey("standards.id"), nullable=False)
    score = Column(Integer, default=0)
    why_it_matches = Column(Text, default="")
    relevant_elements = Column(Text, default="")
    explanation = Column(Text, default="")
    is_saved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    requirement = relationship("Requirement", back_populates="recommendations")
    standard = relationship("Standard")


class SavedRecommendation(Base):
    __tablename__ = "saved_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id"), nullable=False)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    notes = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    recommendation = relationship("Recommendation")
    requirement = relationship("Requirement")
    project = relationship("Project")


class TenderReview(Base):
    __tablename__ = "tender_reviews"

    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("requirements.id"), nullable=False)
    document_name = Column(String(255), default="")
    extracted_text = Column(Text, default="")
    summary = Column(Text, default="")
    findings = Column(JSON, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    requirement = relationship("Requirement", back_populates="tender_reviews")


class TenderFinding(Base):
    __tablename__ = "tender_findings"

    id = Column(Integer, primary_key=True, index=True)
    tender_review_id = Column(Integer, ForeignKey("tender_reviews.id"), nullable=False)
    finding_type = Column(String(50), default="")
    severity = Column(String(20), default="medium")
    title = Column(String(255), default="")
    description = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    object_type = Column(String(100), default="")
    object_id = Column(Integer, nullable=True)
    details = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="audit_logs")
