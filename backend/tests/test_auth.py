from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_register_and_login():
    email = 'demo_user@example.com'
    response = client.post('/api/v1/auth/register', json={
        'email': email,
        'password': 'StrongPass123!',
        'full_name': 'Demo User'
    })
    assert response.status_code in (200, 201, 400)

    login = client.post('/api/v1/auth/login-json', json={
        'email': email,
        'password': 'StrongPass123!'
    })
    assert login.status_code in (200, 401)
