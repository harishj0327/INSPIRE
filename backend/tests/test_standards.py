from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_standards_search_and_list():
    register = client.post('/api/v1/auth/register', json={
        'email': 'search_user@example.com',
        'password': 'StrongPass123!',
        'full_name': 'Search User'
    })
    assert register.status_code in (200, 201, 400)

    login = client.post('/api/v1/auth/login-json', json={
        'email': 'search_user@example.com',
        'password': 'StrongPass123!'
    })
    if login.status_code == 200:
        headers = {'Authorization': f"Bearer {login.json()['access_token']}"}
        response = client.get('/api/v1/standards', headers=headers)
        assert response.status_code == 200
        assert isinstance(response.json(), list)

        search = client.get('/api/v1/search?q=helmet', headers=headers)
        assert search.status_code == 200
