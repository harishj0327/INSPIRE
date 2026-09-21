from __future__ import annotations

from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool = True


class ProjectCreate(BaseModel):
    name: str
    description: str = ""


class RequirementCreate(BaseModel):
    title: str
    requirement_text: str
    product: str = ""
    product_category: str = ""
    application: str = ""
    industry: str = ""
    quantity: str = ""
    technical_requirements: str = ""
    project_id: Optional[int] = None


class RequirementOut(BaseModel):
    id: int
    title: str
    requirement_text: str
    product: str = ""
    product_category: str = ""
    application: str = ""
    industry: str = ""
    quantity: str = ""
    technical_requirements: str = ""
    status: str = "draft"
    extracted_data: dict = {}
    user_id: int
    project_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class StandardOut(BaseModel):
    id: int
    is_number: str
    title: str
    description: str = ""
    scope: str = ""
    category: str = ""
    industry: str = ""
    product_type: str = ""
    application: str = ""
    status: str = "active"
    current_version: str = ""
    year: Optional[int] = None
    review_year: Optional[int] = None
    keywords: str = ""
    technical_parameters: str = ""
    source: str = "Demo dataset — verify against official BIS source."
    source_url: str = ""
    last_verified_at: Optional[datetime] = None


class RecommendationOut(BaseModel):
    id: int
    standard_id: int
    score: int
    why_it_matches: str
    relevant_elements: str
    explanation: str
    standard: StandardOut


class TenderReviewCreate(BaseModel):
    requirement_id: int
    document_name: str = "sample.docx"
    extracted_text: str = ""
    summary: str = ""


class TenderFindingOut(BaseModel):
    id: int
    finding_type: str
    severity: str
    title: str
    description: str


class SearchResultItem(BaseModel):
    type: str
    id: int
    title: str
    score: float
    summary: str


class SearchRequest(BaseModel):
    query: str
    limit: int = 10
