"""
URL configuration for CoreRoot project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from core.auth.viewsets.captcha import CaptchaAPIView
from core.auth.viewsets.activate import ActivateUser
urlpatterns = [
    path("api/", include([
        path("users/", include("core.user.routers")),
        path("auth/", include("core.auth.routers")),
        path("comments/", include("core.comment.routers")),
        path("captcha/", include("captcha.urls")),
        path("captcha/", CaptchaAPIView.as_view(), name="api-captcha"),
        path("auth/activate/<uidb64>/<token>/", ActivateUser.as_view()),
    ])),
]