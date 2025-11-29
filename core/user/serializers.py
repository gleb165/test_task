from rest_framework import serializers
from core.abstract.serializers import AbstractSerializers
from core.user.models import User

class UserSerializer(AbstractSerializers):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'is_superuser', 'created', 'updated', 'bio', 'avatar']
        read_only_fields = ['is_active']