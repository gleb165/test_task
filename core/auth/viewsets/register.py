from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from core.auth.serializers.register import RegisterSerializer
from core.auth.celery_tasks.tasks import send_activation_email
from core.auth.utils import generate_activation_link

class RegisterViewSet(viewsets.ModelViewSet):
    http_method_names = ['post']
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        res_data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        
        headers = self.get_success_headers(serializer.data)
        activation_link = generate_activation_link(user, request)
        
        send_activation_email.delay(
            user.email,
            "Подтверждение вашей почты",
            f"Перейдите по ссылке для активации аккаунта:\n{activation_link}",
        )
        return Response({'user': serializer.data, 'refresh': res_data['refresh'], 'token': res_data['access']}, status=status.HTTP_201_CREATED)