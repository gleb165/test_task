
from core.fixtures.user import user_fixture



from rest_framework import status

class TestUserViewSet:
    endpoint = "/api/users/"
    
    
    def test_list(self, client, user_fixture):
        client.force_authenticate(user=user_fixture)
        response = client.get(self.endpoint)
        assert response.status_code == status.HTTP_200_OK
        
        
        
    def test_retrieve(self, client, user_fixture):
        client.force_authenticate(user=user_fixture)
        response = client.get(f"{self.endpoint}{user_fixture.public_id}/")
        assert response.status_code == status.HTTP_200_OK

    def test_create(self, client, user_fixture):
        client.force_authenticate(user=user_fixture)
        data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "first_name": "Test",
            "last_name": "User",
            "password": "testpassword"
        }
        response = client.post(self.endpoint, data)
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        
    def test_update(self, client, user_fixture):
        client.force_authenticate(user=user_fixture)
        data = {

            "first_name": "Test",
        }
        response = client.patch(f"{self.endpoint}{user_fixture.public_id}/", data)
        assert response.status_code == status.HTTP_200_OK
        
