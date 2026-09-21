from fastapi.testclient import TestClient

from app.main import app
from app.services.recommendation_service import DemoProvider, get_provider


client = TestClient(app)


def test_demo_provider_has_consistent_contract_without_key():
    provider = get_provider()
    assert isinstance(provider, DemoProvider)
    extracted = provider.extract_requirement("500 industrial safety helmets for construction workers")
    assert extracted["quantity"] == "500"
    ranked = provider.rank_standards(extracted, [{"id": 1, "is_number": "IS 2925", "title": "Industrial safety helmet", "keywords": "helmet safety", "description": "industrial helmet", "category": "Industrial safety", "application": "construction", "product_type": "Industrial safety helmet", "technical_parameters": "impact", "scope": "head protection"}])
    assert ranked[0]["is_number"] == "IS 2925"
    assert provider.explain_standard(extracted, ranked[0])
