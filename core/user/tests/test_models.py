import pytest
from core.user.models import User
# Create your tests here.

data_user = {
    "username": "testuser",
    "email": "testuser@example.com",
    "first_name": "Test",
    "last_name": "User",
    "password": "testpassword"
}

@pytest.mark.django_db
def test_create_user():
    user = User.objects.create_user(**data_user)
    assert user.username == data_user['username']
    assert user.email == data_user['email']
    assert user.first_name == data_user['first_name']
    assert user.last_name == data_user['last_name']
    assert user.check_password(data_user['password'])
    
    
    
data_superuser = {
    "username": "adminuser",
    "email": "adminuser@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "password": "adminpassword",
    "is_superuser": True,
    "is_staff": True
}

@pytest.mark.django_db
def test_create_superuser():
    superuser = User.objects.create_superuser(**data_superuser)
    assert superuser.username == data_superuser['username']
    assert superuser.email == data_superuser['email']
    assert superuser.first_name == data_superuser['first_name']
    assert superuser.last_name == data_superuser['last_name']
    assert superuser.check_password(data_superuser['password'])
    assert superuser.is_superuser
    assert superuser.is_staff