from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from core.abstract.viewsets import AbstractViewSet
from core.user.models import User
from core.user.serializers import UserSerializer
from rest_framework.response import Response
from rest_framework import status
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
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if not request.user.is_superuser and request.user != user:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)