from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.abstract.viewsets import AbstractViewSet
from core.user.models import User
from core.user.serializers import UserSerializer
# Create your views here.

class UserViewSet(AbstractViewSet):
    http_method_names = ['get', 'patch', 'put', 'delete']
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()
        return User.objects.exclude(is_superuser=True)
    
    def get_object(self):
        obj = User.objects.get_object_by_public_id(self.kwargs['pk'])
        self.check_object_permissions(self.request, obj)
        return obj