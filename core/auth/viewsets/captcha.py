# auth/views/captcha.py
from rest_framework.views import APIView
from rest_framework.response import Response
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url


class CaptchaAPIView(APIView):
    def get(self, request):
        key = CaptchaStore.generate_key()
        return Response({
            "key": key,
            "image_url": captcha_image_url(key),
        })