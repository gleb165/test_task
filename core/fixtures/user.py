import pytest
from core.user.models import User
# Create your tests here.
user_data = {
    "username": "testuser",
    "email": "testuser@example.com",
    "first_name": "Test",
    "last_name": "User",
    "password": "testpassword"
}
@pytest.fixture
def user_fixture(db):
    user = User.objects.create_user(**user_data)
    user.set_password("testpassword")
    user.save()
    return user