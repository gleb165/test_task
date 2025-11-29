import pytest
from core.comment.models import Comment,CommentAttachment
from core.fixtures.user import user_fixture
from core.fixtures.comment import comment_fixture
from rest_framework import status
from PIL import Image as PILImage

import io
import pytest
from PIL import Image
from rest_framework import status
# Create your tests here.


@pytest.mark.django_db
class TestCommentViewSet:
    endpoint = "/api/comments/"
    def test_list(self, client, user_fixture):
        client.force_authenticate(user=user_fixture)
        response = client.get(self.endpoint)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 1  # At least the fixture comment exists

    def test_update(self, client, user_fixture, comment_fixture):
        client.force_authenticate(user=user_fixture)
        data = {
            "text": "Updated comment body.",
            "author": user_fixture.public_id.hex
        }
        response = client.put(f"{self.endpoint}{comment_fixture.public_id}/", data)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['text'] == data['text']

    def test_delete(self, client, user_fixture, comment_fixture):
        client.force_authenticate(user=user_fixture)
        response = client.delete(f"{self.endpoint}{comment_fixture.public_id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
    def test_create(self, client, user_fixture):
        client.force_authenticate(user=user_fixture)
        img = create_image(200, 150, "JPEG")
        data = {
            "text": "This is a new test comment.",
            "author": user_fixture.public_id.hex,
            "file": img
        }
        response = client.post(self.endpoint, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['text'] == data['text']
        assert response.data['author']['id'] == data['author']
        
        
        
        
    def test_create_anonymous(self, client):
        data = {
            "text": "This is a new test comment.",
            "author":  "test_user"
        }
        response = client.post(self.endpoint, data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


    def test_update_anonymous(self, client, comment_fixture):
        data = {
            "text": "Updated comment text.",
            "author": "test_user"
        }
        response = client.put(f"{self.endpoint}{comment_fixture.public_id}/", data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
        
    def test_delete_anonymous(self, client, comment_fixture):
        response = client.delete(f"{self.endpoint}{comment_fixture.public_id}/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
        

def create_image(width=200, height=150, fmt="PNG"):
    """Создаёт изображение в памяти."""
    img = Image.new("RGB", (width, height), "blue")
    buffer = io.BytesIO()
    img.save(buffer, format=fmt)
    buffer.name = f"test.{fmt.lower()}"
    buffer.seek(0)
    return buffer


def create_text(size=50 * 1024):
    """Создаёт текстовый файл заданного размера."""
    buf = io.BytesIO(b"a" * size)
    buf.name = "test.txt"
    buf.seek(0)
    return buf

