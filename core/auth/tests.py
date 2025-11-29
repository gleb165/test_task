import pytest
from core.fixtures.user import user_fixture
from rest_framework import status
# Create your tests here.

@pytest.mark.django_db
class TestAuthenticationViewset:
    endpoint = "/api/auth/"
    
    def test_login(self, client, user_fixture):
        data = {
            "email": user_fixture.email,
            "password": "testpassword"
        }

        response = client.post(f"{self.endpoint}login/", data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['access']
        assert response.data['refresh']
        assert response.data['user']['id'] == user_fixture.public_id.hex
        assert response.data['user']['username'] == user_fixture.username
        assert response.data['user']['email'] == user_fixture.email
        
    def test_register(self, client):
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "first_name": "New",
            "last_name": "User",
            "password": "newpassword"
        }

        response = client.post(f"{self.endpoint}register/", data)
        assert response.status_code == status.HTTP_201_CREATED
        
        
    def test_refresh_token(self, client, user_fixture):
        login_data = {
            "email": user_fixture.email,
            "password": "testpassword"
        }
        login_response = client.post(f"{self.endpoint}login/", login_data)
        assert login_response.status_code == status.HTTP_200_OK
        
        refresh_token = login_response.data['refresh']

        refresh_data = {
            "refresh": refresh_token
        }

        response = client.post(f"{self.endpoint}refresh/", refresh_data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['access']