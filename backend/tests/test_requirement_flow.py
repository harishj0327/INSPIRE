from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_create_requirement_and_analyse():
    register = client.post('/api/v1/auth/register', json={
        'email': 'flow_user@example.com',
        'password': 'StrongPass123!',
        'full_name': 'Flow User'
    })
    assert register.status_code in (200, 201, 400)

    token = client.post('/api/v1/auth/login-json', json={
        'email': 'flow_user@example.com',
        'password': 'StrongPass123!'
    })
    if token.status_code == 200:
        headers = {'Authorization': f"Bearer {token.json()['access_token']}"}
        req = client.post('/api/v1/requirements', json={
            'title': 'Industrial Safety Helmet Procurement',
            'requirement_text': 'We need 500 industrial safety helmets for construction workers with impact protection.',
            'product': 'Industrial safety helmet',
            'product_category': 'Industrial safety',
            'application': 'Construction / industrial work',
            'quantity': '500',
            'technical_requirements': 'Impact protection'
        }, headers=headers)
        assert req.status_code == 200
        requirement_id = req.json()['id']
        analyse = client.post(f'/api/v1/requirements/{requirement_id}/analyse', headers=headers)
        assert analyse.status_code == 200
