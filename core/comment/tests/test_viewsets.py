
from core.fixtures.user import user_fixture
from core.fixtures.comment import comment_fixture
import pytest
from rest_framework import status

class TestCommentViewSet:
    endpoint = "/api"
    
    
    def test_list(self, client, user_fixture):
        client.force_authenticate(user=user_fixture)
        response = client.get(f"{self.endpoint}/comments/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 0
        
        
        
    def test_retrieve(self, client, user_fixture, comment_fixture):
        client.force_authenticate(user=user_fixture)
        response = client.get(f"{self.endpoint}/comments/{comment_fixture.public_id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["text"] == comment_fixture.text
        assert response.data["author"]["id"] == user_fixture.public_id.hex
        assert response.data["id"] == comment_fixture.public_id.hex

    def test_create(self, client, user_fixture):
        client.force_authenticate(user=user_fixture)
        data = {
            "text": "This is a new test comment.",
            "author": user_fixture.public_id.hex,
        }
        response = client.post(f"{self.endpoint}/comments/", data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['text'] == data['text']
        assert response.data['author']['id'] == data['author']

        
    def test_update(self, client, user_fixture, comment_fixture):
        client.force_authenticate(user=user_fixture)
        data = {
            "text": "Updated comment text.",
            "author": user_fixture.public_id.hex,
        }
        response = client.put(f"{self.endpoint}/comments/{comment_fixture.public_id}/", data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['text'] == data['text']
        assert response.data['author']['id'] == data['author']
        
        
    def test_delete(self, client, user_fixture, comment_fixture):
        client.force_authenticate(user=user_fixture)
        response = client.delete(f"{self.endpoint}/comments/{comment_fixture.public_id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        

    @pytest.mark.django_db
    def test_list_anonymous(self, client):
        response = client.get(f"{self.endpoint}/comments/")
        assert response.status_code == status.HTTP_200_OK
    def test_retrieve_anonymous(self, client, comment_fixture):
        response = client.get(f"{self.endpoint}/comments/{comment_fixture.public_id}/")
        assert response.status_code == status.HTTP_200_OK
    def test_create_anonymous(self, client):
        data = {
            "text": "This is a new test comment.",
            "author":  "test_user",
        }
        response = client.post(f"{self.endpoint}/comments/", data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    def test_update_anonymous(self, client, comment_fixture):
        data = {
            "text": "Updated comment text.",
            "author":  "test_user",
        }
        response = client.put(f"{self.endpoint}/comments/{comment_fixture.public_id}/", data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    def test_delete_anonymous(self, client, comment_fixture):
        response = client.delete(f"{self.endpoint}/comments/{comment_fixture.public_id}/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    

